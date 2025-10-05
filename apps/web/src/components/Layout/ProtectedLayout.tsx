import React from 'react';
import Header from './Header';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ 
  children, 
  showHeader = true 
}) => {
  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  );
};

export default ProtectedLayout;
