import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, FlatList, TextInput, 
  TouchableOpacity, Image, SafeAreaView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { X, Send } from 'lucide-react-native';
import { apiClient } from '../api/client';
import { resolveMediaUrl } from '../api/config';

export const CommentModal = ({ visible, post, onClose, onCommentAdded }) => {
  const { theme } = useAppTheme();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState(post?.comments || []);

  React.useEffect(() => {
    if (post?.comments) {
      setComments(post.comments);
    }
  }, [post]);

  const handleSend = async () => {
    if (!commentText.trim() || !post?._id) return;

    setIsSubmitting(true);
    try {
      const updatedComments = await apiClient(`/api/posts/comment/${post._id}`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText.trim() }),
      });

      if (Array.isArray(updatedComments)) {
        setComments(updatedComments);
        onCommentAdded && onCommentAdded(post._id, updatedComments);
        setCommentText('');
      }
    } catch (e) {
      console.warn('Comment failed', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = ({ item }) => {
    const avatar = item.user?.profilePic ? resolveMediaUrl(item.user.profilePic) : null;
    return (
      <View style={[styles.commentRow, { borderBottomColor: theme.colors.border }]}>
        <View style={[styles.commentAvatar, { backgroundColor: theme.colors.surface }]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.commentAvatarImg} />
          ) : (
            <Text style={[styles.fallbackInitial, { color: theme.colors.primary }]}>
              {(item.user?.name || 'U').charAt(0)}
            </Text>
          )}
        </View>
        <View style={styles.commentBody}>
          <Text style={[styles.commentAuthor, { color: theme.colors.text }]}>
            {item.user?.name || 'User'}
          </Text>
          <Text style={[styles.commentText, { color: theme.colors.text }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Comment List */}
          <FlatList
            data={comments}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderComment}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No comments yet. Start the conversation!
                </Text>
              </View>
            }
          />

          {/* Input Bar */}
          <View style={[styles.inputBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.text }]}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, { backgroundColor: theme.colors.primary }, !commentText.trim() && { opacity: 0.5 }]}
              onPress={handleSend}
              disabled={isSubmitting || !commentText.trim()}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  commentRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarImg: {
    width: '100%',
    height: '100%',
  },
  fallbackInitial: {
    fontWeight: '700',
    fontSize: 14,
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
