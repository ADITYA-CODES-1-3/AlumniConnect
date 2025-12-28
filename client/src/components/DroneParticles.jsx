import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const DroneParticles = () => {
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false }, // Important: Fits inside our div
        background: {
          color: { value: "transparent" },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab", // Connects drones on hover
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              links: { opacity: 1 }
            },
          },
        },
        particles: {
          color: { value: "#38bdf8" }, // Light Blue Drones
          links: {
            color: "#38bdf8",
            distance: 150,
            enable: true,
            opacity: 0.4,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: { default: "bounce" }, // Stay inside
            random: false,
            speed: 2, // Drone speed
            straight: false,
          },
          number: {
            density: { enable: true, area: 800 },
            value: 80, // Number of drones
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle", // Drone shape
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
  );
};

export default DroneParticles;