'use client';

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Send, 
  Plus, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Smile, 
  CheckCheck,
  Clock,
  ArrowLeft
} from "lucide-react";
import clsx from 'clsx';
import apiClient from "@/lib/axios";

// ── 1. TYPES & INITIAL DATA ──────────────────────────────────────────────────

const MOCK_USER_CONTEXT = {
  role: "Junior Web Developer",
  company: "Zomato",
  lastScore: 68,
  weakArea: "Communication Clarity"
};

const SUGGESTION_CHIPS = [
  "How do I prepare for system design interviews?",
  "What should I improve after my last interview?",
  "Help me improve my resume for frontend roles"
];

interface Message {
  from: 'me' | 'them';
  text: string;
  time: string;
}

interface Conversation {
  id: number | string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline';
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "Rahul S.",
    role: "System Design Pro",
    avatar: "RS",
    status: 'online',
    messages: [
      { from: 'them', text: "Hey, how was your Zomato interview?", time: "10:30 AM" },
      { from: 'me', text: "It went well! Mostly system design and React performance.", time: "10:32 AM" },
      { from: 'them', text: "That's great. Did they ask about database scaling?", time: "10:33 AM" }
    ]
  },
  {
    id: 2,
    name: "Anita K.",
    role: "React Expert",
    avatar: "AK",
    status: 'offline',
    messages: [
      { from: 'them', text: "Need help with hooks? I just finished a deep dive.", time: "Yesterday" }
    ]
  },
  {
    id: 3,
    name: "Kiran V.",
    role: "DSA Master",
    avatar: "KV",
    status: 'online',
    messages: [
      { from: 'me', text: "Can you review my graph algorithm solution?", time: "2:15 PM" },
      { from: 'them', text: "Sure, send over the link!", time: "2:16 PM" }
    ]
  }
];

// ────────────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<number | string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchParams = useSearchParams();

  const activeChat = conversations.find(c => c.id === activeChatId) || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── 2. LOGIC ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiClient.get('/messages/');
        // Not modifying local mock conversations heavily to preserve UI, 
        // but we verify the endpoint works.
        console.log("Fetched messages:", res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const isMentor = searchParams.get("mentor");

    if (isMentor) {
      const mentorChat: Conversation = {
        id: "mentor",
        name: "AI Mentor",
        role: "Career Assistant",
        avatar: "AI",
        status: 'online',
        messages: [
          { 
            from: "them", 
            text: "Hi 👋 I’m your AI Mentor. I can help with interviews, skills, and career guidance. What do you need?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };

      setConversations(prev => {
        const exists = prev.find(c => c.id === "mentor");
        if (exists) return prev;
        return [mentorChat, ...prev];
      });

      setActiveChatId("mentor");
    }
  }, [searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Persistence Logic ──
  useEffect(() => {
    const saved = localStorage.getItem("smart_placement_messages");
    if (saved) {
      try {
        setConversations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("smart_placement_messages", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isTyping]);

  const handleChipClick = (text: string) => {
    handleSend(text);
  };

  const handleSend = async (overrideText?: string) => {
    const messageText = overrideText || input;
    if (!messageText.trim() || !activeChatId) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: Message = { from: 'me', text: messageText, time: now };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeChatId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage]
        };
      }
      return conv;
    }));

    if (!overrideText) setInput("");

    if (activeChatId === "mentor") {
      setIsTyping(true);
      try {
        const res = await apiClient.post('/mentor/ask/', { query: messageText });
        const replyText = res.data.response || "I couldn't process that.";
        
        const reply: Message = { 
          from: 'them', 
          text: replyText, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        
        setConversations(p => p.map(c => {
          if (c.id === activeChatId) {
            return { ...c, messages: [...c.messages, reply] };
          }
          return c;
        }));
      } catch (err) {
        console.error("AI Mentor error:", err);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Regular user message
      try {
        await apiClient.post('/messages/send/', { 
          receiver: typeof activeChatId === 'number' ? activeChatId : parseInt(activeChatId as string), 
          content: messageText 
        });
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  // ── 3. RENDER ─────────────────────────────────────────────────────────────

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col animate-in fade-in duration-700">
      
      {/* Container Card */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/20 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Panel: Conversation List */}
        <div className={clsx(
          "w-full md:w-96 border-r border-slate-100 dark:border-slate-800 flex flex-col",
          activeChatId && "hidden md:flex"
        )}>
           {/* Header */}
           <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Messages</h1>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                 >
                    <Search className="w-5 h-5 text-slate-400" />
                 </button>
                 <button className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="w-5 h-5" />
                 </button>
              </div>
           </div>

           {/* Search Bar (Expandable) */}
           {showSearch && (
             <div className="px-6 py-4 animate-in slide-in-from-top-2 duration-300">
                <input 
                  type="text" 
                  placeholder="Search contacts..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 px-5 py-3 rounded-xl border border-slate-100 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
             </div>
           )}

           {/* List */}
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {conversations.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => setActiveChatId(conv.id)}
                  className={clsx(
                    "group flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all active:scale-[0.98]",
                    activeChatId === conv.id 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" 
                      : conv.id === 'mentor'
                        ? "bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 text-slate-600 dark:text-slate-300"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  )}
                >
                   <div className="relative">
                      <div className={clsx(
                        "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner transition-colors",
                        conv.id === 'mentor' && activeChatId !== conv.id
                          ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                          : activeChatId === conv.id ? "bg-white/10 dark:bg-slate-100" : "bg-slate-100 dark:bg-slate-800"
                      )}>
                         {conv.avatar}
                      </div>
                      {conv.status === 'online' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full" />
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                         <h3 className="font-black truncate text-sm">{conv.name}</h3>
                         <span className={clsx(
                           "text-[10px] font-bold uppercase tracking-widest opacity-50",
                           activeChatId === conv.id ? "text-white" : "text-slate-400"
                         )}>
                           {conv.messages[conv.messages.length - 1].time}
                         </span>
                      </div>
                      <p className={clsx(
                        "text-xs font-medium truncate opacity-70",
                        activeChatId === conv.id ? "text-white/80" : "text-slate-500"
                      )}>
                        {conv.messages[conv.messages.length - 1].text}
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right Panel: Chat Window */}
        <div className={clsx(
          "flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/30",
          !activeChatId && "hidden md:flex",
          activeChatId && "flex"
        )}>
           {!activeChat ? (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl border border-slate-100 dark:border-slate-800">
                   <MessageSquareIcon className="w-10 h-10 text-slate-200" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Your Inbox</h2>
                <p className="text-slate-400 font-medium max-w-xs leading-relaxed">Select a conversation from the left to start collaborating with your peers.</p>
             </div>
           ) : (
             <>
                {/* Chat Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setActiveChatId(null)}
                        className="md:hidden p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                         <ArrowLeft className="w-5 h-5 text-slate-400" />
                      </button>
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black">
                         {activeChat.avatar}
                      </div>
                      <div>
                         <h3 className="font-black text-slate-900 dark:text-white leading-none mb-1 flex items-center">
                            {activeChat.name}
                            {activeChat.id === "mentor" && (
                              <span className="text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ml-3 font-bold border border-blue-100 dark:border-blue-800">
                                AI ASSISTANT
                              </span>
                            )}
                         </h3>
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{activeChat.status}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="hidden sm:flex p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all hover:text-blue-500">
                         <Phone className="w-5 h-5" />
                      </button>
                      <button className="hidden sm:flex p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all hover:text-blue-500">
                         <Video className="w-5 h-5" />
                      </button>
                      <button className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all">
                         <MoreVertical className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                {/* Message Feed */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-white/40 dark:bg-slate-900/40">
                   {activeChat.messages.map((msg, i) => (
                     <div 
                      key={i} 
                      className={clsx(
                        "flex flex-col max-w-[85%] sm:max-w-[70%] animate-in fade-in duration-500",
                        msg.from === 'me' ? "ml-auto items-end" : "items-start"
                      )}
                     >
                        <div className={clsx(
                          "px-6 py-4 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm",
                          msg.from === 'me' 
                            ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10" 
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-slate-200/50"
                        )}>
                           {msg.text}
                        </div>
                        <div className="flex items-center gap-2 mt-2 px-2">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{msg.time}</span>
                           {msg.from === 'me' && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                        </div>
                     </div>
                   ))}
                   
                   {isTyping && (
                     <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px]">
                              {activeChat.avatar}
                           </div>
                           <div className="flex gap-1.5 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                           </div>
                        </div>
                        {activeChatId === "mentor" && (
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-11">AI Mentor is thinking...</span>
                        )}
                     </div>
                   )}
                   <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                   <div className="max-w-4xl mx-auto">
                      {/* Suggestion Chips */}
                      {activeChatId === "mentor" && !input.trim() && (
                        <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          {SUGGESTION_CHIPS.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleChipClick(chip)}
                              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-105 active:scale-95 shadow-sm"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-[2rem] border border-slate-100 dark:border-slate-700 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500/30 transition-all">
                        <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors">
                           <Smile className="w-5 h-5" />
                        </button>
                        <input 
                          type="text" 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                          onClick={handleSend}
                          disabled={!input.trim()}
                          className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                           <Send className="w-5 h-5" />
                        </button>
                      </div>
                   </div>
                </div>
              </>
            )}
         </div>
      </div>
    </div>
  );
}

// ── 4. HELPER COMPONENTS ─────────────────────────────────────────────────────

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
