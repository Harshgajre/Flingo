import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Switch, 
  Alert, SafeAreaView, ScrollView 
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { 
  ArrowLeft, Moon, Globe, LogOut, Shield, Bell, HelpCircle, ChevronRight 
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { getApiBaseUrl } from '../../api/config';
import { ServerConfigModal } from '../../components/ServerConfigModal';

export const SettingsScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useAppTheme();
  const { user, logout } = useAuthStore();
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const url = await getApiBaseUrl();
      setCurrentApiUrl(url);
    })();
  }, []);

  const handleEditApiUrl = () => {
    setIsServerModalOpen(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to sign out of Flingo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userHandle, { color: theme.colors.textSecondary }]}>@{user?.username}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Section: Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PREFERENCES</Text>
          
          <View style={[styles.row, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.rowLeft}>
              <Moon size={20} color={theme.colors.primary} />
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section: Network & Server */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>DEVELOPMENT & NETWORK</Text>
          
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={handleEditApiUrl}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Globe size={20} color={theme.colors.primary} />
              <View>
                <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Backend Server URL</Text>
                <Text style={[styles.rowSubLabel, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {currentApiUrl}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Section: General */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>GENERAL</Text>
          
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Shield size={20} color={theme.colors.primary} />
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Privacy & Security</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 8 }]}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Bell size={20} color={theme.colors.primary} />
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Push Notifications</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 8 }]}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <HelpCircle size={20} color={theme.colors.primary} />
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Help & Support</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone: Log Out */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutBtn, { borderColor: theme.colors.danger }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color={theme.colors.danger} />
            <Text style={[styles.logoutText, { color: theme.colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <ServerConfigModal
        visible={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        onSaved={(newUrl) => setCurrentApiUrl(newUrl)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userHandle: {
    fontSize: 14,
    marginTop: 2,
  },
  userEmail: {
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
