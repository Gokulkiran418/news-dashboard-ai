// components/StarryBackground.tsx
'use client';

import { useEffect } from 'react';
import { tsParticles } from '@tsparticles/engine';
import { loadFull } from 'tsparticles';


interface StarryBackgroundProps {
  theme?: string;
}

const StarryBackground: React.FC<StarryBackgroundProps> = ({ theme }) => {
  useEffect(() => {
    const isDark = theme === 'dark';
    const init = async () => {
      await loadFull(tsParticles);

      tsParticles.load({
        id: 'tsparticles',
        options: {
          background: {
            color: {
              value: isDark ? '#000000' : '#ffffff',
            },
          },
          fullScreen: {
            enable: true,
            zIndex: -1,
          },
          particles: {
            number: {
              value: 200,
              density: { enable: true, width: 800 },
            },
            color: {
              value: isDark ? ['#ffffff', '#ffcc66', '#66ccff'] : ['#000000', '#444444'],
            },
            shape: { type: 'circle' },
            opacity: {
              value: { min: 0.5, max: 0.8 },
              animation: {
                enable: true,
                speed: 0.5,
                startValue: 'random',
                sync: false,
              },
            },
            size: {
              value: { min: 0.5, max: 2 },
            },
            move: {
              enable: true,
              speed: 0.2,
              direction: 'none',
              random: true,
              outModes: { default: 'out' },
              attract: {
                enable: true,
                rotate: { x: 600, y: 1200 },
              },
            },
          },
          retinaDetect: true,
        },
      });
    };

    init();

    return () => {
      tsParticles.dom().forEach((inst) => inst.destroy());
    };
  }, [theme]);

  return <div id="tsparticles" className="fixed inset-0 z-[-1]" />;
};

export default StarryBackground;