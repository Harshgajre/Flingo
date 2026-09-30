import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { X, Trash2 } from 'lucide-react';

const StoriesSection = () => {
  const { user } = useAuthStore();
  const [stories, setStories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const fileInputRef = useRef(null);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories/feed', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleUploadStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await fetch('/api/stories/create', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        const newStory = await res.json();
        setStories([newStory, ...stories]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      const res = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setStories(stories.filter(s => s._id !== storyId));
        setViewingStory(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="mb-6 shrink-0 w-full overflow-hidden">
        <h3 className="font-semibold text-[16px] mb-4 px-2 hidden md:block">Stories</h3>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-2 snap-x snap-mandatory">
          <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleUploadStory} />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Add Story"
            className="flex flex-col items-center gap-2 cursor-pointer group min-w-[72px] outline-none snap-start focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1 disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-border-light dark:border-border-dark flex items-center justify-center group-hover:border-primary transition-colors bg-white dark:bg-[#1A2235]">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-2xl text-primary font-light">+</span>
              )}
            </div>
            <span className="text-[12px] font-medium text-text-primary-light dark:text-text-primary-dark">Add Story</span>
          </button>
          
          {stories.map((story) => (
            <button 
              key={story._id} 
              onClick={() => setViewingStory(story)}
              aria-label={`View ${story.user?.name || 'User'}'s story`}
              className="flex flex-col items-center gap-2 cursor-pointer group min-w-[72px] outline-none snap-start focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1"
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-primary via-secondary to-cyan group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border-[3px] border-background-light dark:border-background-dark overflow-hidden bg-white dark:bg-[#1A2235]">
                  {story.user?.profilePic ? (
                    <img src={story.user.profilePic} alt={story.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
                  )}
                </div>
              </div>
              <span className="text-[12px] font-medium text-text-secondary-light dark:text-text-secondary-dark truncate w-[72px] text-center">
                {story.user?.name ? story.user.name.split(' ')[0] : 'User'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {viewingStory && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center">
          <button 
            onClick={() => setViewingStory(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          
          {user?._id === viewingStory.user?._id && (
            <button 
              onClick={() => handleDeleteStory(viewingStory._id)}
              className="absolute top-4 right-16 p-2 text-red-500 hover:bg-white/10 rounded-full transition-colors"
            >
              <Trash2 size={24} />
            </button>
          )}

          <div className="w-full max-w-lg aspect-[9/16] bg-black relative flex flex-col justify-center">
             <div className="absolute top-4 left-4 flex items-center gap-3 z-10 bg-black/40 px-3 py-1.5 rounded-full">
               <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                 {viewingStory.user?.profilePic && <img src={viewingStory.user.profilePic} className="w-full h-full object-cover" />}
               </div>
               <span className="text-white font-semibold text-sm">{viewingStory.user?.name}</span>
             </div>
             
             {viewingStory.media.match(/\.(mp4|webm)$/i) ? (
               <video src={viewingStory.media} controls autoPlay className="w-full max-h-full" />
             ) : (
               <img src={viewingStory.media} alt="story" className="w-full max-h-full object-contain" />
             )}
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesSection;
