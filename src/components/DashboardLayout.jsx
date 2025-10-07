import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '@/components/sections/DashboardHeader';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
