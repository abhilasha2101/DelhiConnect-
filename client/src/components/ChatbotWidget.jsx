import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Namaskar! I am your Delhi Connect Assistant. Aap apni civic grievance yahan aam bhasha (Hindi/English/Hinglish) mein type kar sakte hain. Main ise automatically sahi department ko forward kar dunga.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the conversation on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Formatted Text/Markdown Parser Engine
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('* ');
      const cleanLine = isBullet 
        ? (trimmed.startsWith('•') ? trimmed.substring(1).trim() : trimmed.substring(2).trim())
        : line;

      // Parse bold segments (**text**)
      const parts = cleanLine.split('**');
      const content = parts.map((part, partIdx) => {
        // Odd indexes represent content wrapped in **
        if (partIdx % 2 !== 0) {
          return <strong key={partIdx} className="font-extrabold text-white">{part}</strong>;
        }

        // Parse italic segments (*text*) inside normal text
        if (part.includes('*')) {
          const italicParts = part.split('*');
          return italicParts.map((ip, ipIdx) => {
            if (ipIdx % 2 !== 0) {
              return <em key={ipIdx} className="italic text-slate-350">{ip}</em>;
            }
            return ip;
          });
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 ml-2.5 my-0.5 text-[11px] leading-normal text-slate-300">
            <span className="text-blue-400 mt-1 text-[8px]">●</span>
            <span className="flex-1">{content}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="mb-1 text-[11px] leading-relaxed text-slate-200 last:mb-0">
          {content}
        </p>
      );
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // 1. Add User message instantly
    const userMsg = {
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // 2. Trigger "AI is typing" simulation
    setIsTyping(true);

    setTimeout(() => {
      // 3. Add AI Structured Response with multi-department allocation details
      const aiResponse = {
        sender: 'ai',
        text: `🤖 **AI Analysis Complete:** Authentic civic grievance verified.
📁 **Category:** Road Infrastructure & Utility Spill Mismatch
🏢 **Intelligent Routing Engine Execution:**
   • *Primary Task:* Surface structural repair assigned to **Public Works Department (PWD)** [Target SLA: 48 Hours].
   • *Secondary Utility Dependency:* Pipe leakage detected in coordinate radius; automated sub-ticket routed to **Delhi Jal Board (DJB)** to fix the source before road resurfacing begins.
📊 **Priority Metrics Tier:** High Priority (P1) due to active traffic disruption potential.
🆔 **Grievance ID:** DEL-2026-RD-00077`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] select-none font-sans">
      {/* 🟢 FLOATING ACTION BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          style={{
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}
        >
          {/* Notification Ping Ring */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
          </span>

          {/* Glowing Ring Hover Effect */}
          <div className="absolute inset-0 rounded-full border border-emerald-400 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />

          {/* SVG Robotic Bot Icon */}
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* 💬 CHATBOX MODAL WINDOW */}
      {isOpen && (
        <div
          className="flex flex-col h-[480px] w-[360px] max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-fade-in"
          style={{
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.7)'
          }}
        >
          {/* Top Header Panel */}
          <div className="flex items-center justify-between bg-slate-950 px-4 py-3.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              {/* Online Pulse Indicator */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 tracking-wide">
                  {t('Delhi Connect AI Assistant')}
                </h4>
                <p className="text-[9px] text-emerald-400 font-semibold">{t('Online / Live AI Engine')}</p>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-900 rounded-lg text-sm"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Message Box Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-900/60 custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-blue-500/10'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/40'
                  }`}
                >
                  {renderFormattedText(msg.text)}
                </div>
                <span className="text-[8px] text-slate-500 mt-1 font-semibold">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Simulated Typing Indicator Bubble */}
            {isTyping && (
              <div className="flex flex-col mr-auto items-start max-w-[85%]">
                <div className="bg-slate-800 rounded-2xl rounded-bl-none px-3.5 py-2 flex items-center gap-1 border border-slate-700/40">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form Field */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-slate-950 p-2.5 border-t border-slate-800/80"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={t('Type your issue here...')}
              className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500/80 transition-all placeholder-slate-500"
              disabled={isTyping}
            />
            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 transition-all"
            >
              <svg
                className="w-4 h-4 transform rotate-90"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
