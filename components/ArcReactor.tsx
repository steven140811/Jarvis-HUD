import React from 'react';

interface ArcReactorProps {
  mode: 'idle' | 'processing' | 'active' | 'warning' | 'speaking';
}

const ArcReactor: React.FC<ArcReactorProps> = ({ mode }) => {
  const getColor = () => {
    switch (mode) {
      case 'warning': return 'text-red-500 shadow-red-500';
      case 'processing': return 'text-purple-400 shadow-purple-400';
      case 'active': return 'text-cyan-300 shadow-cyan-300';
      case 'speaking': return 'text-white shadow-cyan-200';
      default: return 'text-cyan-500 shadow-cyan-500';
    }
  };

  const colorClass = getColor();
  // Extract just the text color class for SVG strokes
  const strokeColor = mode === 'warning' ? '#ef4444' : mode === 'processing' ? '#c084fc' : mode === 'speaking' ? '#ffffff' : '#06b6d4';
  const pulseClass = mode === 'speaking' ? 'animate-pulse duration-75' : 'animate-pulse';

  return (
    <div className={`relative flex items-center justify-center w-64 h-64 transition-all duration-700`}>
      {/* Outer Ring */}
      <div className={`absolute w-full h-full border-4 border-dashed rounded-full animate-spin-slow opacity-30 ${colorClass.split(' ')[0]}`}></div>
      
      {/* Middle Ring */}
      <div className={`absolute w-48 h-48 border-2 border-dotted rounded-full animate-spin-reverse-slow opacity-50 ${colorClass.split(' ')[0]}`}></div>
      
      {/* Inner Core */}
      <div className="relative z-10">
        <svg width="100" height="100" viewBox="0 0 100 100" className={`${pulseClass} ${colorClass.split(' ')[0]}`}>
          <circle cx="50" cy="50" r="40" stroke={strokeColor} strokeWidth="4" fill="none" strokeOpacity="0.8" />
          <circle cx="50" cy="50" r="30" stroke={strokeColor} strokeWidth="2" fill="none" strokeOpacity="0.5" />
          <circle cx="50" cy="50" r="10" fill={strokeColor} fillOpacity="0.8" />
          <path d="M50 10 L50 90 M10 50 L90 50" stroke={strokeColor} strokeWidth="1" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* Decorative Rotating Segments */}
      <div className={`absolute w-56 h-56 rounded-full border-t-2 border-b-2 border-transparent ${colorClass.split(' ')[0]} animate-spin border-opacity-40`}></div>
      
      {/* Voice Visualization Ring (Only when speaking) */}
      {mode === 'speaking' && (
         <div className="absolute w-72 h-72 rounded-full border-4 border-cyan-400 opacity-20 animate-ping"></div>
      )}
    </div>
  );
};

export default ArcReactor;