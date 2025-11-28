import React from 'react';

interface WoodyBackgroundProps {
  children: React.ReactNode;
}

export const WoodyBackground: React.FC<WoodyBackgroundProps> = ({ children }) => {
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          linear-gradient(180deg, rgba(139,90,43,0.95) 0%, rgba(101,67,33,1) 50%, rgba(80,50,20,1) 100%),
          repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.03) 50px, rgba(0,0,0,0.03) 100px)
        `,
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Wood grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.1) 2px,
              rgba(0,0,0,0.1) 4px
            )
          `,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

