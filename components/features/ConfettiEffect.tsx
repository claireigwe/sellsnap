"use client";

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export function ConfettiEffect({ trigger }: { trigger: boolean }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!trigger || fired.current) return;
    fired.current = true;

    const duration = 3000;
    const end = Date.now() + duration;

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#1668e3', '#5bd8ca', '#bc1b1b'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#1668e3', '#5bd8ca', '#bc1b1b'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }

    frame();
  }, [trigger]);

  return null;
}
