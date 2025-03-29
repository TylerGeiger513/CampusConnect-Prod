import React, { useCallback, useLayoutEffect, useState, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import useTheme from "../../hooks/useTheme";

const ParticleBackground = () => {
  const { theme } = useTheme();

  const getParticleOptions = useCallback(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--primary-a30').trim() || "#975cce";
    const surfaceColor = rootStyles.getPropertyValue('--surface-a0').trim() || "#ffffff";

    return {
      fullScreen: { enable: true, zIndex: -1 },
      background: { color: { value: surfaceColor } },
      particles: {
        number: { value: 150, density: { enable: true, area: 800 } },
        color: { value: primaryColor },
        shape: { type: "circle" },
        opacity: { value: 0.6, random: true },
        size: { value: { min: 2, max: 4 }, random: true },
        move: { enable: true, speed: 4, direction: "none", random: true },
        links: {
          enable: true,
          distance: 120,
          color: primaryColor,
          opacity: 0.4,
          width: 1.2,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
        },
        modes: {
          grab: { distance: 150, lineLinked: { opacity: 0.7 } },
        },
      },
      detectRetina: true,
    };
  }, []);

  const [particleOptions, setParticleOptions] = useState(getParticleOptions);
  const [initDone, setInitDone] = useState(false);

  // Update particle options when the theme changes
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      setParticleOptions(getParticleOptions());
    }, 0);
    return () => clearTimeout(timer);
  }, [theme, getParticleOptions]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // Load the slim package
      await loadSlim(engine);
    }).then(() => {
      setInitDone(true);
    });
  }, []);

  if (!initDone) {
    return null;
  }

  return (
    <Particles key={theme} id="tsparticles" options={particleOptions} />
  );
};

export default ParticleBackground;
