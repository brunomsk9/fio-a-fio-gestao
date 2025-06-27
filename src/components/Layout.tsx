import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '../hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className={`flex-1 ${isMobile ? 'w-full' : 'ml-64'}`}>
          <div className="p-8 max-w-7xl mx-auto">
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
