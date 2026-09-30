import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Image, ActivityIndicator, SafeAreaView, RefreshControl 
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { MessageSquare } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { resolveMediaUrl } from '../../api/config';
import { useSocketStore } from '../../store/socketStore';

export const MessagesListScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { onlineUsers } = useSocketStore();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const data = await apiClient('/api/messages/conversations');
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (e) {
      console.warn('Error fetching conversations', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchConversations();
  };

  const renderConversation = ({ item }) => {
    const otherUser = item.user;
    if (!otherUser) return null;

    const isOnline = (onlineUsers || []).includes(otherUser._id);
    const avatar = otherUser.profilePic ? resolveMediaUrl(otherUser.profilePic) : null;

    return (
      <TouchableOpacity 
        style={[styles.convoRow, { borderBottomColor: theme.colors.border }]}
        onPress={() => navigation.navigate('Chat', { targetUser: otherUser })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={[styles.avatarInitial, { color: theme.colors.primary }]}>
                {(otherUser.name || 'U').charAt(0)}
              </Text>
            )}
          </View>
          {isOnline && <View style={styles.onlineBadge} />}
        </View>

        <View style={styles.convoInfo}>
          <View style={styles.topRow}>
            <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
              {otherUser.name}
            </Text>
            <Text style={[styles.statusText, { color: isOnline ? '#10B981' : theme.colors.textSecondary }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <Text style={[styles.username, { color: theme.colors.textSecondary }]}>
            @{otherUser.username}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Messages</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={onRefresh} 
              colors={[theme.colors.primary]} 
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBox, { backgroundColor: theme.colors.surface }]}>
                <MessageSquare size={32} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No conversations yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Visit a user profile or explore to send a message to someone.
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  convoRow: {
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
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  convoInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  username: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
