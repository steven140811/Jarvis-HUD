import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { Terminal as TerminalIcon, Mic, Send, Paperclip, MicOff } from 'lucide-react';

interface TerminalProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ messages, onSendMessage, onFileUpload, isProcessing }) => {
  const [input, setInput] = React.useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        onSendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onSendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error("Could not start recognition", e);
        }
      } else {
        alert("Voice recognition not supported in this browser.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/60 border border-cyan-500/30 rounded-lg backdrop-blur-sm overflow-hidden hud-border-glow">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-cyan-900/20 border-b border-cyan-500/30 justify-between">
        <div className="flex items-center">
          <TerminalIcon className="w-4 h-4 text-cyan-400 mr-2" />
          <span className="text-cyan-400 font-hud text-xs tracking-widest uppercase">Comm Link // Secure</span>
        </div>
        {isListening && (
           <span className="flex items-center gap-2 text-red-400 text-xs animate-pulse font-mono">
             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
             REC
           </span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded ${
              msg.role === 'user' 
                ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-500/40 rounded-br-none' 
                : 'bg-black/40 text-cyan-300 border border-cyan-500/20 rounded-bl-none'
            }`}>
              <p className="text-sm font-mono leading-relaxed">{msg.text}</p>
            </div>
            <span className="text-[10px] text-cyan-600 mt-1 uppercase tracking-wider">
              {msg.role === 'user' ? 'CMD' : 'SYS'} • {msg.timestamp.toLocaleTimeString([], { hour12: false })}
            </span>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-cyan-500 animate-pulse">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <span className="text-xs font-hud tracking-widest">PROCESSING...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-cyan-500/30 bg-black/40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-cyan-500 hover:text-cyan-300 transition-colors"
          title="Upload Visual Data"
        >
          <Paperclip size={18} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-cyan-500 hover:text-cyan-300'}`}
          title="Voice Command"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "LISTENING..." : "ENTER COMMAND..."}
          className="flex-1 bg-transparent border-none outline-none text-cyan-300 font-mono text-sm placeholder-cyan-800"
        />
        
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="p-2 text-cyan-500 hover:text-cyan-300 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Terminal;