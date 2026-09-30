import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
  Image, SafeAreaView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { ArrowLeft, Send } from 'lucide-react-native';
import { apiClient } from '../../api/client';
import { resolveMediaUrl } from '../../api/config';
import { useAuthStore } from '../../store/authStore';
import { useSocketStore } from '../../store/socketStore';

export const ChatScreen = ({ route, navigation }) => {
  const { targetUser } = route.params;
  const { theme } = useAppTheme();
  const { user } = useAuthStore();
  const { socket, onlineUsers } = useSocketStore();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  const isOnline = (onlineUsers || []).includes(targetUser._id);
  const targetAvatar = targetUser.profilePic ? resolveMediaUrl(targetUser.profilePic) : null;

  // Load chat history
  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient(`/api/messages/${targetUser._id}`);
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (e) {
        console.warn('Error fetching messages', e);
      }
    })();
  }, [targetUser]);

  // Socket listener for new incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (newMsg.senderId === targetUser._id) {
        setMessages(prev => [...prev, newMsg]);
      }
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, targetUser]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const msgContent = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const sent = await apiClient(`/api/messages/send/${targetUser._id}`, {
        method: 'POST',
        body: JSON.stringify({ message: msgContent }),
      });

      if (sent) {
        setMessages(prev => [...prev, sent]);
      }
    } catch (e) {
      console.warn('Error sending message', e);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isMe = item.senderId === user?._id;
    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
        <View style={[
          styles.bubble,
          isMe 
            ? [styles.myBubble, { backgroundColor: theme.colors.primary }] 
            : [styles.theirBubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]
        ]}>
          <Text style={[styles.bubbleText, { color: isMe ? '#FFFFFF' : theme.colors.text }]}>
            {item.message}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.targetInfo}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
              {targetAvatar ? (
                <Image source={{ uri: targetAvatar }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarFallback, { color: theme.colors.primary }]}>
                  {(targetUser.name || 'U').charAt(0)}
                </Text>
              )}
            </View>
            <View>
              <Text style={[styles.targetName, { color: theme.colors.text }]} numberOfLines={1}>
                {targetUser.name}
              </Text>
              <Text style={[styles.targetStatus, { color: isOnline ? '#10B981' : theme.colors.textSecondary }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* Message Thread */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Bottom Input */}
        <View style={[styles.inputBar, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity 
            style={[
              styles.sendBtn, 
              { backgroundColor: theme.colors.primary },
              (!inputText.trim() || isSending) && { opacity: 0.5 }
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontSize: 16,
    fontWeight: '700',
  },
  targetName: {
    fontSize: 15,
    fontWeight: '700',
  },
  targetStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  messagesList: {
    padding: 16,
  },
  bubbleWrapper: {
    marginVertical: 4,
    maxWidth: '75%',
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  theirBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
