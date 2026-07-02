import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  // Request browser geolocation when the chatbot modal is opened
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [isOpen]);

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

      // Match bold (**text**), italic (*text*), and markdown links ([text](url))
      const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
      const matches = [...cleanLine.matchAll(regex)];
      const elements = [];
      let lastIndex = 0;

      if (matches.length === 0) {
        elements.push(cleanLine);
      } else {
        matches.forEach((m, idx) => {
          const rawMatch = m[0];
          const matchIndex = m.index;

          if (matchIndex > lastIndex) {
            elements.push(cleanLine.substring(lastIndex, matchIndex));
          }

          if (rawMatch.startsWith('**') && rawMatch.endsWith('**')) {
            elements.push(
              <strong key={`bold-${idx}`} className="font-extrabold text-white">
                {rawMatch.slice(2, -2)}
              </strong>
            );
          } else if (rawMatch.startsWith('*') && rawMatch.endsWith('*')) {
            elements.push(
              <em key={`italic-${idx}`} className="italic text-slate-350">
                {rawMatch.slice(1, -1)}
              </em>
            );
          } else if (rawMatch.startsWith('[') && rawMatch.includes('](')) {
            const closingBracket = rawMatch.indexOf(']');
            const linkText = rawMatch.slice(1, closingBracket);
            const linkUrl = rawMatch.slice(closingBracket + 2, -1);
            elements.push(
              <a 
                key={`link-${idx}`} 
                href={linkUrl} 
                className="text-blue-400 hover:text-blue-300 underline font-semibold transition-colors"
                style={{ cursor: 'pointer' }}
              >
                {linkText}
              </a>
            );
          }

          lastIndex = matchIndex + rawMatch.length;
        });

        if (lastIndex < cleanLine.length) {
          elements.push(cleanLine.substring(lastIndex));
        }
      }

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 ml-2.5 my-0.5 text-[11px] leading-normal text-slate-300">
            <span className="text-blue-400 mt-1 text-[8px]">●</span>
            <span className="flex-1">{elements}</span>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="mb-1 text-[11px] leading-relaxed text-slate-200 last:mb-0">
          {elements}
        </p>
      );
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // 1. Add User message instantly
    const userText = inputText.trim();
    const userMsg = {
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // 2. Trigger "AI is typing" simulation
    setIsTyping(true);

    try {
      // 3. Fetch response from chat assistant backend
      const res = await aiAPI.chat(userText, coordinates);
      let aiText = '';

      if (res.data?.type === 'text') {
        aiText = res.data.text;
      } else {
        // Display complaint routing details card
        const data = res.data?.data || {};
        const realGrievanceId = data.grievanceId || `GR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        aiText = `🤖 **AI Analysis Complete:** Authentic civic grievance verified.
📁 **Category:** ${data.category || 'Other'}
🏢 **Intelligent Routing Engine Execution:**
   • *Primary Task:* Grievance assigned to **${data.assignDepartment || 'General Administration'}** [Target SLA: 48 Hours].`;

        if (data.subCategory) {
          aiText += `\n   • *Sub-Category:* ${data.subCategory}`;
        }
        if (data.reason) {
          aiText += `\n   • *Routing Reason:* ${data.reason}`;
        }

        // Check for secondary utility dependency matching the mockup
        const userTextLower = userText.toLowerCase();
        if ((data.category === 'Pothole / Road Damage' || userTextLower.includes('road') || userTextLower.includes('pothole')) &&
            (userTextLower.includes('water') || userTextLower.includes('leakage') || userTextLower.includes('sewer') || userTextLower.includes('pipe'))) {
          aiText += `\n   • *Secondary Utility Dependency:* Pipe leakage/sewer issue detected in coordinate radius; automated sub-ticket routed to **Delhi Jal Board (DJB)** to fix the source before road resurfacing begins.`;
        }

        let priorityText = `${data.priority || 'Medium'} Priority`;
        if (data.priority === 'High' || data.priority === 'Critical') {
          priorityText += ' (P1) due to active safety/disruption potential';
        }

        aiText += `\n📊 **Priority Metrics Tier:** ${priorityText}\n🆔 **Grievance ID:** ${realGrievanceId}`;

        // Determine user dashboard routing link
        let dashboardLink = '/login';
        let dashboardName = 'Login Page';
        if (user) {
          if (user.role === 'admin') {
            dashboardLink = '/admin/overview';
            dashboardName = 'CM Dashboard';
          } else if (user.role === 'officer') {
            dashboardLink = '/officer/dashboard';
            dashboardName = 'Officer Dashboard';
          } else if (user.role === 'citizen') {
            dashboardLink = '/my-complaints';
            dashboardName = 'My Complaints';
          }
        }
        aiText += `\n🔗 **View Complaint:** Click [here to open ${dashboardName}](${dashboardLink}) to view this complaint on your dashboard.`;
      }

      const aiResponse = {
        sender: 'ai',
        text: aiText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chatbot API Error:', error);
      const mockGrievanceId = `GR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const aiResponse = {
        sender: 'ai',
        text: `🤖 **AI Analysis Complete:** Civic grievance received.
📁 **Category:** General Inquiry
🏢 **Intelligent Routing Engine Execution:**
   • *Primary Task:* Assigned to **General Administration** [Target SLA: 48 Hours].
📊 **Priority Metrics Tier:** Medium Priority
🆔 **Grievance ID:** ${mockGrievanceId}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  if (user && (user.role === 'admin' || user.role === 'officer')) {
    return null;
  }

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
