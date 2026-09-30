import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Share } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { Heart, MessageCircle, Bookmark, Share2, MoreVertical, Trash2 } from 'lucide-react-native';
import { resolveMediaUrl } from '../api/config';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';

export const PostCard = ({ post, onLike, onBookmark, onComment, onDelete }) => {
  const { theme } = useAppTheme();
  const { user: authUser } = useAuthStore();
  const navigation = useNavigation();
  const [showOptions, setShowOptions] = useState(false);

  const isLiked = (post.likes || []).includes(authUser?._id);
  const isBookmarked = (authUser?.bookmarks || []).includes(post._id);
  const isAuthor = authUser?._id === post.user?._id;

  const authorAvatar = post.user?.profilePic
    ? { uri: resolveMediaUrl(post.user.profilePic) }
    : null;

  const mediaUri = post.media && post.media.length > 0
    ? resolveMediaUrl(post.media[0])
    : null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.user?.name || 'Flingo user'}: "${post.content || ''}" on Flingo`,
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete && onDelete(post._id)
        },
      ]
    );
  };

  const navigateToProfile = () => {
    if (post.user?.username) {
      navigation.navigate('UserProfile', { username: post.user.username });
    }
  };

  const formattedDate = () => {
    try {
      const date = new Date(post.createdAt || Date.now());
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.authorContainer} onPress={navigateToProfile} activeOpacity={0.8}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
            {authorAvatar ? (
              <Image source={authorAvatar} style={styles.avatarImg} />
            ) : (
              <Text style={[styles.avatarFallback, { color: theme.colors.primary }]}>
                {(post.user?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: theme.colors.text }]} numberOfLines={1}>
              {post.user?.name || 'User'}
            </Text>
            <View style={styles.authorMeta}>
              <Text style={[styles.authorUsername, { color: theme.colors.textSecondary }]}>
                @{post.user?.username || 'user'}
              </Text>
              <Text style={[styles.dot, { color: theme.colors.textSecondary }]}>•</Text>
              <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
                {formattedDate()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {isAuthor && (
          <TouchableOpacity 
            style={styles.moreBtn} 
            onPress={confirmDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {/* Post Text */}
      {!!post.content && (
        <Text style={[styles.content, { color: theme.colors.text }]}>
          {post.content}
        </Text>
      )}

      {/* Post Media */}
      {!!mediaUri && (
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: mediaUri }} 
            style={styles.mediaImage} 
            resizeMode="cover"
          />
        </View>
      )}

      {/* Actions Footer */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.leftActions}>
          {/* Like */}
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => onLike && onLike(post._id)}
            activeOpacity={0.7}
          >
            <Heart 
              size={20} 
              color={isLiked ? theme.colors.primary : theme.colors.textSecondary} 
              fill={isLiked ? theme.colors.primary : 'transparent'} 
            />
            <Text style={[styles.actionCount, { color: isLiked ? theme.colors.primary : theme.colors.textSecondary }]}>
              {(post.likes || []).length}
            </Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => onComment && onComment(post)}
            activeOpacity={0.7}
          >
            <MessageCircle size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.actionCount, { color: theme.colors.textSecondary }]}>
              {(post.comments || []).length}
            </Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Share2 size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Bookmark */}
        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={() => onBookmark && onBookmark(post._id)}
          activeOpacity={0.7}
        >
          <Bookmark 
            size={20} 
            color={isBookmarked ? '#F59E0B' : theme.colors.textSecondary} 
            fill={isBookmarked ? '#F59E0B' : 'transparent'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontSize: 18,
    fontWeight: '700',
  },
  authorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  authorUsername: {
    fontSize: 12,
    fontWeight: '500',
  },
  dot: {
    marginHorizontal: 4,
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
  },
  moreBtn: {
    padding: 6,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  mediaContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
  },
});
