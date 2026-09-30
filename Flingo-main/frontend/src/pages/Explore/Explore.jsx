import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Filter } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TRENDING_CATEGORIES = [
  'All', 'Design', 'Photography', 'Technology', 'Travel', 'Art', 'Nature', 'Fashion', 'Architecture'
];

const SKELETON_HEIGHTS = [
  'h-[220px]', 'h-[320px]', 'h-[250px]', 'h-[280px]', 
  'h-[180px]', 'h-[350px]', 'h-[240px]', 'h-[300px]'
];

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const res = await fetch('/api/posts/explore');
        if (res.ok) {
          const data = await res.json();
          // Filter out posts without media for the pinterest style grid
          const mediaPosts = data.filter(post => post.media && post.media.length > 0);
          setPosts(mediaPosts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExplore();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/users/search?query=${searchQuery}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <main className="flex-1 w-full h-full overflow-y-auto hide-scrollbar relative z-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Explore</h1>

          {/* Search Bar */}
          <div className="flex items-center gap-3 w-full max-w-2xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for people..."
                className="w-full bg-white dark:bg-[#1A2235] text-text-primary-light dark:text-text-primary-dark rounded-full py-3 md:py-4 pl-12 pr-4 outline-none border border-border-light dark:border-border-dark focus:border-primary dark:focus:border-primary transition-colors text-[15px] shadow-soft placeholder:text-text-secondary-light/70 focus-visible:ring-2 focus-visible:ring-primary/50"
              />
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A2235] border border-border-light dark:border-border-dark rounded-2xl shadow-xl overflow-hidden z-20 max-h-[300px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <div 
                      key={user._id} 
                      onClick={() => navigate(`/profile/${user.username}`)}
                      className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0">
                        {user.profilePic && <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[14px]">{user.name}</h4>
                        <p className="text-[12px] text-text-secondary-light dark:text-text-secondary-dark">@{user.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button aria-label="Filter" className="p-3 md:p-4 rounded-full bg-white dark:bg-[#1A2235] border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Filter size={20} className="text-text-secondary-light dark:text-text-secondary-dark" />
            </button>
          </div>
        </div>

        {/* Trending Categories */}
        <div className="mb-8 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-semibold text-[16px]">Trending Now</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {TRENDING_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-5 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary outline-none",
                    isActive
                      ? "bg-text-primary-light dark:bg-text-primary-dark text-background-light dark:text-background-dark"
                      : "bg-white dark:bg-[#1A2235] text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark hover:border-primary/50"
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {!isLoading && posts.length > 0 ? (
            posts.map((post) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                key={post._id}
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-[20px]"
              >
                <img
                  src={post.media[0]}
                  alt={post.content || "Post"}
                  className="w-full h-auto object-cover rounded-[20px] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-[20px]">
                  <h3 className="text-white font-semibold text-[15px] leading-tight mb-1 truncate">{post.content || "Media Post"}</h3>
                  <p className="text-white/80 text-[12px]">{post.user?.name}</p>
                </div>
              </motion.div>
            ))
          ) : (
            SKELETON_HEIGHTS.map((height, index) => (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                key={`skeleton-${index}`}
                className={cn(
                  "w-full rounded-[20px] bg-black/5 dark:bg-white/5 animate-pulse break-inside-avoid",
                  height
                )}
              />
            ))
          )}
        </div>

      </div>
    </main>
  );
};

export default Explore;
