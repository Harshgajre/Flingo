import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import PostCard from '../../components/home/PostCard';
import { useAuthStore } from '../../store/authStore';

const Bookmarks = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await fetch('/api/posts/bookmarks', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`/api/posts/like/${postId}`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const res = await fetch(`/api/users/bookmark/${postId}`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, bookmarks: data.bookmarks });
        // Optionally remove from list immediately, but lets keep it until refresh or let user toggle it back
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const res = await fetch(`/api/posts/comment/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(p => p._id === postId ? { ...p, comments: data } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 pb-24 lg:pb-8 h-full overflow-y-auto hide-scrollbar">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0">
          <Bookmark size={20} className="fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Saved Posts</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Your personal collection of favorite Flingo moments.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading bookmarks...</div>
      ) : posts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full mt-12 flex flex-col items-center justify-center text-center p-8 glass-card border-dashed border-2 border-border-light dark:border-border-dark"
        >
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
            <Bookmark size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">No bookmarks yet</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-sm">
            When you see something you like, tap the bookmark icon to save it here for later.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              onLike={handleLike} 
              onBookmark={handleBookmark} 
              onComment={handleComment} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
