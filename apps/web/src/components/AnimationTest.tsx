// Animation Test Component
// Tests the new micro-interactions and animations

import React from 'react';
import { motion } from 'framer-motion';

const AnimationTest: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Animation Test Suite</h1>
      
      {/* Hover Lift Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Hover Lift Effect</h2>
        <div className="flex gap-4">
          <div className="hover-lift bg-white p-6 rounded-xl shadow-lg cursor-pointer">
            <p>Hover me to lift!</p>
          </div>
          <div className="hover-scale bg-blue-100 p-6 rounded-xl shadow-lg cursor-pointer">
            <p>Hover me to scale!</p>
          </div>
          <div className="hover-glow bg-green-100 p-6 rounded-xl shadow-lg cursor-pointer">
            <p>Hover me to glow!</p>
          </div>
        </div>
      </div>

      {/* Pulse Animation Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pulse Animation</h2>
        <div className="flex gap-4">
          <div className="pulse-soft bg-yellow-100 p-6 rounded-xl shadow-lg">
            <p>I pulse softly!</p>
          </div>
          <div className="bg-red-100 p-6 rounded-xl shadow-lg">
            <p>I don't pulse</p>
          </div>
        </div>
      </div>

      {/* Button Micro-interactions Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Button Micro-interactions</h2>
        <div className="flex gap-4">
          <button className="btn-micro bg-blue-500 text-white px-6 py-3 rounded-lg">
            Micro Button
          </button>
          <button className="bg-gray-500 text-white px-6 py-3 rounded-lg">
            Regular Button
          </button>
        </div>
      </div>

      {/* Card Entrance Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Card Entrance Animation</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="card-entrance bg-white p-6 rounded-xl shadow-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <p>Card {i}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shimmer Loading Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Shimmer Loading Effect</h2>
        <div className="shimmer bg-gray-200 h-8 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
        </div>
      </div>

      {/* Bounce Animation Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Bounce Animation</h2>
        <div className="flex gap-4">
          <div className="bounce-in bg-purple-100 p-6 rounded-xl shadow-lg">
            <p>I bounce in!</p>
          </div>
        </div>
      </div>

      {/* Swipe Animation Test */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Swipe Animations</h2>
        <div className="flex gap-4">
          <div className="swipe-right bg-green-100 p-6 rounded-xl shadow-lg">
            <p>Swipe Right</p>
          </div>
          <div className="swipe-left bg-red-100 p-6 rounded-xl shadow-lg">
            <p>Swipe Left</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationTest;
