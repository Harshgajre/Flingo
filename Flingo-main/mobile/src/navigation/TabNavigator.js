import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppTheme } from '../context/ThemeContext';
import { Home, Compass, MessageSquare, Bell, User } from 'lucide-react-native';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { ExploreScreen } from '../screens/Explore/ExploreScreen';
import { MessagesListScreen } from '../screens/Messages/MessagesListScreen';
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Home size={24} color={color} fill={focused ? color : 'transparent'} />
          ),
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Compass size={24} color={color} fill={focused ? color : 'transparent'} />
          ),
        }}
      />
      <Tab.Screen 
        name="MessagesTab" 
        component={MessagesListScreen} 
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MessageSquare size={24} color={color} fill={focused ? color : 'transparent'} />
          ),
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Bell size={24} color={color} fill={focused ? color : 'transparent'} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, focused }) => (
            <User size={24} color={color} fill={focused ? color : 'transparent'} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
