import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/composite/Navbar';
import { FloatingCartBar } from '../components/composite/FloatingCartBar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      <Navbar />
      <main className="flex-1 pb-24 sm:pb-28">
        <Outlet />
      </main>
      <FloatingCartBar />
    </div>
  );
};
