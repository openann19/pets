import { motion } from 'framer-motion';
import React from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
  userNames: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  userNames,
}) => {
  if (!isVisible || userNames.length === 0) return null;

  const getTypingText = () => {
    if (userNames.length === 1) {
      return `${userNames[0]} is typing...`;
    } else if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing...`;
    } else {
      return `${userNames[0]} and ${userNames.length - 1} others are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center space-x-2 px-4 py-2"
    >
      {/* Avatar */}
      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
        {userNames[0]?.[0] || '?'}
      </div>

      {/* Typing bubble */}
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2 flex items-center space-x-1">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Typing text */}
      <span className="text-xs text-gray-500 italic">
        {getTypingText()}
      </span>
    </motion.div>
  );
};

export default TypingIndicator;
