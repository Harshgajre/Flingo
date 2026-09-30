import React, { useState, useEffect, useRef } from 'react';
import { Image, Video, Smile, Globe, MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, Send } from 'lucide-react';
import { cn } from '../../utils/cn';
import StoriesSection from '../stories/StoriesSection';
import { useAuthStore } from '../../store/authStore';
import PostCard from './PostCard';

const TABS = ['Explore', 'Following'];

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) return;
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('content', content);
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (res.ok) {
        const newPost = await res.json();
        onPostCreated(newPost);
        setContent('');
        setMediaFile(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A2235] p-4 md:p-5 rounded-[24px] shadow-soft border border-border-light dark:border-border-dark mb-6 md:mb-8 transition-colors">
      <div className="flex gap-3 md:gap-4 mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0 overflow-hidden">
           {user?.profilePic && <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Write a new post"
            placeholder="What's happening?"
            className="w-full bg-transparent resize-none outline-none text-[15px] md:text-[16px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark pt-2 md:pt-3 min-h-[60px]"
          />
          {mediaFile && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-border-light dark:border-border-dark w-fit">
               <img src={URL.createObjectURL(mediaFile)} alt="preview" className="h-32 object-cover" />
               <button onClick={() => setMediaFile(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 text-xs">✕</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border-light dark:border-border-dark">
        <div className="flex items-center gap-1 md:gap-2 text-primary">
          <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={(e) => setMediaFile(e.target.files[0])} />
          <button onClick={() => fileInputRef.current?.click()} aria-label="Upload Image" className="p-2 rounded-full hover:bg-primary/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none">
            <Image size={20} className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={handleSubmit} 
            disabled={isLoading || (!content.trim() && !mediaFile)}
            className="px-5 py-2 md:px-6 rounded-full text-white font-medium text-[13px] md:text-[14px] bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Feed = ({ stories = [] }) => {
  const [activeTab, setActiveTab] = useState('Explore');
  const [posts, setPosts] = useState([]);
  const { user, setUser } = useAuthStore();

  const fetchPosts = async () => {
    try {
      const endpoint = activeTab === 'Explore' ? '/api/posts/explore' : '/api/posts/feed';
      const res = await fetch(`${endpoint}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

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
        setUser({ ...user, bookmarks: data.bookmarks }); // Update local auth store
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

  const handleDelete = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-full flex flex-col pt-4 md:pt-8 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
      
      <div className="md:hidden">
        <StoriesSection stories={stories} />
      </div>

      <div className="flex items-center gap-6 md:gap-8 border-b border-border-light dark:border-border-dark mb-6 md:mb-8 overflow-x-auto hide-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 md:pb-4 text-[14px] md:text-[15px] font-medium transition-colors relative whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary outline-none rounded-t-md",
              activeTab === tab 
                ? "text-primary" 
                : "text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <CreatePost onPostCreated={(newPost) => setPosts([newPost, ...posts])} />

      <div className="pb-24 md:pb-20">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onLike={handleLike} onBookmark={handleBookmark} onComment={handleComment} onDelete={handleDelete} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-text-secondary-light dark:text-text-secondary-dark" />
            </div>
            <h3 className="text-[18px] font-semibold mb-2">No posts yet</h3>
            <p className="text-[14px] text-text-secondary-light dark:text-text-secondary-dark max-w-[250px]">
              Be the first to share your thoughts, images, or videos with your network.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
