import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, 
  Image, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { X, Image as ImageIcon, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';

export const CreatePostModal = ({ visible, onClose, onPostCreated }) => {
  const { theme } = useAppTheme();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'Camera roll access is required to select photos.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets.length > 0) {
      setSelectedMedia(res.assets[0]);
    }
  };

  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'Camera access is required to take photos.');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets.length > 0) {
      setSelectedMedia(res.assets[0]);
    }
  };

  const handlePublish = async () => {
    if (!content.trim() && !selectedMedia) {
      Alert.alert('Empty Post', 'Please write something or attach a photo.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content.trim());

      if (selectedMedia) {
        const filename = selectedMedia.uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('media', {
          uri: selectedMedia.uri,
          name: filename,
          type,
        });
      }

      const newPost = await apiClient('/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      if (newPost) {
        onPostCreated && onPostCreated(newPost);
        setContent('');
        setSelectedMedia(null);
        onClose();
      }
    } catch (err) {
      Alert.alert('Posting Failed', err.message || 'Could not create post');
    } finally {
      setIsLoading(false);
    }
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
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New Post</Text>
            <TouchableOpacity 
              style={[
                styles.publishBtn, 
                { backgroundColor: theme.colors.primary },
                (!content.trim() && !selectedMedia) && { opacity: 0.5 }
              ]} 
              onPress={handlePublish}
              disabled={isLoading || (!content.trim() && !selectedMedia)}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.publishBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Composer Body */}
          <View style={styles.body}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={content}
              onChangeText={setContent}
              autoFocus
            />

            {/* Media Preview */}
            {!!selectedMedia && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedMedia.uri }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeMediaBtn}
                  onPress={() => setSelectedMedia(null)}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Media Attach Bar */}
          <View style={[styles.toolbar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            <View style={styles.toolGroup}>
              <TouchableOpacity style={styles.toolBtn} onPress={handlePickImage}>
                <ImageIcon size={22} color={theme.colors.primary} />
                <Text style={[styles.toolText, { color: theme.colors.text }]}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={handleTakePhoto}>
                <Camera size={22} color={theme.colors.primary} />
                <Text style={[styles.toolText, { color: theme.colors.text }]}>Camera</Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  publishBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  input: {
    fontSize: 17,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  previewContainer: {
    marginTop: 12,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  toolGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  toolText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
