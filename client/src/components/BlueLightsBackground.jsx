import React from 'react';
import { motion } from 'framer-motion';

const BlueLightsBackground = () => {
  // Configuration for the scattered lights
  const lights = [
    { color: '#3b82f6', x: -100, y: -100, scale: 1.5, duration: 15 }, // Blue
    { color: '#06b6d4', x: 200, y: 100, scale: 1.2, duration: 18 },   // Cyan
    { color: '#6366f1', x: -200, y: 200, scale: 1.8, duration: 20 },  // Indigo
    { color: '#2563eb', x: 100, y: -200, scale: 1.4, duration: 12 },  // Royal Blue
    { color: '#0891b2', x: 0, y: 0, scale: 1.6, duration: 25 },       // Teal
  ];

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      background: '#0f172a', // Deep Slate/Black background
      overflow: 'hidden', 
      zIndex: 0 
    }}>
      {/* Grid Overlay for "Tech" feel */}
      <div style={{
        position: 'absolute', inset: 0, 
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: 0.2, zIndex: 1
      }}></div>

      {/* Floating Lights */}
      {lights.map((light, index) => (
        <motion.div
          key={index}
          animate={{
            x: [light.x, light.x + 100, light.x - 100, light.x],
            y: [light.y, light.y - 100, light.y + 100, light.y],
            scale: [1, light.scale, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: light.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '500px', // Large lights
            height: '500px',
            background: light.color,
            borderRadius: '50%',
            filter: 'blur(120px)', // High blur creates "light" effect
            transform: 'translate(-50%, -50%)', // Center initially
            zIndex: 0
          }}
        />
      ))}
    </div>
  );
};

export default BlueLightsBackground;