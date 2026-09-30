import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Bell, Palette, HelpCircle, ChevronRight, Moon, Sun, ArrowLeft, LogOut, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const SETTINGS_TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'privacy', label: 'Privacy & Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'display', label: 'Display', icon: Palette },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

const Settings = () => {
  const { user, setUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fake states for UI toggles
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
      });
    }
  }, [user]);

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
    setSaveMessage('');
  };

  const handleSaveAccount = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    data.append('location', formData.location);
    data.append('website', formData.website);

    try {
      const res = await fetch('/api/users/update', {
        method: 'PUT',
        credentials: 'include',
        body: data
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setSaveMessage('Settings saved successfully!');
      } else {
        setSaveMessage('Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      setSaveMessage('An error occurred.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Profile Information</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">Update your account details and public information.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-[15px]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Bio</label>
                  <textarea 
                    rows={3} 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Write something about yourself..." 
                    className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 transition-all resize-none text-[15px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Where are you based?" 
                    className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-[15px]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Website</label>
                  <input 
                    type="text" 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://..." 
                    className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-[15px]" 
                  />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <button 
                    onClick={handleSaveAccount}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saveMessage && (
                    <span className="text-sm font-medium text-green-500">{saveMessage}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border-light dark:border-border-dark">
              <h3 className="text-lg font-semibold text-red-500 mb-1">Danger Zone</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">Log out or permanently delete your account.</p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={logout}
                  className="px-6 py-2.5 flex items-center gap-2 border-2 border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 font-medium rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
                <button 
                  onClick={() => alert('Account deletion would happen here.')}
                  className="px-6 py-2.5 flex items-center gap-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'display':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Appearance</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">Customize how Flingo looks on your device.</p>
              
              <div className="flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={toggleTheme}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <h4 className="font-medium">Dark Mode</h4>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Easier on the eyes in low light.</p>
                  </div>
                </div>
                
                {/* Custom Toggle Switch */}
                <div 
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative pointer-events-none",
                    theme === 'dark' ? "bg-rose-500" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <motion.div 
                    layout
                    initial={false}
                    animate={{ x: theme === 'dark' ? 24 : 2 }}
                    className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Privacy & Security</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">Manage who can see your activity and interact with you.</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setPrivateAccount(!privateAccount)}>
                  <div>
                    <h4 className="font-medium">Private Account</h4>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Only approved followers can see your posts.</p>
                  </div>
                  <div className={cn("w-12 h-6 rounded-full transition-colors relative pointer-events-none", privateAccount ? "bg-rose-500" : "bg-gray-300 dark:bg-gray-600")}>
                    <motion.div layout initial={false} animate={{ x: privateAccount ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setShowActivity(!showActivity)}>
                  <div>
                    <h4 className="font-medium">Activity Status</h4>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Let others see when you are active on Flingo.</p>
                  </div>
                  <div className={cn("w-12 h-6 rounded-full transition-colors relative pointer-events-none", showActivity ? "bg-rose-500" : "bg-gray-300 dark:bg-gray-600")}>
                    <motion.div layout initial={false} animate={{ x: showActivity ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Notifications</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">Choose what updates you want to receive.</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setPushNotifs(!pushNotifs)}>
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Receive alerts for likes, comments, and messages.</p>
                  </div>
                  <div className={cn("w-12 h-6 rounded-full transition-colors relative pointer-events-none", pushNotifs ? "bg-rose-500" : "bg-gray-300 dark:bg-gray-600")}>
                    <motion.div layout initial={false} animate={{ x: pushNotifs ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setEmailNotifs(!emailNotifs)}>
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Get a weekly digest of your network's activity.</p>
                  </div>
                  <div className={cn("w-12 h-6 rounded-full transition-colors relative pointer-events-none", emailNotifs ? "bg-rose-500" : "bg-gray-300 dark:bg-gray-600")}>
                    <motion.div layout initial={false} animate={{ x: emailNotifs ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Help & Support</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">Need assistance? We're here to help.</p>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <span className="font-medium">FAQ & Knowledge Base</span>
                  <ChevronRight size={18} className="text-text-secondary-light dark:text-text-secondary-dark" />
                </button>
                <button className="w-full flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <span className="font-medium">Contact Support Team</span>
                  <ChevronRight size={18} className="text-text-secondary-light dark:text-text-secondary-dark" />
                </button>
                <button className="w-full flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <span className="font-medium">Terms of Service</span>
                  <ChevronRight size={18} className="text-text-secondary-light dark:text-text-secondary-dark" />
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex overflow-hidden">
      {/* Left Pane - Sidebar Menu */}
      <div className={cn(
        "w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 flex flex-col border-r border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-sm",
        !isMobileMenuOpen ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 sm:p-6 border-b border-border-light dark:border-border-dark">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 hide-scrollbar">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3.5 rounded-2xl transition-colors",
                  isActive 
                    ? "bg-rose-500/10 text-rose-500 font-medium" 
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-text-primary-light dark:text-text-primary-dark"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? "text-rose-500" : "text-text-secondary-light dark:text-text-secondary-dark"} />
                  <span className="text-[15px]">{tab.label}</span>
                </div>
                <ChevronRight size={18} className={isActive ? "opacity-100" : "opacity-0"} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Pane - Settings Content */}
      <div className={cn(
        "flex-1 flex flex-col bg-background-light dark:bg-background-dark relative",
        isMobileMenuOpen ? "hidden lg:flex" : "flex"
      )}>
        <div className="h-16 sm:h-20 border-b border-border-light dark:border-border-dark flex items-center px-4 sm:px-6 shrink-0 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
          <button 
            className="lg:hidden p-2 -ml-2 mr-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">
            {SETTINGS_TABS.find(t => t.id === activeTab)?.label}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 lg:pb-8 hide-scrollbar">
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
