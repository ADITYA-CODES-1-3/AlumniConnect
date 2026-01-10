import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f172a]/90 backdrop-blur-lg">
      
      <div className="relative flex items-center justify-center">
        
        {/* 1. Background Ambient Glow */}
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3] 
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute w-40 h-40 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none"
        />

        {/* 2. Outer Cyber Ring (Cyan) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 rounded-full border border-white/5 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        />

        {/* 3. Middle Dashed Ring (Gold - Reverse Spin) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-24 h-24 rounded-full border-2 border-dashed border-amber-500/40 border-t-amber-400"
        />

        {/* 4. Inner Fast Ring (White) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute w-20 h-20 rounded-full border border-transparent border-l-white/50 border-r-white/10"
        />

        {/* 5. Central Logo Capsule */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center shadow-2xl border border-white/10"
        >
          {/* Logo Pulse Animation */}
          <motion.img 
            src={logo} 
            alt="Loading..." 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          />
        </motion.div>
      </div>

      {/* 6. Loading Text with Blinking Cursor */}
      <div className="mt-12 flex flex-col items-center gap-2">
        <motion.span 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-cyan-400 font-mono text-xs tracking-[0.4em] font-bold uppercase"
        >
          System Initializing
        </motion.span>
        
        {/* Progress Bar Line */}
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
           <motion.div 
             initial={{ x: "-100%" }}
             animate={{ x: "100%" }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
             className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
           />
        </div>
      </div>

    </div>
  );
};

export default Loader;