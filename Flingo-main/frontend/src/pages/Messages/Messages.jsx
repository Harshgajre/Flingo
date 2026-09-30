import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, Send, Phone, Video, ArrowLeft, MessageCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { useSocketStore } from '../../store/socketStore';
import { useLocation } from 'react-router-dom';

const ChatSkeleton = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
    className="p-3 rounded-2xl flex items-center gap-3 mb-1"
  >
    <div className="relative shrink-0">
      <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 animate-pulse" />
    </div>
    <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center py-1">
      <div className="w-1/2 h-3.5 rounded-full bg-black/5 dark:bg-white/5 animate-pulse" />
      <div className="w-3/4 h-3 rounded-full bg-black/5 dark:bg-white/5 animate-pulse" />
    </div>
  </motion.div>
);

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuthStore();
  const { socket, onlineUsers } = useSocketStore();
  const scrollRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages/conversations', { credentials: 'include' });
        const data = await res.json();
        
        let loadedConvos = data;
        
        // Handle incoming target user from profile
        if (location.state?.targetUser) {
          const targetUser = location.state.targetUser;
          const exists = data.find(c => c.user._id === targetUser._id);
          
          if (exists) {
            setActiveChat(exists);
          } else {
            const newConvo = {
              _id: 'temp_' + targetUser._id,
              user: targetUser,
            };
            loadedConvos = [newConvo, ...data];
            setActiveChat(newConvo);
          }
          // Clear location state
          window.history.replaceState({}, document.title);
        }
        
        setConversations(loadedConvos);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${activeChat.user._id}`, { credentials: 'include' });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeChat]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        if (activeChat && activeChat.user._id === message.senderId) {
          setMessages(prev => [...prev, message]);
        }
      });
      return () => socket.off('newMessage');
    }
  }, [socket, activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const res = await fetch(`/api/messages/send/${activeChat.user._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: newMessage })
      });
      const data = await res.json();
      setMessages([...messages, data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full h-full flex overflow-hidden">
      {/* Left Pane - Chat List */}
      <div className={cn(
        "w-full lg:w-[380px] flex-shrink-0 flex flex-col border-r border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-sm",
        activeChat !== null ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 sm:p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <h1 className="text-2xl font-bold">Messages</h1>
          <button className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500/20 transition-colors">
            <Edit size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full bg-black/5 dark:bg-white/5 rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-[15px]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-2 sm:p-4">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((item, index) => (
              <ChatSkeleton key={item} delay={index * 0.05} />
            ))
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark mb-3">
                <MessageCircle size={24} />
              </div>
              <p className="text-sm font-medium">No messages found</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <div 
                key={convo._id}
                onClick={() => setActiveChat(convo)}
                className="p-3 rounded-2xl flex items-center gap-3 mb-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    {convo.user?.profilePic && <img src={convo.user.profilePic} alt="avatar" className="w-full h-full object-cover" />}
                  </div>
                  {onlineUsers.includes(convo.user._id) && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background-light dark:border-background-dark rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{convo.user?.name}</h3>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Active Chat */}
      <div className={cn(
        "flex-1 flex flex-col bg-background-light dark:bg-background-dark relative",
        activeChat === null ? "hidden lg:flex" : "flex"
      )}>
        {activeChat ? (
          <>
            <div className="h-20 border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 sm:px-6 shrink-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <button 
                  className="lg:hidden p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark"
                  onClick={() => setActiveChat(null)}
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0 overflow-hidden">
                  {activeChat.user?.profilePic && <img src={activeChat.user.profilePic} alt="avatar" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h2 className="font-semibold leading-tight">{activeChat.user?.name}</h2>
                  <p className="text-xs text-green-500 font-medium">
                    {onlineUsers.includes(activeChat.user._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-rose-500 transition-colors">
                  <Phone size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-rose-500 transition-colors">
                  <Video size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col" ref={scrollRef}>
               {messages.map((msg, index) => {
                 const isMe = msg.senderId === user._id;
                 return (
                   <div key={index} className={cn("flex max-w-[70%]", isMe ? "ml-auto" : "")}>
                     <div className={cn("px-4 py-2 rounded-2xl", isMe ? "bg-rose-500 text-white rounded-br-none" : "bg-gray-200 dark:bg-gray-800 rounded-bl-none")}>
                       <p className="text-[15px]">{msg.message}</p>
                     </div>
                   </div>
                 );
               })}
            </div>

            <div className="p-4 sm:p-6 pb-24 lg:pb-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark absolute bottom-0 left-0 right-0 lg:static">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-full p-2 pl-4">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent outline-none text-[15px]"
                />
                <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-50">
                  <Send size={18} className="ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full">
            <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
              <MessageCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-sm">
              Select a conversation from the sidebar or start a new chat to connect with your flock.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
