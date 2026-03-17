import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Shield, History, Loader2, Trash2, Sparkles, ScrollText, Copy, Check, Sun, Moon } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 overflow-hidden ${isDarkMode ? 'dark bg-[#1A1210] text-[#FDFCFB]' : 'bg-[#FDFCFB] text-[#2D2D2D]'}`} id="app-container">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03] grayscale mix-blend-multiply transition-opacity duration-500"
          style={{ 
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/2/2f/Menelik_II_portrait.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
          }}
        />
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-b from-[#1A1210] via-transparent to-[#1A1210]' : 'bg-gradient-to-b from-[#FDFCFB] via-transparent to-[#FDFCFB]'}`} />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent-secondary)] opacity-[0.2] blur-[140px] rounded-full transition-colors duration-500" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent-tertiary)] opacity-[0.1] blur-[140px] rounded-full transition-colors duration-500" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass px-4 md:px-12 py-4 md:py-6 flex items-center justify-between" id="header">
        <div className="flex items-center gap-3 md:gap-5" id="logo-container">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-xl rotate-3 transition-colors duration-500" id="logo-icon">
            <Shield size={20} className={isDarkMode ? 'text-[#1A1210]' : 'text-[#FDFCFB]'} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-serif font-bold tracking-tight coffee-gradient" id="app-title">
              Adwa Victoria
            </h1>
            <p className="text-[8px] md:text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-[0.2em] transition-colors duration-500">
              Imperial Historian • የአድዋ ድል
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 md:p-3 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-2xl transition-all duration-300 active:scale-90 border border-transparent hover:border-[var(--accent)]/10"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            id="theme-toggle-btn"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={clearChat}
            className="p-2 md:p-3 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-2xl transition-all duration-300 active:scale-90 border border-transparent hover:border-[var(--accent)]/10"
            title="Clear archives"
            id="clear-chat-btn"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 md:py-16" id="messages-area">
        <div className="max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-[60vh] flex flex-col items-center justify-center text-center space-y-10 md:space-y-16"
                id="empty-state"
              >
                <div className="relative group" id="empty-icon-wrapper">
                  <div className="absolute inset-0 bg-[var(--accent)] blur-[80px] md:blur-[100px] opacity-5 group-hover:opacity-10 transition-opacity duration-700 rounded-full" />
                  <div className="relative w-24 h-24 md:w-32 md:h-32 bg-[var(--card)] rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-[var(--accent)] shadow-2xl border border-[var(--accent)]/5 group-hover:border-[var(--accent)]/20 transition-all duration-500 rotate-[-5deg] group-hover:rotate-0" id="empty-icon">
                    <ScrollText size={40} strokeWidth={1} className="md:w-14 md:h-14 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                
                <div className="space-y-6 md:space-y-10 max-w-4xl">
                  <h2 className="text-5xl md:text-9xl font-serif font-bold tracking-tighter leading-[0.85] text-[var(--accent)]" id="empty-title">
                    The Spirit of <span className="italic font-medium text-[var(--accent-tertiary)]">Adwa</span>
                  </h2>
                  <div className="space-y-4 md:space-y-8">
                    <p className="text-[var(--text-muted)] text-lg md:text-3xl font-light leading-relaxed font-serif italic px-4 max-w-2xl mx-auto" id="empty-description-en">
                      "I am here to share the glorious history of the 1896 Battle of Adwa. Ask me about the strategies that secured our independence."
                    </p>
                    <p className="text-[var(--text-muted)]/60 text-base md:text-xl font-light leading-relaxed px-4" id="empty-description-am">
                      ስለ 1888 ዓ.ም የአድዋ ጦርነት ታሪክ ልነግርዎ ዝግጁ ነኝ።
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:gap-8 pt-8 md:pt-16" id="ethiopian-accents">
                  <div className="w-12 md:w-20 h-[1px] bg-[var(--accent-secondary)]" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[var(--accent)] shadow-lg" />
                  <div className="w-12 md:w-20 h-[1px] bg-[var(--accent-secondary)]" />
                </div>
              </motion.div>
            ) : (
              <div className="space-y-10 md:space-y-16 pb-32 md:pb-40">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 md:gap-8 ${message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}
                    id={`message-${message.id}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      message.role === 'assistant' 
                        ? 'bg-[var(--accent)] text-[var(--bg)] shadow-xl rotate-3' 
                        : 'bg-[var(--accent-secondary)] text-[var(--accent)] rotate-[-3deg]'
                    }`} id={`avatar-${message.id}`}>
                      {message.role === 'assistant' ? <Shield size={18} className="md:w-[22px] md:h-[22px]" /> : <User size={18} className="md:w-[22px] md:h-[22px]" />}
                    </div>
                    
                    <div className={`flex-1 max-w-[85%] md:max-w-[75%] space-y-2 md:space-y-4 ${message.role === 'user' ? 'text-right' : ''}`} id={`content-${message.id}`}>
                      <div className="flex items-center justify-between px-2 md:px-3">
                        <div className={`text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]`} id={`role-${message.id}`}>
                          {message.role === 'assistant' ? 'Imperial Historian' : 'Inquirer'}
                        </div>
                        {message.role === 'assistant' && (
                          <button 
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1 rounded-lg hover:bg-[var(--accent)]/5"
                            title="Copy message"
                          >
                            {copiedId === message.id ? <Check size={14} className="md:w-4 md:h-4" /> : <Copy size={14} className="md:w-4 md:h-4" />}
                          </button>
                        )}
                      </div>
                      <div className={`p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] leading-relaxed text-[16px] md:text-[20px] font-light shadow-xl transition-colors duration-500 ${
                        message.role === 'assistant' 
                          ? 'bg-[var(--card)] text-[var(--text)] font-serif prose-custom border border-[var(--accent)]/5' 
                          : 'bg-[var(--accent)] text-[var(--bg)] shadow-[0_10px_20px_rgba(78,52,46,0.15)]'
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
                    className="flex gap-4 md:gap-8 items-start"
                    id="loading-indicator"
                  >
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center shadow-xl rotate-3" id="loading-avatar">
                      <Shield size={18} className="md:w-[22px] md:h-[22px] animate-pulse" />
                    </div>
                    <div className="flex-1 pt-2 md:pt-3">
                      <div className="flex items-center gap-3 md:gap-5 text-[var(--text-muted)] text-base md:text-lg font-light italic font-serif">
                        <Loader2 size={16} className="md:w-5 md:h-5 animate-spin text-[var(--accent)]" />
                        Consulting archives...
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
      <footer className="p-4 sm:p-8 md:p-12 glass border-t-0 mt-auto" id="footer">
        <form
          onSubmit={handleSend}
          className="max-w-7xl mx-auto relative group"
          id="input-form"
        >
          <div className="absolute -inset-1 sm:-inset-2 bg-[var(--accent)]/5 rounded-[2rem] sm:rounded-[3rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700" />
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Seek knowledge... / ስለ አድዋ ይጠይቁ..."
              className="w-full bg-[var(--input-bg)] border border-[var(--accent)]/10 rounded-[1.5rem] sm:rounded-[2.5rem] py-4 sm:py-8 pl-6 sm:pl-12 pr-16 sm:pr-28 focus:border-[var(--accent)]/30 focus:shadow-2xl transition-all duration-500 outline-none text-[var(--text)] placeholder-[var(--text-muted)]/40 shadow-xl text-base sm:text-xl font-light"
              disabled={isLoading}
              id="chat-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 sm:right-5 p-3 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-500 shadow-2xl ${
                input.trim() && !isLoading
                  ? 'bg-[var(--accent)] text-[var(--bg)] hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(78,52,46,0.2)]'
                  : 'bg-[var(--accent-secondary)] text-[var(--accent)]/30'
              }`}
              id="send-btn"
            >
              <Send size={20} className="sm:w-7 sm:h-7" strokeWidth={2} />
            </button>
          </div>
        </form>
        
        <div className="mt-10 flex justify-center items-center gap-10 opacity-20" id="footer-accents">
          <div className="h-[1px] w-40 bg-gradient-to-r from-transparent to-[var(--accent)]" />
          <Sparkles size={18} className="text-[var(--accent)]" />
          <div className="h-[1px] w-40 bg-gradient-to-l from-transparent to-[var(--accent)]" />
        </div>
      </footer>
    </div>
  );
}
