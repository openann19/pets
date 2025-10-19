import { useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
}

export const useConfetti = () => {
  const fire = useCallback((options: ConfettiOptions = {}) => {
    const {
      particleCount = 100,
      spread = 70,
      origin = { x: 0.5, y: 0.5 },
      colors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#9C27B0'],
    } = options;

    confetti({
      particleCount,
      spread,
      origin,
      colors,
      ticks: 200,
      gravity: 1,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['circle', 'square'],
      scalar: 1.2,
    });
  }, []);

  const fireworks = useCallback(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaultConfettiOptions,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFD700'],
      });
      confetti({
        ...defaultConfettiOptions,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#9C27B0', '#FF9800', '#4ECDC4'],
      });
    }, 250);
  }, []);

  const burst = useCallback((element?: HTMLElement) => {
    const rect = element?.getBoundingClientRect();
    const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
    const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;

    fire({
      particleCount: 50,
      spread: 60,
      origin: { x, y },
    });
  }, [fire]);

  return { fire, fireworks, burst };
};
