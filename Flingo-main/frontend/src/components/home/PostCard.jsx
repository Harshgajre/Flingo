import React, { useState } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, Send, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, onLike, onBookmark, onComment, onDelete }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const isLiked = post.likes?.includes(user?._id);
  const isBookmarked = user?.bookmarks?.includes(post._id);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText('');
  };

  return (
    <article className="bg-white dark:bg-[#1A2235] p-4 md:p-5 rounded-[24px] shadow-soft border border-border-light dark:border-border-dark mb-4 md:mb-6 transition-transform hover:shadow-md">
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className="flex gap-3">
          <div 
            onClick={() => post.user?.username && navigate(`/profile/${post.user.username}`)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          >
            {post.user?.profilePic && <img src={post.user.profilePic} alt={post.user.name} className="w-full h-full object-cover" />}
          </div>
          <div className="flex flex-col justify-center">
            <h3 
              onClick={() => post.user?.username && navigate(`/profile/${post.user.username}`)}
              className="font-semibold text-[14px] md:text-[15px] hover:underline cursor-pointer"
            >
              {post.user?.name || 'Unknown User'}
            </h3>
            <div className="flex items-center gap-1 md:gap-2 text-[12px] md:text-[13px] text-text-secondary-light dark:text-text-secondary-dark">
              <span>@{post.user?.username || 'user'}</span>
              <span>•</span>
              <time>{new Date(post.createdAt).toLocaleDateString()}</time>
            </div>
          </div>
        </div>
        {user?._id === post.user?._id && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A2235] border border-border-light dark:border-border-dark rounded-xl shadow-lg z-10 overflow-hidden">
                <button 
                  onClick={() => { setShowMenu(false); onDelete && onDelete(post._id); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-[14px] md:text-[15px] leading-relaxed mb-3 md:mb-4 whitespace-pre-wrap">{post.content}</p>
      
      {post.media && post.media.length > 0 && (
        <div className="rounded-[16px] overflow-hidden mb-3 md:mb-4 border border-border-light dark:border-border-dark">
          <img src={post.media[0]} alt="Post media" className="w-full h-auto object-cover max-h-[400px] md:max-h-[500px]" loading="lazy" />
        </div>
      )}

      <div className="flex items-center justify-between pt-1 md:pt-2">
        <div className="flex items-center gap-2 md:gap-6">
          <button 
            onClick={() => onLike && onLike(post._id)}
            className={cn("flex items-center gap-1.5 md:gap-2 group transition-colors rounded-full", isLiked ? "text-red-500" : "text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500")}
          >
            <div className="p-1.5 md:p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
              <Heart size={20} className={cn("w-5 h-5", isLiked && "fill-current")} />
            </div>
            <span className="text-[13px] md:text-[14px] font-medium">{post.likes?.length || 0}</span>
          </button>
          
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 md:gap-2 group text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors rounded-full">
            <div className="p-1.5 md:p-2 rounded-full group-hover:bg-primary/10 transition-colors">
              <MessageCircle size={20} className="w-5 h-5" />
            </div>
            <span className="text-[13px] md:text-[14px] font-medium">{post.comments?.length || 0}</span>
          </button>
          
          <button className="flex items-center gap-1.5 md:gap-2 group text-text-secondary-light dark:text-text-secondary-dark hover:text-green-500 transition-colors rounded-full">
            <div className="p-1.5 md:p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
              <Share2 size={20} className="w-5 h-5" />
            </div>
          </button>
        </div>
        
        <button onClick={() => onBookmark && onBookmark(post._id)} className={cn("group transition-colors rounded-full", isBookmarked ? "text-yellow-500" : "text-text-secondary-light dark:text-text-secondary-dark hover:text-yellow-500")}>
          <div className="p-1.5 md:p-2 rounded-full group-hover:bg-yellow-500/10 transition-colors">
            <Bookmark size={20} className={cn("w-5 h-5", isBookmarked && "fill-current")} />
          </div>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
          <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-4">
             <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm outline-none" />
             <button type="submit" disabled={!commentText.trim()} className="text-primary disabled:opacity-50"><Send size={18} /></button>
          </form>
          <div className="space-y-3">
             {post.comments?.map((c, i) => (
                <div key={i} className="flex gap-2 text-sm">
                   <div className="font-semibold">{c.user?.name}</div>
                   <div>{c.text}</div>
                </div>
             ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
