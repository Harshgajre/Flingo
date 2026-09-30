import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const LightTheme = {
  dark: false,
  colors: {
    primary: '#F43F5E', // Rose 500
    primaryGradient: ['#F43F5E', '#EC4899'],
    background: '#F8FAFC',
    card: '#FFFFFF',
    surface: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    inputBg: '#F1F5F9',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
  }
};

export const DarkTheme = {
  dark: true,
  colors: {
    primary: '#F43F5E',
    primaryGradient: ['#F43F5E', '#EC4899'],
    background: '#0F172A',
    card: '#1A2235',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    inputBg: '#1E293B',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    tabBar: '#1A2235',
    tabBarBorder: '#334155',
  }
};

const ThemeContext = createContext({
  theme: LightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@flingo_theme');
        if (saved !== null) {
          setIsDark(saved === 'dark');
        } else {
          setIsDark(systemScheme === 'dark');
        }
      } catch (e) {
        console.warn('Error reading theme from storage', e);
      }
    })();
  }, [systemScheme]);

  const toggleTheme = async () => {
    const nextVal = !isDark;
    setIsDark(nextVal);
    await AsyncStorage.setItem('@flingo_theme', nextVal ? 'dark' : 'light');
  };

  const theme = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
