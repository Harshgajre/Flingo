import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Image, ActivityIndicator, SafeAreaView, Linking 
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Settings, MapPin, Link as LinkIcon, Calendar, MessageCircle } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { resolveMediaUrl } from '../../api/config';
import { useAuthStore } from '../../store/authStore';
import { PostCard } from '../../components/PostCard';
import { EditProfileModal } from './EditProfileModal';

export const ProfileScreen = ({ route, navigation }) => {
  const { theme } = useAppTheme();
  const { user: authUser, setUser: setAuthUser } = useAuthStore();
  
  const targetUsername = route.params?.username || authUser?.username;
  const isOwnProfile = !route.params?.username || route.params?.username === authUser?.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!targetUsername) return;
    try {
      const data = await apiClient(`/api/users/${targetUsername}`);
      setProfile(data);
    } catch (e) {
      console.warn('Error loading profile', e);
    } finally {
      setIsLoading(false);
    }
  }, [targetUsername]);

  const fetchTabPosts = useCallback(async () => {
    if (!profile?.username) return;
    try {
      const endpoint = activeTab === 'Likes' 
        ? `/api/posts/liked/${profile.username}` 
        : `/api/posts/user/${profile.username}`;
      const data = await apiClient(endpoint);
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (e) {
      console.warn('Error loading tab posts', e);
    }
  }, [activeTab, profile]);

  useEffect(() => {
    setIsLoading(true);
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      fetchTabPosts();
    }
  }, [fetchTabPosts, profile]);

  const handleFollow = async () => {
    if (!profile?._id) return;
    try {
      await apiClient(`/api/users/follow/${profile._id}`, { method: 'POST' });
      // Toggle follow state locally
      const isCurrentlyFollowing = (profile.followers || []).some(f => f._id === authUser?._id);
      setProfile(prev => ({
        ...prev,
        followers: isCurrentlyFollowing
          ? prev.followers.filter(f => f._id !== authUser?._id)
          : [...(prev.followers || []), { _id: authUser?._id, name: authUser?.name, username: authUser?.username }],
      }));
    } catch (e) {
      console.warn('Follow error', e);
    }
  };

  const isFollowing = (profile?.followers || []).some(f => f._id === authUser?._id);

  const renderHeader = () => {
    if (!profile) return null;

    const coverUri = profile.coverPic ? resolveMediaUrl(profile.coverPic) : null;
    const avatarUri = profile.profilePic ? resolveMediaUrl(profile.profilePic) : null;

    return (
      <View style={styles.profileHeader}>
        {/* Cover Photo */}
        <View style={[styles.coverBox, { backgroundColor: theme.colors.surface }]}>
          {coverUri && <Image source={{ uri: coverUri }} style={styles.coverImg} />}
        </View>

        {/* Profile Info Bar */}
        <View style={styles.infoSection}>
          <View style={styles.avatarActionRow}>
            {/* Avatar */}
            <View style={[styles.avatarBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.background }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarFallback, { color: theme.colors.primary }]}>
                  {(profile.name || 'U').charAt(0)}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {isOwnProfile ? (
                <>
                  <TouchableOpacity 
                    style={[styles.outlineBtn, { borderColor: theme.colors.border }]}
                    onPress={() => navigation.navigate('Settings')}
                  >
                    <Settings size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.pillBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                    onPress={() => setIsEditModalOpen(true)}
                  >
                    <Text style={[styles.pillBtnText, { color: theme.colors.text }]}>Edit Profile</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.outlineBtn, { borderColor: theme.colors.border }]}
                    onPress={() => navigation.navigate('Chat', { targetUser: profile })}
                  >
                    <MessageCircle size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.followBtn, 
                      { backgroundColor: isFollowing ? theme.colors.card : theme.colors.primary, borderColor: theme.colors.border }
                    ]}
                    onPress={handleFollow}
                  >
                    <Text style={[styles.followBtnText, { color: isFollowing ? theme.colors.text : '#FFF' }]}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* User Details */}
          <Text style={[styles.name, { color: theme.colors.text }]}>{profile.name}</Text>
          <Text style={[styles.username, { color: theme.colors.textSecondary }]}>@{profile.username}</Text>

          {!!profile.bio && (
            <Text style={[styles.bio, { color: theme.colors.text }]}>{profile.bio}</Text>
          )}

          {/* Meta Info */}
          <View style={styles.metaRow}>
            {!!profile.location && (
              <View style={styles.metaItem}>
                <MapPin size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{profile.location}</Text>
              </View>
            )}
            {!!profile.website && (
              <TouchableOpacity 
                style={styles.metaItem} 
                onPress={() => Linking.openURL(profile.website.startsWith('http') ? profile.website : `https://${profile.website}`)}
              >
                <LinkIcon size={14} color={theme.colors.primary} />
                <Text style={[styles.metaText, { color: theme.colors.primary }]}>{profile.website}</Text>
              </TouchableOpacity>
            )}
            <View style={styles.metaItem}>
              <Calendar size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Follow Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {(profile.following || []).length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {(profile.followers || []).length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Followers</Text>
            </View>
          </View>
        </View>

        {/* Profile Tabs */}
        <View style={[styles.tabBar, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
          {['Posts', 'Likes'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tabItem, isActive && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText, 
                  { color: isActive ? theme.colors.primary : theme.colors.textSecondary },
                  isActive && { fontWeight: '700' }
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No {activeTab.toLowerCase()} to display.
              </Text>
            </View>
          }
        />
      )}

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          visible={isEditModalOpen}
          user={profile}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={(updated) => {
            setProfile(updated);
            setAuthUser(updated);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    marginBottom: 8,
  },
  coverBox: {
    width: '100%',
    height: 130,
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatarActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -44,
    marginBottom: 10,
  },
  avatarBox: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontSize: 34,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  outlineBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  followBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  followBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  username: {
    fontSize: 14,
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    gap: 4,
  },
  statNumber: {
    fontWeight: '700',
    fontSize: 14,
  },
  statLabel: {
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
});
