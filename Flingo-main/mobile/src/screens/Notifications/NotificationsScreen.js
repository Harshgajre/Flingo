import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Image, ActivityIndicator, SafeAreaView, RefreshControl 
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { resolveMediaUrl } from '../../api/config';

export const NotificationsScreen = () => {
  const { theme } = useAppTheme();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await apiClient('/api/notifications');
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (e) {
      console.warn('Error fetching notifications', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    try {
      await apiClient('/api/notifications/read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.warn('Mark read error', e);
    }
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={12} color="#FFF" fill="#FFF" />;
      case 'comment':
        return <MessageCircle size={12} color="#FFF" />;
      case 'follow':
        return <UserPlus size={12} color="#FFF" />;
      default:
        return <Bell size={12} color="#FFF" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'like': return '#F43F5E';
      case 'comment': return '#3B82F6';
      case 'follow': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderItem = ({ item }) => {
    const sender = item.sender;
    const avatar = sender?.profilePic ? resolveMediaUrl(sender.profilePic) : null;
    const isUnread = !item.read;

    return (
      <View style={[
        styles.notifRow, 
        { borderBottomColor: theme.colors.border },
        isUnread && { backgroundColor: theme.isDark ? 'rgba(244,63,94,0.08)' : '#FFF1F2' }
      ]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {(sender?.name || 'U').charAt(0)}
              </Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: getBadgeColor(item.type) }]}>
            {getBadgeIcon(item.type)}
          </View>
        </View>

        <View style={styles.notifContent}>
          <Text style={[styles.messageText, { color: theme.colors.text }]}>
            <Text style={styles.senderName}>{sender?.name || 'Someone'} </Text>
            {item.type === 'like' && 'liked your post.'}
            {item.type === 'comment' && 'commented on your post.'}
            {item.type === 'follow' && 'started following you.'}
          </Text>
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={[styles.markReadText, { color: theme.colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={onRefresh} 
              colors={[theme.colors.primary]} 
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={[styles.emptyIconBox, { backgroundColor: theme.colors.surface }]}>
                <Bell size={32} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>All caught up!</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                When you get likes, comments, or followers, they will show up here.
              </Text>
            </View>
          }
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  markReadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  notifContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  senderName: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
