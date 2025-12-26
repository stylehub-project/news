
import React from 'react';
import MapLoader from './MapLoader';

const MapContextLoader: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.9)_100%)]"></div>
      
      {/* Scanning Line */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>

      {/* Decorative HUD Elements */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-cyan-500/60 leading-tight">
         <div className="animate-pulse">SAT_LINK: ONLINE</div>
         <div>LAT: 34.0522 N</div>
         <div>LNG: 118.2437 W</div>
      </div>
      
      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-cyan-500/60 leading-tight text-right">
         <div>ZOOM: 1.0x</div>
         <div>MODE: ORBITAL</div>
         <div className="mt-1 text-cyan-300 animate-pulse">receiving_telemetry...</div>
      </div>

      {/* Crosshairs */}
      <div className="absolute top-1/2 left-4 w-4 h-[1px] bg-cyan-500/30"></div>
      <div className="absolute top-1/2 right-4 w-4 h-[1px] bg-cyan-500/30"></div>
      <div className="absolute top-4 left-1/2 w-[1px] h-4 bg-cyan-500/30"></div>
      <div className="absolute bottom-4 left-1/2 w-[1px] h-4 bg-cyan-500/30"></div>

      {/* Main Loader */}
      <div className="relative z-10 scale-125">
          <MapLoader text="Establishing Uplink..." />
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};
export default MapContextLoader;
