import React from 'react';
import { Search } from 'lucide-react';
import StoriesSection from '../stories/StoriesSection';

const RightSidebar = ({ suggestedUsers = [], trendingTopics = [], stories = [] }) => {
  return (
    <aside className="h-full flex flex-col px-4 lg:px-6 py-6 lg:py-8 overflow-y-auto hide-scrollbar w-full">
      
      {/* Search Bar */}
      <div className="relative mb-6 lg:mb-8 shrink-0">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
          <Search size={18} className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
        </div>
        <input 
          type="text" 
          aria-label="Search"
          placeholder="Search..." 
          className="w-full bg-white dark:bg-[#1A2235] text-text-primary-light dark:text-text-primary-dark rounded-full py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 outline-none border border-border-light dark:border-border-dark focus:border-primary dark:focus:border-primary transition-colors text-[13px] lg:text-[14px] shadow-soft placeholder:text-text-secondary-light/70 focus-visible:ring-2 focus-visible:ring-primary/50"
        />
      </div>

      {/* Stories Section (Desktop only, mobile shows in feed) */}
      <div className="hidden md:block">
        <StoriesSection stories={stories} />
      </div>

      {/* Suggested Users */}
      <div className="mb-6 lg:mb-8 bg-white dark:bg-[#1A2235] rounded-[20px] lg:rounded-[24px] p-4 lg:p-5 shadow-soft border border-border-light dark:border-border-dark">
        <h3 className="font-semibold text-[15px] lg:text-[16px] mb-4 lg:mb-5">Who to follow</h3>
        <div className="space-y-4 lg:space-y-5">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 lg:gap-3 overflow-hidden">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0 overflow-hidden">
                    {user.avatar && <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[13px] lg:text-[14px] leading-tight hover:underline cursor-pointer truncate">{user.name}</span>
                    <span className="text-[11px] lg:text-[12px] text-text-secondary-light dark:text-text-secondary-dark truncate">{user.mutual} mutuals</span>
                  </div>
                </div>
                <button aria-label={`Follow ${user.name}`} className="shrink-0 ml-2 px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[12px] lg:text-[13px] font-medium border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  Follow
                </button>
              </div>
            ))
          ) : (
            <p className="text-[13px] text-text-secondary-light dark:text-text-secondary-dark text-center py-2">No suggestions right now.</p>
          )}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-[#1A2235] rounded-[20px] lg:rounded-[24px] p-4 lg:p-5 shadow-soft border border-border-light dark:border-border-dark mb-4">
        <h3 className="font-semibold text-[15px] lg:text-[16px] mb-4 lg:mb-5">Trending for you</h3>
        <div className="space-y-3 lg:space-y-4">
          {trendingTopics.length > 0 ? (
            trendingTopics.map((topic) => (
              <div key={topic.id} className="group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1 -m-1">
                <p className="text-[11px] lg:text-[12px] text-text-secondary-light dark:text-text-secondary-dark mb-0.5">Trending</p>
                <h4 className="font-semibold text-[14px] lg:text-[15px] group-hover:text-primary transition-colors">{topic.tag}</h4>
                <p className="text-[11px] lg:text-[12px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">{topic.posts} Posts</p>
              </div>
            ))
          ) : (
            <p className="text-[13px] text-text-secondary-light dark:text-text-secondary-dark text-center py-2">Nothing trending right now.</p>
          )}
        </div>
      </div>

    </aside>
  );
};

export default RightSidebar;
