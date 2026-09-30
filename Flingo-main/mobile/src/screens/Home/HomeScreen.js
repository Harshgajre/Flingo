import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  RefreshControl, ActivityIndicator, SafeAreaView 
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Header } from '../../components/Header';
import { StoriesSection } from '../../components/StoriesSection';
import { PostCard } from '../../components/PostCard';
import { CreatePostModal } from '../../components/CreatePostModal';
import { CommentModal } from '../../components/CommentModal';
import { Plus } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export const HomeScreen = () => {
  const { theme } = useAppTheme();
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Explore');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      const endpoint = activeTab === 'Explore' ? '/api/posts/explore' : '/api/posts/feed';
      const data = await apiClient(endpoint);
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (e) {
      console.warn('Error loading feed posts', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setIsLoading(true);
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchPosts();
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
      }
    } catch (e) {
      console.warn('Bookmark error', e);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await apiClient(`/api/posts/${postId}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (e) {
      console.warn('Delete error', e);
    }
  };

  const renderHeader = () => (
    <View>
      <StoriesSection />
      
      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
        {['Explore', 'Following'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabItem, isActive && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Flingo" />

      {isLoading ? (
        <View style={styles.loadingBox}>
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
              onComment={(post) => setActiveCommentPost(post)}
              onDelete={handleDelete}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={onRefresh} 
              colors={[theme.colors.primary]} 
              tintColor={theme.colors.primary} 
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyFeed}>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No posts yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                {activeTab === 'Following' 
                  ? 'Follow creators to see their updates here!' 
                  : 'Be the first to share something with your flock!'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setIsCreateModalOpen(true)}
        activeOpacity={0.85}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal 
        visible={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onPostCreated={(newPost) => setPosts([newPost, ...posts])}
      />

      {/* Comment Modal */}
      {!!activeCommentPost && (
        <CommentModal 
          visible={true}
          post={activeCommentPost}
          onClose={() => setActiveCommentPost(null)}
          onCommentAdded={(postId, updatedComments) => {
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
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
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
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
    paddingBottom: 80,
  },
  emptyFeed: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
