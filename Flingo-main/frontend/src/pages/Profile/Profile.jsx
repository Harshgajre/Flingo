import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import { Settings, MapPin, Link as LinkIcon, Calendar, User, Bookmark, MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import { useAuthStore } from '../../store/authStore';
import PostCard from '../../components/home/PostCard';

const PROFILE_TABS = ['Posts', 'Replies', 'Media', 'Likes'];

const Profile = () => {
  const { username } = useParams();
  const { user: authUser, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const targetUsername = username || authUser?.username;
      if (!targetUsername) return;
      const res = await fetch(`/api/users/${targetUsername}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      } else {
        setProfileData(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, authUser]);

  useEffect(() => {
    const fetchTabContent = async () => {
      if (!profileData) return;
      try {
        let endpoint = '';
        if (activeTab === 'Posts' || activeTab === 'Replies' || activeTab === 'Media') {
          endpoint = `/api/posts/user/${profileData.username}`;
        } else if (activeTab === 'Likes') {
          endpoint = `/api/posts/liked/${profileData.username}`;
        }
        
        const res = await fetch(`${endpoint}`, { credentials: 'include' });
        if (res.ok) {
          let data = await res.json();
          if (activeTab === 'Media') {
            data = data.filter(p => p.media && p.media.length > 0);
          }
          setPosts(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTabContent();
  }, [activeTab, profileData]);

  const handleSaveProfile = async (formData) => {
    try {
      const res = await fetch('/api/users/update', {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setProfileData(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await fetch(`/api/users/follow/${profileData._id}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        // Toggle follow in local state
        const isFollowing = profileData.followers.some(f => f._id === authUser._id);
        setProfileData(prev => ({
          ...prev,
          followers: isFollowing 
            ? prev.followers.filter(f => f._id !== authUser._id)
            : [...prev.followers, { _id: authUser._id, name: authUser.name, username: authUser.username }]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!profileData) return <div className="p-8 text-center text-xl font-bold">User not found</div>;

  const isOwnProfile = authUser?._id === profileData._id;
  const isFollowing = profileData.followers?.some(f => f._id === authUser?._id);

  return (
    <main className="flex-1 w-full max-w-full md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] h-full overflow-y-auto hide-scrollbar md:border-r border-border-light dark:border-border-dark relative z-0">
      <div className="pb-24 md:pb-8">
        {/* Cover Photo */}
        <div className="h-32 md:h-48 lg:h-56 bg-gray-200 dark:bg-gray-800 relative w-full overflow-hidden">
           {profileData.coverPic && <img src={profileData.coverPic} alt="cover" className="w-full h-full object-cover" />}
        </div>

        <div className="px-4 sm:px-6">
          {/* Profile Info Header */}
          <div className="relative flex justify-between items-start mb-6">
            {/* Avatar */}
            <div className="relative -mt-12 md:-mt-16 z-10">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background-light dark:border-background-dark overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                {profileData.profilePic ? (
                  <img src={profileData.profilePic} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-text-secondary-light dark:text-text-secondary-dark opacity-50" />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:gap-3 mt-4">
              {isOwnProfile ? (
                <>
                  <Link to="/bookmarks" aria-label="Bookmarks" className="p-2 rounded-full border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center justify-center">
                    <Bookmark size={20} />
                  </Link>
                  <Link to="/settings" aria-label="Settings" className="p-2 rounded-full border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center justify-center">
                    <Settings size={20} />
                  </Link>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[13px] md:text-[14px] font-semibold border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/messages', { state: { targetUser: profileData } })}
                    className="p-2 rounded-full border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center justify-center"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button 
                    onClick={handleFollow}
                    className={cn(
                      "px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[13px] md:text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center gap-2",
                      isFollowing 
                        ? "border border-border-light dark:border-border-dark hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" 
                        : "bg-text-primary-light dark:bg-text-primary-dark text-background-light dark:text-background-dark hover:opacity-90"
                    )}
                  >
                    {isFollowing ? (
                      <>Following</>
                    ) : (
                      <>Follow</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">{profileData.name}</h1>
            <p className="text-[14px] md:text-[15px] text-text-secondary-light dark:text-text-secondary-dark mb-4">@{profileData.username}</p>
            
            {profileData.bio && (
              <p className="text-[14px] md:text-[15px] mb-4 text-text-primary-light dark:text-text-primary-dark">
                {profileData.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-[13px] text-text-secondary-light dark:text-text-secondary-dark mb-4">
              {profileData.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  <span>{profileData.location}</span>
                </div>
              )}
              {profileData.website && (
                <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <LinkIcon size={16} />
                  <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {profileData.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>Joined {new Date(profileData.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-[14px] md:text-[15px]">
              <div className="flex gap-1.5 hover:underline cursor-pointer">
                <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{profileData.following?.length || 0}</span>
                <span className="text-text-secondary-light dark:text-text-secondary-dark">Following</span>
              </div>
              <div className="flex gap-1.5 hover:underline cursor-pointer">
                <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{profileData.followers?.length || 0}</span>
                <span className="text-text-secondary-light dark:text-text-secondary-dark">Followers</span>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark mb-6">
            {PROFILE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 pb-3 md:pb-4 text-[14px] md:text-[15px] font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-md",
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

          <div className="w-full pb-20">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onLike={async (postId) => {
                    const res = await fetch(`/api/posts/like/${postId}`, { method: 'POST', credentials: 'include' });
                    if (res.ok) {
                      const data = await res.json();
                      setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
                    }
                  }} 
                  onBookmark={async (postId) => {
                    const res = await fetch(`/api/users/bookmark/${postId}`, { method: 'POST', credentials: 'include' });
                    if (res.ok) {
                      const data = await res.json();
                      setUser({ ...authUser, bookmarks: data.bookmarks });
                    }
                  }} 
                  onComment={async (postId, text) => {
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
                  }} 
                  onDelete={async (postId) => {
                    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE', credentials: 'include' });
                    if (res.ok) {
                      setPosts(posts.filter(p => p._id !== postId));
                    }
                  }} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-border-light dark:border-border-dark flex items-center justify-center mb-4">
                  <Settings className="text-text-secondary-light dark:text-text-secondary-dark opacity-50" size={24} />
                </div>
                <h3 className="text-[18px] font-semibold mb-2">No Posts Yet</h3>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-[14px] max-w-[250px]">
                  When there are posts for this tab, they will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isOwnProfile && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          initialData={profileData}
          onSave={handleSaveProfile}
        />
      )}
    </main>
  );
};

export default Profile;
