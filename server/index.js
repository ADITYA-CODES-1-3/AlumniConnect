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
connectDB();

const app = express();
const server = http.createServer(app);

// --- 1. CORS CONFIGURATION (THE FIX) ---
const allowedOrigins = [
  "http://localhost:5173",                      // For Local Development
  "https://alumniconnect.me",
  "https://alumniconnect-ub5c.onrender.com"     // For Production (Vercel)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- 2. SOCKET.IO CORS ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use the same allowed list
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Default is 100kb. We increase it to 50mb for Base64 Images.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- ROUTE CONNECTIONS ---
app.use('/api/auth', authRoutes);       
app.use('/api/jobs', jobRoutes);        
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/chat', chatRoutes);

// --- 4. REAL-TIME CHAT & NOTIFICATION LOGIC ---
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their room.`);
    }
  });

  socket.on('send_message', async (data) => {
    const { senderId, receiverId, message } = data;
    try {
      const newMessage = new Message({ senderId, receiverId, message });
      await newMessage.save();
      io.to(receiverId).emit('receive_message', data);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on('send_notification', (data) => {
    console.log(`Notification sent to ${data.receiverId}`);
    io.to(data.receiverId).emit('receive_notification');
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

app.get('/', (req, res) => {
    res.send("AlumniConnect Server is Running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));