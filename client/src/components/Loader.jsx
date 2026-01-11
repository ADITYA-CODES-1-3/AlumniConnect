import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png'; 

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-black backdrop-blur-xl">
      
      <div className="relative flex items-center justify-center">
        
        {/* Glow Effect */}
        <div className="absolute w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute w-24 h-24 rounded-full border-[1px] border-cyan-500/20 border-t-cyan-400 border-r-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]"
        />

        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-16 h-16 rounded-full border-[1px] border-blue-500/20 border-b-blue-400"
        />

        {/* Central Logo Capsule - Fixed Square Issue */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          // Added overflow-hidden to clip any square corners
          className="relative z-10 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 overflow-hidden shadow-lg"
        >
          <motion.img 
            src={logo} 
            alt="Loading..." 
            animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            // Added rounded-full here too and object-cover to fill the circle if needed
            className="w-8 h-8 object-contain rounded-full" 
          />
        </motion.div>
      </div>

      {/* Loading Text */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <motion.span 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-cyan-500/80 font-mono text-[10px] tracking-[0.3em] font-bold uppercase"
        >
          AlumniConnect
        </motion.span>
        
        {/* Loader Line */}
        <div className="w-24 h-[2px] bg-slate-800 rounded-full overflow-hidden relative">
           <motion.div 
             className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
             animate={{ x: ["-100%", "200%"] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
           />
        </div>
      </div>

    </div>
  );
};

export default Loader;
