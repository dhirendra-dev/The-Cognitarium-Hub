import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader, Sparkles, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'anya';
  text: string;
  timestamp: string;
}

const MOTIVATIONAL_QUOTES = [
  "The difference between a normal student and an IITian is the selection of their problems and their attitude during a breakdown.",
  "Your struggle in Rotational Mechanics and Ionic Equilibrium today will build the problem-solving pathways that crack JEE Advanced tomorrow.",
  "Calculus is not just math; it's the language of continuous improvement. Keep incrementing your efforts.",
  "Consistency beats genius. 3 focused hours every day is infinitely superior to a 15-hour marathon followed by a weekly burnout.",
  "IIT-JEE doesn't test your memory; it tests your patience under pressure and conceptual clarity."
];

export default function ChatCoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'anya',
      text: "Namaste! I am Anya, your dedicated Class 11 JEE Academic Coach. I graduated from IIT Bombay (Computer Science) and specialize in converting complex Physics, Chemistry, and Math concepts into highly intuitive mental models.\n\nSince Class 11 represents almost 45-50% of the entire JEE weightage (especially the foundational mechanics, organic chemistry, and coordinate geometry), we must ensure absolute precision. What chapter or numerical are we debugging together today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('physics');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response - in production, connect to Gemini API
      const systemPrompt = `You are Anya, a brilliant IIT Bombay graduate who specializes in teaching ${selectedSubject} for Class 11 JEE preparation. 
      You explain concepts with crystal clarity, use analogies, and always highlight common mistakes. Keep responses concise but insightful.
      Focus on conceptual understanding over memorization.`;

      // This would call the actual API in production
      const response = `I understand your question about ${selectedSubject}. Let me break this down for you...
      
This is a simulated response. In production, this would be powered by Gemini API to provide real-time academic coaching.`;

      const anyaMessage: Message = {
        id: `anya-${Date.now()}`,
        sender: 'anya',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, anyaMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'init-1',
        sender: 'anya',
        text: "Namaste! I am Anya, your dedicated Class 11 JEE Academic Coach. What chapter or numerical are we debugging together today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const getRandomQuote = () => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto flex flex-col h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Chat with Anya</h1>
          </div>
          <p className="text-slate-300">Your IIT-JEE Academic Coach</p>
        </div>

        {/* Subject Selector */}
        <div className="flex gap-3 mb-6">
          {['physics', 'chemistry', 'math'].map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedSubject === subject
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {subject.charAt(0).toUpperCase() + subject.slice(1)}
            </button>
          ))}
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-6 overflow-y-auto mb-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-2 opacity-70">{message.timestamp}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-100 px-4 py-3 rounded-lg flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Anya is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Motivational Quote */}
        <div className="mb-6 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
          <p className="text-sm text-slate-300 italic flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            {getRandomQuote()}
          </p>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Anya about any concept..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClearChat}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
