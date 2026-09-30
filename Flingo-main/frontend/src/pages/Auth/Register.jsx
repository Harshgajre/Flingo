import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Feather, AtSign } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setServerError('');
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong during registration');
        }

        // Success - user is registered and cookie is set
        setUser(data);
        navigate('/'); // Redirect to Home Feed
      } catch (err) {
        setServerError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">

      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-rose-400 via-pink-500 to-orange-400 relative items-center justify-center overflow-hidden p-12">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

        {/* Decorative Circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-pink-700/20 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg text-white"
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-glass">
            <Feather className="w-8 h-8 text-white drop-shadow-sm" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Join the flock today.
          </h1>
          <p className="text-lg xl:text-xl text-white/90 leading-relaxed mb-8">
            Start connecting with amazing people and share your unique vibrant perspective with the world.
          </p>

          <div className="flex -space-x-4">
            <div className="w-10 h-10 rounded-full border-2 border-pink-500 bg-gray-300 relative z-30" />
            <div className="w-10 h-10 rounded-full border-2 border-pink-500 bg-gray-400 relative z-20" />
            <div className="w-10 h-10 rounded-full border-2 border-pink-500 bg-gray-500 relative z-10" />
            <div className="w-10 h-10 rounded-full border-2 border-pink-500 bg-white/30 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white relative z-0">
              +1k
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">

        {/* Mobile decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 via-pink-500/5 to-orange-400/5 lg:hidden" />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] relative z-10"
        >
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold mb-3">Create an account</h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-[15px]">
              Join Flingo to start sharing and connecting.
            </p>
          </div>

          {/* Social Logins */}
          <div className="flex gap-4 mb-8">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
              </svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border-light dark:bg-border-dark"></div>
            <span className="text-[12px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider font-medium">Or register with email</span>
            <div className="flex-1 h-px bg-border-light dark:bg-border-dark"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-text-secondary-light dark:text-text-secondary-dark">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Aryan Pandya"
                  className={cn(
                    "w-full bg-white dark:bg-[#1A2235] text-text-primary-light dark:text-text-primary-dark rounded-xl py-3 pl-11 pr-4 outline-none border focus:border-primary transition-colors text-[15px] shadow-sm",
                    errors.name ? "border-red-500 focus:border-red-500" : "border-border-light dark:border-border-dark"
                  )}
                />
              </div>
              {errors.name && <p className="text-red-500 text-[12px] mt-1.5 ml-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-text-secondary-light dark:text-text-secondary-dark">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
                  <AtSign size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="aryan_pandya"
                  className={cn(
                    "w-full bg-white dark:bg-[#1A2235] text-text-primary-light dark:text-text-primary-dark rounded-xl py-3 pl-11 pr-4 outline-none border focus:border-primary transition-colors text-[15px] shadow-sm",
                    errors.username ? "border-red-500 focus:border-red-500" : "border-border-light dark:border-border-dark"
                  )}
                />
              </div>
              {errors.username && <p className="text-red-500 text-[12px] mt-1.5 ml-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-text-secondary-light dark:text-text-secondary-dark">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={cn(
                    "w-full bg-white dark:bg-[#1A2235] text-text-primary-light dark:text-text-primary-dark rounded-xl py-3 pl-11 pr-4 outline-none border focus:border-primary transition-colors text-[15px] shadow-sm",
                    errors.email ? "border-red-500 focus:border-red-500" : "border-border-light dark:border-border-dark"
                  )}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[12px] mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-text-secondary-light dark:text-text-secondary-dark">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={cn(
                    "w-full bg-white dark:bg-[#1A2235] text-text-primary-light dark:text-text-primary-dark rounded-xl py-3 pl-11 pr-4 outline-none border focus:border-primary transition-colors text-[15px] shadow-sm",
                    errors.password ? "border-red-500 focus:border-red-500" : "border-border-light dark:border-border-dark"
                  )}
                />
              </div>
              {errors.password && <p className="text-red-500 text-[12px] mt-1.5 ml-1">{errors.password}</p>}
            </div>

            {serverError && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-[13px] font-medium text-center">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl text-white font-medium text-[15px] bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-90 transition-opacity shadow-md disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[14px] text-text-secondary-light dark:text-text-secondary-dark mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-rose-500 hover:underline">
              Sign in
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default Register;
