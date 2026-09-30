import React from 'react';
import { Home, Compass, MessageSquare, Bell, Bookmark, User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const LeftSidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();

  return (
    <aside className="h-full flex flex-col px-4 xl:px-6 py-6 xl:py-8 overflow-y-auto hide-scrollbar w-full border-r border-border-light dark:border-border-dark md:border-none">
      {/* Profile Card */}
      <div className="flex items-center gap-4 mb-8 xl:mb-10 p-2 xl:p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0 overflow-hidden flex items-center justify-center">
          {user?.profilePic && <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />}
        </div>
        <div className="hidden xl:block">
          <h2 className="font-semibold text-[15px] leading-tight truncate w-32">{user?.name}</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-[13px] truncate w-32">@{user?.username}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative w-full flex items-center xl:justify-start justify-center gap-4 px-3 xl:px-4 py-3 xl:py-3.5 rounded-full group outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary hidden xl:block"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-primary/10 xl:hidden" />
              )}
              
              <div className={cn(
                "relative z-10 flex items-center justify-center xl:justify-start gap-4 w-full transition-colors duration-200",
                isActive ? "text-primary xl:text-white" : "text-text-primary-light dark:text-text-primary-dark group-hover:text-primary"
              )}>
                <Icon size={24} className={cn(
                  "transition-transform duration-200 xl:w-[22px] xl:h-[22px]",
                  !isActive && "group-hover:scale-110",
                  isActive && "fill-current xl:fill-none"
                )} />
                <span className={cn(
                  "text-[16px] hidden xl:block",
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <button 
        aria-label="Toggle Theme"
        onClick={toggleTheme}
        className="flex items-center justify-center xl:justify-start gap-4 px-3 xl:px-4 py-3 xl:py-3.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all group mt-6 xl:mt-8 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary mb-2"
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-6 h-6 xl:w-[22px] xl:h-[22px] flex items-center justify-center"
        >
          {theme === 'dark' ? (
            <Moon className="absolute w-full h-full text-text-primary-dark" />
          ) : (
            <Sun className="absolute w-full h-full text-orange-500" />
          )}
        </motion.div>
        <span className="font-medium text-[16px] hidden xl:block">
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>

      {/* Logout Button */}
      <button 
        aria-label="Logout"
        onClick={() => logout()}
        className="flex items-center justify-center xl:justify-start gap-4 px-3 xl:px-4 py-3 xl:py-3.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group mt-auto w-full outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <LogOut size={24} className="group-hover:-translate-x-1 transition-transform xl:w-[22px] xl:h-[22px]" />
        <span className="font-medium text-[16px] hidden xl:block">Logout</span>
      </button>
    </aside>
  );
};

export default LeftSidebar;
