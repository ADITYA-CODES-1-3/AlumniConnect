import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api, { SERVER_URL } from '../utils/api'; 
import Sidebar from '../components/Sidebar';
import { Send, ArrowLeft, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import toast from 'react-hot-toast';

// Initialize Socket
const socket = io.connect(SERVER_URL);

const Chat = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
  });
  const [receiverData, setReceiverData] = useState(null); 
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  
  // Responsive Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const messagesEndRef = useRef(null);

  // --- RESPONSIVE SIDEBAR HANDLER ---
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) setIsSidebarOpen(false);
        else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- SCROLL HANDLING ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  // --- DATA FETCHING & SOCKETS ---
  useEffect(() => {
    if (!user || !receiverId) return;

    const fetchChatData = async () => {
      try {
        // 1. Get Receiver Info
        const userRes = await api.get(`/auth/users?id=${receiverId}`);
        const foundUser = Array.isArray(userRes.data) ? userRes.data.find(u => u._id === receiverId) : userRes.data;
        if (foundUser) setReceiverData(foundUser);

        // 2. Get Chat History
        const historyRes = await api.get(`/chat/${receiverId}`);
        setMessageList(historyRes.data);
      } catch (err) {
        console.error("Failed to load chat", err);
        toast.error("Could not load chat history");
      }
    };

    fetchChatData();

    // Socket Connection
    if (user?._id) socket.emit("join_room", user._id);

    const handleReceiveMessage = (data) => {
      if (data.senderId === receiverId || data.senderId === user._id) {
        setMessageList((list) => [...list, data]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    
    // Re-join logic for stability
    socket.on("connect", () => {
        if(user?._id) socket.emit("join_room", user._id);
    });

    return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("connect");
    };
  }, [user, receiverId]);

  // --- SEND MESSAGE ---
  const sendMessage = async () => {
    if (message.trim() === "") return;

    const messageData = {
      senderId: user._id,
      receiverId: receiverId,
      message: message,
      timestamp: new Date(),
    };

    try {
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  // --- DATE & TIME FORMATTERS ---
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageDateGroup = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Helper to group messages for display
  const groupedMessages = messageList.reduce((groups, msg) => {
    const date = getMessageDateGroup(msg.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (!user) return <div style={{display:'flex',justifyContent:'center',marginTop:'50px'}}>Loading...</div>;

  return (
    <div style={{ height: '100vh', background: '#eef2f6', display: 'flex', overflow: 'hidden' }}>
      
      {/* Sidebar Wrapper */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 100, 
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main Chat Area */}
      <div style={{ 
        marginLeft: isSidebarOpen && window.innerWidth > 768 ? '290px' : '0', 
        width: isSidebarOpen && window.innerWidth > 768 ? 'calc(100% - 290px)' : '100%',
        transition: 'all 0.4s ease',
        display: 'flex', flexDirection: 'column', height: '100%',
        position: 'relative'
      }}>
        
        {/* --- HEADER --- */}
        <div style={{ 
            height: '70px', background: '#fff', padding: '0 20px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            boxShadow: '0 1px 15px rgba(0,0,0,0.04)', zIndex: 10, flexShrink: 0 
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <button onClick={() => navigate(-1)} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#555', padding: '8px', borderRadius: '50%' }}>
                <ArrowLeft size={20} />
             </button>
             
             <div style={{ position: 'relative' }}>
               <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f284e', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                 {receiverData?.profileImage ? (
                    <img src={receiverData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                      {receiverData?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                 )}
               </div>
               {/* Online Dot */}
               <span style={{ position: 'absolute', bottom: '2px', right: '0', width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', border: '2px solid white' }}></span>
             </div>
             
             <div>
               <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937', fontWeight: '700' }}>
                 {receiverData ? receiverData.name : "Loading..."}
               </h3>
               <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                 Online
               </span>
             </div>
           </div>
           
           <div style={{ display: 'flex', gap: '15px', color: '#0f284e' }}>
             <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Phone size={20} /></button>
             <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Video size={22} /></button>
             <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><MoreVertical size={20} /></button>
           </div>
        </div>

        {/* --- CHAT BODY (SCROLLABLE) --- */}
        <div style={{ 
            flex: 1, 
            padding: '20px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px', 
            backgroundColor: '#eef2f6',
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}>
            {messageList.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', opacity: 0.8 }}>
                    <div style={{background: '#fff', padding: '20px', borderRadius: '50%', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
                        <Send size={32} color="#0f284e" />
                    </div>
                    <p style={{fontWeight: '500'}}>Start the conversation with {receiverData?.name}!</p>
                </div>
            ) : (
                Object.keys(groupedMessages).map((date, groupIndex) => (
                    <div key={groupIndex}>
                        {/* Date Divider */}
                        <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
                            <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '11px', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                                {date}
                            </span>
                        </div>

                        {/* Messages in this group */}
                        {groupedMessages[date].map((msg, index) => {
                           const isMe = msg.senderId === user._id;
                           return (
                            <div key={index} style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: isMe ? 'flex-end' : 'flex-start',
                              marginBottom: '8px'
                            }}>
                              <div style={{ 
                                maxWidth: '70%', 
                                padding: '12px 16px', 
                                borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px', 
                                background: isMe ? '#0f284e' : '#ffffff', 
                                color: isMe ? 'white' : '#1f2937',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                boxShadow: isMe ? '0 4px 15px rgba(15, 40, 78, 0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
                                border: isMe ? 'none' : '1px solid #f3f4f6',
                                wordWrap: 'break-word'
                              }}>
                                {msg.message}
                              </div>
                              <span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', margin: isMe ? '0 4px 0 0' : '0 0 0 4px', fontWeight: '500' }}>
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                           );
                        })}
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* --- INPUT AREA (FIXED BOTTOM) --- */}
        <div style={{ 
            padding: '15px 20px', background: 'white', display: 'flex', alignItems: 'center', gap: '12px', 
            borderTop: '1px solid #f3f4f6', flexShrink: 0
        }}>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }} onClick={() => toast('Attachments coming soon!')}>
                <Paperclip size={20} />
            </button>
            
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={message} 
                  placeholder="Type a message..." 
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  style={{ 
                    width: '100%', padding: '12px 45px 12px 20px', borderRadius: '30px', 
                    border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px', 
                    background: '#f9fafb', transition: 'all 0.2s', color: '#333'
                  }} 
                  onFocus={(e) => e.target.style.background = '#fff'}
                  onBlur={(e) => e.target.style.background = '#f9fafb'}
                />
                <button style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    <Smile size={20} />
                </button>
            </div>

            <button 
                onClick={sendMessage} 
                disabled={!message.trim()}
                style={{ 
                    width: '45px', height: '45px', borderRadius: '50%', 
                    background: message.trim() ? '#0f284e' : '#e5e7eb', 
                    color: 'white', border: 'none', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: message.trim() ? 'pointer' : 'default', 
                    transition: 'all 0.3s',
                    boxShadow: message.trim() ? '0 4px 10px rgba(15, 40, 78, 0.3)' : 'none'
                }}
            >
              <Send size={18} style={{ marginLeft: '2px' }} /> 
            </button>
        </div>

      </div>
    </div>
  );
};

export default Chat;