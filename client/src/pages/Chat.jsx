import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api, { SERVER_URL } from '../utils/api'; // 1. Import SERVER_URL
import Sidebar from '../components/Sidebar';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

// 2. Use the Dynamic URL
const socket = io.connect(SERVER_URL);

const Chat = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  
  // Safe User Parsing (prevents crash if localStorage is empty)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      return null;
    }
  });

  const [receiverData, setReceiverData] = useState(null); 
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 2. Fetch Chat History & Receiver Details on Load
  useEffect(() => {
    if (!user || !receiverId) return;

    const fetchChatData = async () => {
      try {
        // Fetch Receiver Details
        const userRes = await api.get(`/auth/users?id=${receiverId}`);
        // Handle array vs single object response
        const foundUser = Array.isArray(userRes.data) 
          ? userRes.data.find(u => u._id === receiverId) 
          : userRes.data;
          
        if (foundUser) setReceiverData(foundUser);

        // Fetch Message History
        const historyRes = await api.get(`/chat/${receiverId}`);
        setMessageList(historyRes.data);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to load chat", err);
      }
    };

    fetchChatData();

    // Socket: Join Room (Use safe optional chaining)
    if (user?._id) {
        socket.emit("join_room", user._id);
    }

    // Socket: Listen for messages
    const handleReceiveMessage = (data) => {
      if (data.senderId === receiverId || data.senderId === user._id) {
        setMessageList((list) => [...list, data]);
        scrollToBottom();
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    // Re-join on reconnect (Important for mobile/instability)
    socket.on("connect", () => {
        if(user?._id) socket.emit("join_room", user._id);
    });

    return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("connect");
    };
  }, [user, receiverId]);

  // 3. Auto-scroll on new message
  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  // 4. Send Message Logic
  const sendMessage = async () => {
    if (message.trim() === "") return;

    const messageData = {
      senderId: user._id,
      receiverId: receiverId,
      message: message,
      timestamp: new Date(),
    };

    // Emit to Server
    await socket.emit("send_message", messageData);
    
    // Add to UI instantly
    setMessageList((list) => [...list, messageData]);
    setMessage("");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ height: '100vh', background: '#eef2f6', display: 'flex', overflow: 'hidden' }}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div style={{ 
        marginLeft: isSidebarOpen ? '290px' : '0', 
        width: isSidebarOpen ? 'calc(100% - 290px)' : '100%',
        transition: 'all 0.4s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        
        {/* Chat Header */}
        <div style={{ background: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 10px rgba(0,0,0,0.05)', zIndex: 10 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#555' }}><ArrowLeft size={20} /></button>
             
             {/* Avatar: Shows Image if available, otherwise shows Initials */}
             <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f284e', border: '2px solid #e5e7eb' }}>
               {receiverData?.profileImage ? (
                  <img 
                    src={receiverData.profileImage} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
               ) : (
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                    {receiverData?.name?.charAt(0) || "?"}
                  </span>
               )}
             </div>
             
             <div>
               <h3 style={{ margin: 0, fontSize: '16px', color: '#0f284e', fontWeight: 'bold' }}>
                 {receiverData ? receiverData.name : "Loading..."}
               </h3>
               <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                 <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span> Online
               </span>
             </div>
           </div>
           
           <div style={{ display: 'flex', gap: '20px', color: '#0f284e' }}>
             <Phone size={20} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => toast.success('Call feature coming soon!')} />
             <Video size={22} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => toast.success('Video call feature coming soon!')} />
             <MoreVertical size={20} style={{ cursor: 'pointer', opacity: 0.7 }} />
           </div>
        </div>

        {/* Chat Body */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundImage: 'linear-gradient(to top, #dfe9f3 0%, white 100%)' }}>
            {messageList.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
                    <p>Start the conversation!</p>
                </div>
            ) : (
                messageList.map((msg, index) => {
                  const isMe = msg.senderId === user._id;
                  
                  return (
                    <div key={index} style={{ 
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '65%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}>
                      
                      {/* SENDER NAME (Only shows for 'Them') */}
                      {!isMe && (
                        <span style={{ fontSize: '11px', color: '#666', marginBottom: '3px', marginLeft: '5px' }}>
                          {receiverData ? receiverData.name : "Alumni"}
                        </span>
                      )}

                      <div style={{ 
                        padding: '12px 18px', 
                        borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px', 
                        background: isMe ? '#0f284e' : '#ffffff', 
                        color: isMe ? 'white' : '#333',
                        fontSize: '15px',
                        lineHeight: '1.5',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        position: 'relative'
                      }}>
                        {msg.message}
                      </div>
                      
                      <div style={{ fontSize: '10px', color: '#888', marginTop: '4px', margin: isMe ? '0 5px 0 0' : '0 0 0 5px' }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  );
                })
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '20px', background: 'white', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid #eee' }}>
            <input 
              type="text" 
              value={message} 
              placeholder="Type your message..." 
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={{ 
                flex: 1, padding: '15px 20px', borderRadius: '30px', 
                border: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', background: '#f8f9fa' 
              }} 
            />
            <button onClick={sendMessage} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#0f284e', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(15, 40, 78, 0.3)' }}>
              <Send size={20} style={{ marginLeft: '3px' }} /> 
            </button>
        </div>

      </div>
    </div>
  );
};

export default Chat;