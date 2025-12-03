import React, { useState, useEffect, useRef } from 'react';
import { JarvisMode, Message } from './types';
import { initializeChat, sendMessageToJarvis, analyzeImage, speakText } from './services/jarvisService';
import ArcReactor from './components/ArcReactor';
import Terminal from './components/Terminal';
import SystemMonitor from './components/SystemMonitor';
import { Camera, Mic, MapPin, Clock, Globe, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'J.A.R.V.I.S. Online. Systems nominal. How may I assist you, Mr. Stark?', timestamp: new Date() }
  ]);
  const [mode, setMode] = useState<JarvisMode>(JarvisMode.IDLE);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initializeChat();
    
    // Clock tick
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Initialize Camera Feed
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable", err);
      }
    };
    startCamera();

    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setMode(JarvisMode.PROCESSING);

    // Add placeholder for streaming
    setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);

    let accumulatedText = '';
    
    try {
      await sendMessageToJarvis(text, (chunkText) => {
        setMessages(prev => {
          const newHistory = [...prev];
          // Update the last message (model response)
          newHistory[newHistory.length - 1] = {
            ...newHistory[newHistory.length - 1],
            text: chunkText
          };
          return newHistory;
        });
        accumulatedText = chunkText;
      });

      // After streaming is complete, speak if voice is enabled
      if (voiceEnabled && accumulatedText) {
        setMode(JarvisMode.SPEAKING);
        await speakText(accumulatedText);
        setMode(JarvisMode.IDLE);
      } else {
        setMode(JarvisMode.IDLE);
      }

    } catch (error) {
       console.error(error);
       setMode(JarvisMode.IDLE);
    }
  };

  const handleFileUpload = async (file: File) => {
    setMode(JarvisMode.ANALYZING);
    const userMsg: Message = { role: 'user', text: `[Uploading visual data: ${file.name}]`, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      
      const responseText = await analyzeImage(base64Data);
      
      const aiMsg: Message = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      
      if (voiceEnabled && responseText) {
        setMode(JarvisMode.SPEAKING);
        await speakText(responseText);
      }
      setMode(JarvisMode.IDLE);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-cyan-400 selection:bg-cyan-500/30 selection:text-white">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_90%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_bottom,rgba(0,243,255,0.05),transparent_50%)] bg-[length:100%_4px] animate-scanline opacity-10"></div>

      {/* Main HUD Container */}
      <div className="relative z-20 flex flex-col h-full p-6">
        
        {/* Top HUD Bar */}
        <div className="flex justify-between items-start mb-6 border-b border-cyan-500/20 pb-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-hud font-bold tracking-widest text-white hud-glow">J.A.R.V.I.S.</h1>
            <span className="text-xs text-cyan-600 tracking-[0.5em] uppercase">Stark Industries // MK-85 Interface</span>
          </div>
          
          <div className="flex items-center space-x-8 text-cyan-300 font-mono text-sm">
             <div className="flex items-center gap-2">
               <MapPin size={16} className="animate-bounce" />
               <span>MALIBU, CA // 34.0259° N, 118.7798° W</span>
             </div>
             <div className="flex items-center gap-2">
               <Clock size={16} />
               <span>{currentTime.toLocaleTimeString()}</span>
             </div>
             <div className="flex items-center gap-2 cursor-pointer hover:text-cyan-100" onClick={() => setVoiceEnabled(!voiceEnabled)}>
               {voiceEnabled ? <Volume2 size={16} className="text-cyan-400" /> : <VolumeX size={16} className="text-cyan-700" />}
               <span>AUDIO: {voiceEnabled ? 'ON' : 'OFF'}</span>
             </div>
             <div className="flex items-center gap-2">
               <Globe size={16} className="animate-spin-slow" />
               <span>SAT-LINK: ACTIVE</span>
             </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* Left Panel - System Status */}
          <div className="w-64 hidden md:flex flex-col gap-4">
            <div className="bg-black/20 backdrop-blur-md p-4 rounded-lg border border-cyan-500/20 hud-border-glow">
              <h3 className="text-cyan-400 font-hud text-sm border-b border-cyan-500/30 pb-2 mb-3">DIAGNOSTICS</h3>
              <SystemMonitor />
            </div>
            
            <div className="flex-1 bg-black/20 backdrop-blur-md p-4 rounded-lg border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
              {/* Fake Audio Waveform */}
              <div className="flex items-end gap-1 h-20">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 ${mode === JarvisMode.SPEAKING ? 'bg-white animate-pulse' : 'bg-cyan-500/60'}`}
                    style={{ 
                      height: mode === JarvisMode.SPEAKING ? `${Math.random() * 100}%` : `${Math.random() * 50 + 10}%`,
                      transition: 'height 0.1s ease'
                    }} 
                  />
                ))}
              </div>
              <span className="absolute bottom-2 text-[10px] text-cyan-700 tracking-widest">AUDIO INPUT_LEVEL</span>
            </div>
          </div>

          {/* Center Panel - Arc Reactor & Core Visualization */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-[500px] h-[500px] border border-cyan-500/10 rounded-full animate-spin-slow"></div>
                <div className="absolute w-[400px] h-[400px] border border-cyan-500/20 rounded-full border-t-transparent animate-spin-reverse-slow"></div>
             </div>
             
             <div className="transform scale-125 mb-10">
               <ArcReactor mode={mode === JarvisMode.SPEAKING ? 'speaking' : mode === JarvisMode.PROCESSING ? 'processing' : mode === JarvisMode.ANALYZING ? 'active' : 'idle'} />
             </div>
             
             {mode === JarvisMode.PROCESSING && (
               <div className="mt-8 text-cyan-300 font-mono animate-pulse tracking-widest">
                 PROCESSING REQUEST...
               </div>
             )}
             {mode === JarvisMode.SPEAKING && (
               <div className="mt-8 text-white font-mono animate-pulse tracking-widest">
                 AUDIO OUTPUT ACTIVE...
               </div>
             )}
          </div>

          {/* Right Panel - Terminal/Chat */}
          <div className="w-96 flex flex-col">
            <Terminal 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              onFileUpload={handleFileUpload}
              isProcessing={mode === JarvisMode.PROCESSING || mode === JarvisMode.ANALYZING}
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20 flex justify-between items-center text-[10px] text-cyan-700 font-mono">
           <div className="flex gap-4">
             <span>MEM: 64TB / 128TB</span>
             <span>UPTIME: 428:12:09</span>
             <span>VERSION: 2.5.0-FLASH</span>
           </div>
           <div className="tracking-[0.5em] uppercase text-cyan-900">
             Jarvis System UI // Confidential // Stark Industries
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;