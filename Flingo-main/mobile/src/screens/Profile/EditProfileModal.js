import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, 
  Image, ActivityIndicator, Alert, SafeAreaView, ScrollView 
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../api/client';
import { resolveMediaUrl } from '../../api/config';

export const EditProfileModal = ({ visible, user, onClose, onProfileUpdated }) => {
  const { theme } = useAppTheme();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [profilePicAsset, setProfilePicAsset] = useState(null);
  const [coverPicAsset, setCoverPicAsset] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async (type) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Photo access is required.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets.length > 0) {
      if (type === 'profile') setProfilePicAsset(res.assets[0]);
      if (type === 'cover') setCoverPicAsset(res.assets[0]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('location', location);
      formData.append('website', website);

      if (profilePicAsset) {
        const fn = profilePicAsset.uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(fn);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('profilePic', { uri: profilePicAsset.uri, name: fn, type });
      }

      if (coverPicAsset) {
        const fn = coverPicAsset.uri.split('/').pop() || 'cover.jpg';
        const match = /\.(\w+)$/.exec(fn);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('coverPic', { uri: coverPicAsset.uri, name: fn, type });
      }

      const updated = await apiClient('/api/users/update', {
        method: 'PUT',
        body: formData,
      });

      if (updated) {
        onProfileUpdated && onProfileUpdated(updated);
        onClose();
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarUri = profilePicAsset?.uri || (user?.profilePic ? resolveMediaUrl(user.profilePic) : null);
  const currentCoverUri = coverPicAsset?.uri || (user?.coverPic ? resolveMediaUrl(user.coverPic) : null);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.card }]}>
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Edit Profile</Text>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Cover Photo */}
          <TouchableOpacity 
            style={[styles.coverBox, { backgroundColor: theme.colors.surface }]}
            onPress={() => pickImage('cover')}
          >
            {currentCoverUri && <Image source={{ uri: currentCoverUri }} style={styles.coverImg} />}
            <View style={styles.cameraBadge}>
              <Camera size={18} color="#FFF" />
            </View>
          </TouchableOpacity>

          {/* Avatar Photo */}
          <View style={styles.avatarRow}>
            <TouchableOpacity 
              style={[styles.avatarBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.card }]}
              onPress={() => pickImage('profile')}
            >
              {currentAvatarUri ? (
                <Image source={{ uri: currentAvatarUri }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarFallback, { color: theme.colors.primary }]}>
                  {(name || 'U').charAt(0)}
                </Text>
              )}
              <View style={styles.avatarCameraBadge}>
                <Camera size={14} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, { backgroundColor: theme.colors.inputBg, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. San Francisco, CA"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Website</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBg, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://..."
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
        </ScrollView>

      </SafeAreaView>
    </Modal>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverBox: {
    width: '100%',
    height: 140,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRow: {
    paddingHorizontal: 16,
    marginTop: -40,
    marginBottom: 16,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontSize: 32,
    fontWeight: '700',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 15,
  },
  bioInput: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
});
