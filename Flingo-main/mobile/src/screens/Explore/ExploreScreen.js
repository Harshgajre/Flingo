import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, 
  Image, ActivityIndicator, SafeAreaView, Dimensions, ScrollView 
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Search, TrendingUp, X } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { resolveMediaUrl } from '../../api/config';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 36) / 2;

const CATEGORIES = [
  'All', 'Design', 'Photography', 'Technology', 'Travel', 'Art', 'Nature', 'Fashion'
];

export const ExploreScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mediaPosts, setMediaPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch explore media posts
  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient('/api/posts/explore');
        if (Array.isArray(data)) {
          const withMedia = data.filter(p => p.media && p.media.length > 0);
          setMediaPosts(withMedia);
        }
      } catch (e) {
        console.warn('Explore fetch error', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await apiClient(`/api/users/search?query=${encodeURIComponent(searchQuery)}`);
        if (Array.isArray(data)) {
          setSearchResults(data);
        }
      } catch (e) {
        console.warn('Search users error', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const renderSearchResult = ({ item }) => {
    const avatar = item.profilePic ? resolveMediaUrl(item.profilePic) : null;
    return (
      <TouchableOpacity 
        style={[styles.userResult, { borderBottomColor: theme.colors.border }]}
        onPress={() => navigation.navigate('UserProfile', { username: item.username })}
        activeOpacity={0.7}
      >
        <View style={[styles.userAvatar, { backgroundColor: theme.colors.surface }]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.userAvatarImg} />
          ) : (
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {(item.name || 'U').charAt(0)}
            </Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.userUsername, { color: theme.colors.textSecondary }]}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGridItem = ({ item, index }) => {
    const imgUri = resolveMediaUrl(item.media[0]);
    // Stagger heights for a masonry feel
    const itemHeight = index % 3 === 0 ? 240 : 180;

    return (
      <View style={[styles.gridCard, { width: COLUMN_WIDTH, height: itemHeight, backgroundColor: theme.colors.card }]}>
        <Image source={{ uri: imgUri }} style={styles.gridImage} resizeMode="cover" />
        <View style={styles.gridOverlay}>
          {!!item.content && (
            <Text style={styles.gridCaption} numberOfLines={1}>
              {item.content}
            </Text>
          )}
          <Text style={styles.gridAuthor}>@{item.user?.username || 'user'}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
          <Search size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search people on Flingo..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* When Searching: Show User Results */}
      {!!searchQuery ? (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              renderItem={renderSearchResult}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No users found matching "{searchQuery}"
                  </Text>
                </View>
              }
            />
          )}
        </View>
      ) : (
        /* Otherwise: Show Categories & Explore Media Grid */
        <FlatList
          data={mediaPosts}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={renderGridItem}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              {/* Trending Heading */}
              <View style={styles.trendingHeader}>
                <TrendingUp size={18} color={theme.colors.primary} />
                <Text style={[styles.trendingTitle, { color: theme.colors.text }]}>Trending Topics</Text>
              </View>

              {/* Category Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryPill,
                        { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
                        isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                      ]}
                      onPress={() => setActiveCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryText,
                        { color: isSelected ? '#FFF' : theme.colors.textSecondary },
                        isSelected && { fontWeight: '700' }
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No explore posts yet.
                </Text>
              </View>
            )
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
  searchHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  headerSection: {
    paddingVertical: 14,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  gridContent: {
    paddingBottom: 40,
  },
  gridCard: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gridCaption: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gridAuthor: {
    color: '#E2E8F0',
    fontSize: 10,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userUsername: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
});
