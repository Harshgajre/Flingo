import React from 'react';
import RightSidebar from '../../components/layout/RightSidebar';
import Feed from '../../components/home/Feed';

const Home = () => {
  return (
    <>
      {/* Main Feed - Scrollable */}
      <main className="flex-1 w-full max-w-full md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] h-full overflow-y-auto hide-scrollbar md:border-x border-border-light dark:border-border-dark relative z-0">
        <Feed />
      </main>

      {/* Right Sidebar - Hidden on mobile and tablet, Full on desktop */}
      <div className="hidden lg:block w-[300px] xl:w-[320px] h-full flex-shrink-0 transition-all duration-300 z-10">
        <RightSidebar />
      </div>
    </>
  );
};

export default Home;
