'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';

import { useSocket } from '../hooks/useSocket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socket = useSocket();
  const isConnected = socket?.connected || false;

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}
