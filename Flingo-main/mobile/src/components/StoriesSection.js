import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Modal, ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { Plus, X, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../api/client';
import { resolveMediaUrl } from '../api/config';
import { useAuthStore } from '../store/authStore';

export const StoriesSection = () => {
  const { theme } = useAppTheme();
  const { user } = useAuthStore();
  const [stories, setStories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStory, setActiveStory] = useState(null);

  const fetchStories = async () => {
    try {
      const data = await apiClient('/api/stories/feed');
      if (Array.isArray(data)) {
        setStories(data);
      }
    } catch (e) {
      console.warn('Error fetching stories', e);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handlePickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please grant photo library access to upload a story.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      const filename = asset.uri.split('/').pop() || 'story.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('media', {
        uri: asset.uri,
        name: filename,
        type,
      });

      const newStory = await apiClient('/api/stories/create', {
        method: 'POST',
        body: formData,
      });

      if (newStory && newStory._id) {
        setStories([newStory, ...stories]);
      }
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Could not upload story.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await apiClient(`/api/stories/${storyId}`, { method: 'DELETE' });
      setStories(stories.filter(s => s._id !== storyId));
      setActiveStory(null);
    } catch (err) {
      Alert.alert('Delete Failed', err.message || 'Could not delete story.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Add Story Button */}
        <TouchableOpacity 
          style={styles.storyItem} 
          onPress={handlePickAndUpload}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          <View style={[styles.addCircle, { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface }]}>
            {isUploading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Plus size={24} color={theme.colors.primary} />
            )}
          </View>
          <Text style={[styles.storyName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>

        {/* Stories List */}
        {stories.map((story) => {
          const authorAvatar = story.user?.profilePic ? resolveMediaUrl(story.user.profilePic) : null;
          return (
            <TouchableOpacity 
              key={story._id} 
              style={styles.storyItem}
              onPress={() => setActiveStory(story)}
              activeOpacity={0.8}
            >
              <View style={[styles.storyRing, { borderColor: theme.colors.primary }]}>
                <View style={[styles.storyInner, { backgroundColor: theme.colors.surface }]}>
                  {authorAvatar ? (
                    <Image source={{ uri: authorAvatar }} style={styles.storyImage} />
                  ) : (
                    <Text style={[styles.storyFallback, { color: theme.colors.primary }]}>
                      {(story.user?.name || 'U').charAt(0)}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={[styles.storyName, { color: theme.colors.text }]} numberOfLines={1}>
                {story.user?.name?.split(' ')[0] || 'User'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Story Viewer Modal */}
      {!!activeStory && (
        <Modal visible={true} animationType="fade" transparent={false} onRequestClose={() => setActiveStory(null)}>
          <SafeAreaView style={styles.modalBackdrop}>
            {/* Top Bar */}
            <View style={styles.modalHeader}>
              <View style={styles.modalAuthor}>
                <View style={styles.modalAvatarBox}>
                  {activeStory.user?.profilePic ? (
                    <Image source={{ uri: resolveMediaUrl(activeStory.user.profilePic) }} style={styles.modalAvatar} />
                  ) : (
                    <Text style={styles.modalAvatarText}>{(activeStory.user?.name || 'U').charAt(0)}</Text>
                  )}
                </View>
                <Text style={styles.modalAuthorName}>{activeStory.user?.name}</Text>
              </View>

              <View style={styles.modalActions}>
                {user?._id === activeStory.user?._id && (
                  <TouchableOpacity 
                    style={styles.modalIconBtn}
                    onPress={() => handleDeleteStory(activeStory._id)}
                  >
                    <Trash2 size={22} color="#EF4444" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.modalIconBtn}
                  onPress={() => setActiveStory(null)}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Media Content */}
            <View style={styles.modalMediaWrapper}>
              <Image 
                source={{ uri: resolveMediaUrl(activeStory.media) }} 
                style={styles.modalImage} 
                resizeMode="contain" 
              />
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  addCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyFallback: {
    fontSize: 20,
    fontWeight: '700',
  },
  storyName: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  modalAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatar: {
    width: '100%',
    height: '100%',
  },
  modalAvatarText: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalAuthorName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconBtn: {
    padding: 6,
  },
  modalMediaWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
