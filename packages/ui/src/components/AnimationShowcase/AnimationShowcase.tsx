import React, { useState } from 'react';
import { usePawfectAnimations } from '../../hooks/usePawfectAnimations';

export const AnimationShowcase: React.FC = () => {
  const { triggerAnimation } = usePawfectAnimations();
  const [selectedAnimation, setSelectedAnimation] = useState('fade');
  
  const animations = [
    { id: 'fade', name: 'Fade In/Out' },
    { id: 'scale', name: 'Scale Up' },
    { id: 'slide', name: 'Slide In' },
    { id: 'bounce', name: 'Bounce' },
    { id: 'pulse', name: 'Pulse' },
    { id: 'shake', name: 'Shake (Error)' },
    { id: 'flip', name: 'Flip (Premium)' },
    { id: 'rotate', name: 'Rotate (Premium)' },
    { id: 'morph', name: 'Morph (Premium)' },
    { id: 'glow', name: 'Glow (Premium)' },
    { id: 'wave', name: 'Wave (Premium)' },
    { id: 'confetti', name: 'Confetti (Premium)' }
  ];
  
  const handleAnimation = (animationType: string) => {
    setSelectedAnimation(animationType);
    triggerAnimation('showcase-box', {
      type: animationType as unknown,
      duration: 600,
      onComplete: () => {
        // Reset to default animation after completion
        setTimeout(() => {
          const element = document.getElementById('showcase-box');
          if (element !== null && element !== undefined) {
            element.className = 'showcase-box';
          }
        }, 100);
      }
    });
  };
  
  return (
    <div className="animation-showcase">
      <h2 className="showcase-title">Animation Showcase</h2>
      
      <div className="animation-controls">
        {animations.map((animation) => (
          <button
            key={animation.id}
            onClick={() => { handleAnimation(animation.id); }}
            className={`animation-button ${selectedAnimation === animation.id ? 'active' : ''}`}
          >
            {animation.name}
          </button>
        ))}
      </div>
      
      <div id="showcase-box" className="showcase-box">
        <h3>Animation Preview</h3>
        <p>Currently demonstrating: {selectedAnimation}</p>
        <div className="animation-indicator">
          <div className="indicator-dot" />
        </div>
      </div>
      
      <style jsx>{`
        .animation-showcase {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .showcase-title {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2rem;
          font-weight: bold;
        }
        
        .animation-controls {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .animation-button {
          padding: 0.75rem 1rem;
          background-color: #f0f0f0;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .animation-button:hover {
          background-color: #e0e0e0;
        }
        
        .animation-button.active {
          background-color: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
        
        .showcase-box {
          width: 300px;
          height: 200px;
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
          margin: 0 auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .showcase-box p {
          margin: 0.5rem 0;
          text-align: center;
        }
        
        .showcase-box h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .animation-indicator {
          margin-top: 1rem;
        }
        
        .indicator-dot {
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default AnimationShowcase;
