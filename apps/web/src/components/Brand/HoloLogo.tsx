'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { SPRING_CONFIG } from '@/constants/animations';

interface HoloLogoProps {
  size?: number; // diameter of the emblem in px
  withText?: boolean;
  monochrome?: boolean; // frosty mono variant
}

const HoloLogo: React.FC<HoloLogoProps> = ({ size = 44, withText = true, monochrome = false }) => {
  const emblemSize = size;

  return (
    <motion.div
      className="flex items-center gap-2 select-none"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_CONFIG}
    >
      {/* Simple minimal emblem */}
      <div className="relative" style={{ width: emblemSize, height: emblemSize }} aria-hidden="true">
        {/* Clean circle background */}
        <div className="absolute inset-0 rounded-full bg-white/10 border border-white/20" />
        {/* Paw prints icon */}
        <svg
          className="absolute inset-0 m-auto"
          viewBox="0 0 24 24"
          width={emblemSize * 0.7}
          height={emblemSize * 0.7}
          role="img"
          aria-label="Paw prints logo"
          fill="currentColor"
          stroke="none"
        >
          {/* First paw print */}
          <g transform="translate(-2, -1) scale(0.8)">
            {/* Toes */}
            <ellipse cx="8" cy="6" rx="1.5" ry="2" />
            <ellipse cx="12" cy="5" rx="1.5" ry="2" />
            <ellipse cx="16" cy="6" rx="1.5" ry="2" />
            <ellipse cx="10" cy="9" rx="1.2" ry="1.8" />
            {/* Main pad */}
            <ellipse cx="12" cy="13" rx="3" ry="2.5" />
          </g>
          
          {/* Second paw print (smaller, offset) */}
          <g transform="translate(4, 6) scale(0.6)" opacity="0.7">
            {/* Toes */}
            <ellipse cx="8" cy="6" rx="1.5" ry="2" />
            <ellipse cx="12" cy="5" rx="1.5" ry="2" />
            <ellipse cx="16" cy="6" rx="1.5" ry="2" />
            <ellipse cx="10" cy="9" rx="1.2" ry="1.8" />
            {/* Main pad */}
            <ellipse cx="12" cy="13" rx="3" ry="2.5" />
          </g>
        </svg>
      </div>

      {withText && (
        <div className="relative">
          <motion.span
            className="block text-xl font-normal tracking-wide text-white/90"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
          >
            paws
          </motion.span>
        </div>
      )}
    </motion.div>
  );
};

export default HoloLogo;


