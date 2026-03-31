import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 w-screen h-screen -z-50 bg-[#050510] overflow-hidden pointer-events-none">
      <style>
        {`
          @keyframes slideFlowLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          @keyframes slideFlowRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }

          .neon-wave {
            fill: none;
            stroke-linecap: round;
            filter: drop-shadow(0 0 12px rgba(150, 123, 182, 0.6)) drop-shadow(0 0 30px rgba(150, 123, 182, 0.4));
          }

          .wave-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            display: flex;
            align-items: center;
          }

          .wave-fast { animation: slideFlowLeft 22s linear infinite; }
          .wave-medium { animation: slideFlowRight 28s linear infinite; }
          .wave-slow { animation: slideFlowLeft 35s linear infinite; }
        `}
      </style>

      {/* Deepest, slowest wave */}
      <div className="wave-layer wave-slow opacity-30">
        <svg preserveAspectRatio="none" viewBox="0 0 2880 1000" className="w-full h-[60%] lg:h-[80%]">
          <path className="neon-wave" stroke="#6d28d9" strokeWidth="4" d="
            M0,500 
            C 250, 200,   470, 800,   720, 500
            C 970, 200,  1190, 800,  1440, 500
            C 1690, 200, 1910, 800,  2160, 500
            C 2410, 200, 2630, 800,  2880, 500
          "/>
        </svg>
      </div>

      {/* Middle wave */}
      <div className="wave-layer wave-medium opacity-50">
        <svg preserveAspectRatio="none" viewBox="0 0 2880 1000" className="w-full h-[70%] lg:h-[90%]">
          <path className="neon-wave" stroke="#8b5cf6" strokeWidth="3" d="
            M0, 600
            C 200, 900,   520, 300,   720, 600
            C 920, 900,  1240, 300,  1440, 600
            C 1640, 900, 1960, 300,  2160, 600
            C 2360, 900, 2680, 300,  2880, 600
          "/>
        </svg>
      </div>

      {/* Front, fastest wave */}
      <div className="wave-layer wave-fast opacity-70">
        <svg preserveAspectRatio="none" viewBox="0 0 2880 1000" className="w-full h-[50%] lg:h-[70%] text-lavender drop-shadow-2xl">
          <path className="neon-wave" stroke="#a78bfa" strokeWidth="2" d="
            M0, 400
            C 350, 200,   370, 600,   720, 400
            C 1070, 200, 1090, 600,  1440, 400
            C 1790, 200, 1810, 600,  2160, 400
            C 2510, 200, 2530, 600,  2880, 400
          "/>
        </svg>
      </div>

      {/* Vignette Overlay for Premium Feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none"></div>
    </div>
  );
};

export default AnimatedBackground;
