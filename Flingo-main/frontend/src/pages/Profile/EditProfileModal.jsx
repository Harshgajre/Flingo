import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, MapPin, Link as LinkIcon, User } from 'lucide-react';
import { cn } from '../../utils/cn';

const EditProfileModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: ''
  });

  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [coverPicPreview, setCoverPicPreview] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [coverPicFile, setCoverPicFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const profilePicRef = useRef(null);
  const coverPicRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        username: initialData.username || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        website: initialData.website || ''
      });
      setProfilePicPreview(initialData.profilePic || null);
      setCoverPicPreview(initialData.coverPic || null);
      setProfilePicFile(null);
      setCoverPicFile(null);
      setIsLoading(false);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverPicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPicFile(file);
      setCoverPicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    data.append('location', formData.location);
    data.append('website', formData.website);
    if (profilePicFile) data.append('profilePic', profilePicFile);
    if (coverPicFile) data.append('coverPic', coverPicFile);
    
    if (onSave) await onSave(data);
    setIsLoading(false);
    onClose();
  };

  const handleModalClick = (e) => e.stopPropagation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={handleModalClick}
            className="relative w-full max-w-xl bg-white dark:bg-[#1A2235] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[92vh] sm:h-auto sm:max-h-[85vh]"
          >
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden absolute top-0 z-30 pointer-events-none">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-4 sm:px-6 py-3 pt-6 sm:pt-3 border-b border-border-light dark:border-border-dark sticky top-0 bg-white/90 dark:bg-[#1A2235]/90 backdrop-blur-md z-20">
              <div className="flex items-center gap-4 sm:gap-6">
                <button
                  onClick={onClose}
                  className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X size={20} className="text-text-primary-light dark:text-text-primary-dark" />
                </button>
                <h2 className="text-[18px] sm:text-xl font-bold">Edit profile</h2>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-5 py-1.5 bg-text-primary-light dark:bg-text-primary-dark text-background-light dark:text-background-dark font-semibold rounded-full hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-[14px] sm:text-[15px] disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="overflow-y-auto hide-scrollbar flex-1 pb-10">
              <input type="file" ref={coverPicRef} hidden accept="image/*" onChange={handleCoverPicChange} />
              <div 
                onClick={() => coverPicRef.current?.click()}
                className="h-32 md:h-48 bg-gray-200 dark:bg-gray-800 relative flex items-center justify-center group cursor-pointer border-b border-border-light dark:border-border-dark overflow-hidden"
              >
                {coverPicPreview && <img src={coverPicPreview} alt="cover" className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-colors">
                       <Camera size={22} />
                    </div>
                </div>
              </div>

              <div className="relative px-4 md:px-6 -mt-10 md:-mt-14 mb-6">
                <input type="file" ref={profilePicRef} hidden accept="image/*" onChange={handleProfilePicChange} />
                <div 
                  onClick={() => profilePicRef.current?.click()}
                  className="relative inline-block group cursor-pointer z-10"
                >
                   <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white dark:border-[#1A2235] bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center relative">
                      {profilePicPreview ? (
                        <img src={profilePicPreview} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 md:w-12 md:h-12 text-text-secondary-light dark:text-text-secondary-dark opacity-50" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Camera className="text-white/90" size={24} />
                      </div>
                   </div>
                </div>
              </div>

              <div className="px-4 md:px-6 space-y-6 max-w-full">
                <div className="relative group">
                  <div className="absolute -top-2 left-3 bg-white dark:bg-[#1A2235] px-1 text-[12px] text-text-secondary-light dark:text-text-secondary-dark z-10 font-medium group-focus-within:text-primary transition-colors">
                    Name
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-border-light dark:border-border-dark rounded-xl px-4 py-3.5 pt-4 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-[15px] group-hover:border-gray-400 dark:group-hover:border-gray-500"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute -top-2 left-3 bg-white dark:bg-[#1A2235] px-1 text-[12px] text-text-secondary-light dark:text-text-secondary-dark z-10 font-medium group-focus-within:text-primary transition-colors">
                    Bio
                  </div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-transparent border border-border-light dark:border-border-dark rounded-xl px-4 py-3 pt-4 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-[15px] resize-none group-hover:border-gray-400 dark:group-hover:border-gray-500"
                    placeholder="Add a bio to your profile..."
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary text-text-secondary-light dark:text-text-secondary-dark transition-colors">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="w-full bg-transparent border border-border-light dark:border-border-dark rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-[15px] group-hover:border-gray-400 dark:group-hover:border-gray-500"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary text-text-secondary-light dark:text-text-secondary-dark transition-colors">
                    <LinkIcon size={18} />
                  </div>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Website"
                    className="w-full bg-transparent border border-border-light dark:border-border-dark rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-[15px] group-hover:border-gray-400 dark:group-hover:border-gray-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
