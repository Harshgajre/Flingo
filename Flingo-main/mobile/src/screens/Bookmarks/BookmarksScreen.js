import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, RefreshControl 
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { PostCard } from '../../components/PostCard';
import { useAuthStore } from '../../store/authStore';

export const BookmarksScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { user, setUser } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBookmarks = async () => {
    try {
      const data = await apiClient('/api/posts/bookmarks');
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (e) {
      console.warn('Error fetching bookmarks', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchBookmarks();
  };

  const handleLike = async (postId) => {
    try {
      const data = await apiClient(`/api/posts/like/${postId}`, { method: 'POST' });
      if (data && data.likes) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (e) {
      console.warn('Like error', e);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const data = await apiClient(`/api/users/bookmark/${postId}`, { method: 'POST' });
      if (data && data.bookmarks) {
        setUser({ ...user, bookmarks: data.bookmarks });
        // Update local list
        setPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (e) {
      console.warn('Bookmark toggle error', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Saved Posts</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard 
              post={item}
              onLike={handleLike}
              onBookmark={handleBookmark}
            />
          )}
          contentContainerStyle={styles.listContent}
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
                <Bookmark size={32} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No saved posts</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Tap the bookmark icon on any post to save it for later.
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
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 40,
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
