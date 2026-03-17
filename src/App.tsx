import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Shield, History, Loader2, Trash2, Sparkles, ScrollText, Copy, Check } from 'lucide-react';
import { sendMessage } from './services/gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || 'I apologize, but I could not generate a response.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-[#F5F5F5] selection:bg-[#D4AF37]/30 overflow-hidden" id="app-container">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.07] grayscale mix-blend-overlay"
          style={{ 
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/2/2f/Menelik_II_portrait.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1B4332] opacity-[0.1] blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37] opacity-[0.06] blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass px-6 md:px-12 py-5 flex items-center justify-between" id="header">
        <div className="flex items-center gap-4" id="logo-container">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F2D06B] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.4)]" id="logo-icon">
            <Shield size={22} className="text-[#050505]" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold tracking-widest gold-gradient" id="app-title">
              ADWA VICTORIA
            </h1>
            <p className="text-[9px] text-[#A1A1AA] font-bold uppercase tracking-[0.3em]">
              Imperial Archives • የአድዋ ድል
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2.5 text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-white/5 rounded-full transition-all duration-300 active:scale-90 border border-transparent hover:border-white/10"
          title="Clear archives"
          id="clear-chat-btn"
        >
          <Trash2 size={18} />
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-12" id="messages-area">
        <div className="max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-[60vh] flex flex-col items-center justify-center text-center space-y-12"
                id="empty-state"
              >
                <div className="relative group" id="empty-icon-wrapper">
                  <div className="absolute inset-0 bg-[#D4AF37] blur-[80px] opacity-10 group-hover:opacity-25 transition-opacity duration-700 rounded-full" />
                  <div className="relative w-28 h-28 glass rounded-full flex items-center justify-center text-[#D4AF37] shadow-2xl border border-white/10 group-hover:border-[#D4AF37]/30 transition-colors duration-500" id="empty-icon">
                    <ScrollText size={48} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                
                <div className="space-y-8 max-w-3xl">
                  <h2 className="text-6xl md:text-8xl font-serif font-light tracking-tighter leading-none" id="empty-title">
                    The Spirit of <span className="italic font-medium gold-gradient">Adwa</span>
                  </h2>
                  <div className="space-y-6">
                    <p className="text-[#A1A1AA] text-xl md:text-2xl font-light leading-relaxed font-serif italic px-4" id="empty-description-en">
                      "Welcome, seeker of truth. I am here to share the glorious history of the 1896 Battle of Adwa. Ask me about Menelik II, Empress Taytu, or the strategies that secured our independence."
                    </p>
                    <p className="text-[#A1A1AA]/50 text-lg font-light leading-relaxed px-4" id="empty-description-am">
                      እንኳን ደህና መጡ! ስለ 1888 ዓ.ም የአድዋ ጦርነት ታሪክ ልነግርዎ ዝግጁ ነኝ። ስለ ዳግማዊ አፄ ምኒልክ፣ ስለ እቴጌ ጣይቱ ወይም ስለ ድሉ ስልቶች ይጠይቁኝ።
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-12" id="ethiopian-accents">
                  <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#1B4332] to-[#1B4332]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <div className="w-16 h-[1px] bg-gradient-to-l from-transparent via-[#9B2226] to-[#9B2226]" />
                </div>
              </motion.div>
            ) : (
              <div className="space-y-12 pb-32">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-6 ${message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}
                    id={`message-${message.id}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${
                      message.role === 'assistant' 
                        ? 'bg-[#111111] border-[#D4AF37]/30 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
                        : 'bg-[#1B4332]/20 border-[#1B4332]/40 text-[#1B4332]'
                    }`} id={`avatar-${message.id}`}>
                      {message.role === 'assistant' ? <Shield size={18} /> : <User size={18} />}
                    </div>
                    
                    <div className={`flex-1 max-w-[90%] md:max-w-[80%] space-y-3 ${message.role === 'user' ? 'text-right' : ''}`} id={`content-${message.id}`}>
                      <div className="flex items-center justify-between px-2">
                        <div className={`text-[9px] font-bold uppercase tracking-[0.3em] opacity-40`} id={`role-${message.id}`}>
                          {message.role === 'assistant' ? 'Imperial Historian' : 'Inquirer'}
                        </div>
                        {message.role === 'assistant' && (
                          <button 
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors p-1"
                            title="Copy message"
                          >
                            {copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                      <div className={`p-6 md:p-8 rounded-3xl leading-relaxed text-[17px] md:text-[18px] font-light shadow-2xl ${
                        message.role === 'assistant' 
                          ? 'glass-dark text-[#F5F5F5] font-serif prose-custom' 
                          : 'bg-white/[0.03] text-[#F5F5F5] border border-white/5'
                      }`} id={`text-${message.id}`}>
                        {message.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-6 items-start"
                    id="loading-indicator"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#111111] border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shadow-lg" id="loading-avatar">
                      <Shield size={18} className="animate-pulse" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-4 text-[#A1A1AA] text-base font-light italic font-serif">
                        <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                        Consulting the imperial archives...
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-6 md:p-10 glass border-t-0 mt-auto" id="footer">
        <form
          onSubmit={handleSend}
          className="max-w-7xl mx-auto relative group"
          id="input-form"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/30 to-[#1B4332]/30 rounded-[2.5rem] blur-md opacity-0 group-focus-within:opacity-100 transition duration-700" />
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Seek knowledge... / ስለ አድዋ ይጠይቁ..."
              className="w-full bg-[#111111]/80 border border-white/10 rounded-[2rem] py-6 pl-10 pr-24 focus:border-[#D4AF37]/60 focus:bg-[#111111] transition-all duration-500 outline-none text-[#F5F5F5] placeholder-[#A1A1AA]/30 shadow-3xl text-lg font-light"
              disabled={isLoading}
              id="chat-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-4 p-4 rounded-2xl transition-all duration-500 shadow-2xl ${
                input.trim() && !isLoading
                  ? 'bg-[#D4AF37] text-[#050505] hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(212,175,55,0.5)]'
                  : 'bg-white/5 text-[#A1A1AA]/20'
              }`}
              id="send-btn"
            >
              <Send size={24} strokeWidth={2} />
            </button>
          </div>
        </form>
        
        <div className="mt-8 flex justify-center items-center gap-8 opacity-10" id="footer-accents">
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent to-white" />
          <Sparkles size={14} />
          <div className="h-[1px] w-32 bg-gradient-to-l from-transparent to-white" />
        </div>
      </footer>
    </div>
  );
}
