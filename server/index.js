const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http'); 
const { Server } = require('socket.io'); 
const Message = require('./models/Message'); 

// Import Routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// --- 1. DEFINE ALLOWED ORIGINS (CRITICAL FIX) ---
const allowedOrigins = [
  "http://localhost:5173",             // Local Frontend
  "http://localhost:5000",             // Local Backend (Postman/Self)
  "https://alumniconnect-ub5c.onrender.com", // Your Deployed Backend
  "https://alumni-connect-lovat.vercel.app/"   // <--- OR HERE (If hosted on Render)
];

// --- 2. CONFIGURE SOCKET.IO CORS ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true // Allow cookies/headers
  }
});

// Default is 100kb. We increase it to 50mb for Base64 Images.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. CONFIGURE EXPRESS CORS ---
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// --- ROUTE CONNECTIONS ---
app.use('/api/auth', authRoutes);       
app.use('/api/jobs', jobRoutes);        
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/chat', chatRoutes);

// --- 4. REAL-TIME CHAT & NOTIFICATION LOGIC ---
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Join a specific room (User ID)
  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their room.`);
    }
  });

  // Handle Sending Messages (Chat)
  socket.on('send_message', async (data) => {
    const { senderId, receiverId, message } = data;
    
    // A. Save to Database
    try {
      const newMessage = new Message({ senderId, receiverId, message });
      await newMessage.save();
      console.log("Message saved to DB");

      // B. Emit to Receiver (Real-time)
      io.to(receiverId).emit('receive_message', data);
      
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle Notifications (Mentorship Updates)
  socket.on('send_notification', (data) => {
    console.log(`Notification sent to ${data.receiverId}`);
    io.to(data.receiverId).emit('receive_notification');
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

// Health Check Route
app.get('/', (req, res) => {
    res.send("AlumniConnect Server is Running!");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));