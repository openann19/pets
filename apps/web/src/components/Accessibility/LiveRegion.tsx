'use client';

import React from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  role?: 'status' | 'alert';
}

export const LiveRegion = ({ message, priority = 'polite', role = 'status' }: LiveRegionProps) => {
  if (!message) return null;

  return (
    <div
      role={role}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

export default LiveRegion;
