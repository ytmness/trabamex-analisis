import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/sections/Header';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
