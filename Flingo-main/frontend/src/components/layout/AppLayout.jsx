import React from 'react';
import { Outlet } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import BottomNavigation from './BottomNavigation';

const AppLayout = () => {
  return (
    <div className="max-w-[1440px] mx-auto w-full flex justify-center h-screen overflow-hidden bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
      {/* Left Sidebar - Persistent across routes */}
      <div className="hidden md:block w-[80px] xl:w-[280px] h-full flex-shrink-0 transition-all duration-300 z-10 border-r border-border-light dark:border-border-dark md:border-none">
        <LeftSidebar />
      </div>

      {/* Main Content Area (Dynamic based on route) */}
      <div className="flex-1 w-full flex h-full overflow-hidden">
        <Outlet />
      </div>

      {/* Bottom Navigation - Persistent across routes on Mobile */}
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
