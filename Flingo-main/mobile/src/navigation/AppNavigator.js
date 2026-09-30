import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';

import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { TabNavigator } from './TabNavigator';
import { ChatScreen } from '../screens/Messages/ChatScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { BookmarksScreen } from '../screens/Bookmarks/BookmarksScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { theme } = useAppTheme();
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user && user._id) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [user, connectSocket, disconnectSocket]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="UserProfile" component={ProfileScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
