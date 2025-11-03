// ./src/components/MainLayout.tsx
"use client";

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from './Header'; 
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
        {/* <Header /> */}
        <main className="flex-grow relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30 dark:opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1),transparent_50%),radial-gradient(circle_at_40%_80%,rgba(120,200,255,0.1),transparent_50%)]" />
          </div>
          
          {/* Main Content */}
          <div className="relative z-10">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default MainLayout;