import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Feather, User, AtSign, Mail, Lock, ArrowRight, Settings } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { ServerConfigModal } from '../../components/ServerConfigModal';

export const RegisterScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { register } = useAuthStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await register(name.trim(), username.trim().toLowerCase(), email.trim(), password);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Username or email might be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Top Config Button */}
          <TouchableOpacity style={styles.serverConfigBtn} onPress={() => setIsServerModalOpen(true)}>
            <Settings size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Header Box */}
          <View style={styles.heroBox}>
            <View style={[styles.logoIcon, { backgroundColor: theme.colors.primary }]}>
              <Feather size={28} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandTitle, { color: theme.colors.text }]}>Create Account</Text>
            <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
              Join the Flingo flock today.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>

            {!!errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                <User size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="John Doe"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={name}
                  onChangeText={(val) => { setName(val); setErrorMsg(''); }}
                />
              </View>
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Username</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                <AtSign size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="johndoe"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={(val) => { setUsername(val); setErrorMsg(''); }}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email Address</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                <Mail size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(val) => { setEmail(val); setErrorMsg(''); }}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                <Lock size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                  value={password}
                  onChangeText={(val) => { setPassword(val); setErrorMsg(''); }}
                />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Get Started</Text>
                  <ArrowRight size={18} color="#FFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Sign in link */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>Sign in</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ServerConfigModal
        visible={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
      />
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
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  serverConfigBtn: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  heroBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  errorBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
