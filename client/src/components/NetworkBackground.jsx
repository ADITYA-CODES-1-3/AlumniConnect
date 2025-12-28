import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const NetworkBackground = () => {
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles-network"
      init={particlesInit}
      options={{
        fullScreen: { enable: false }, // We handle sizing via CSS
        background: {
          color: { value: "#0f172a" }, // Dark Navy Base
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: { enable: true, mode: "push" }, // Click creates dots
            onHover: { enable: true, mode: "grab" }, // Hover connects dots
            resize: true,
          },
          modes: {
            grab: { distance: 180, links: { opacity: 1 } }, // Strong connection on hover
            push: { quantity: 4 },
          },
        },
        particles: {
          color: { value: "#38bdf8" }, // Cyan Color
          links: {
            color: "#38bdf8",
            distance: 150,
            enable: true,
            opacity: 0.2, // Subtle lines normally
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: { default: "out" },
            random: false,
            speed: 1.5, // Slow floating speed
            straight: false,
          },
          number: {
            density: { enable: true, area: 800 },
            value: 100, // Number of particles
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    />
  );
};

export default NetworkBackground;