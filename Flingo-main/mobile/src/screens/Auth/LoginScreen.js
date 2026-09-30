import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Feather, Mail, Lock, ArrowRight, Settings } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { getApiBaseUrl } from '../../api/config';
import { ServerConfigModal } from '../../components/ServerConfigModal';

export const LoginScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setServerError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setServerError('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      setServerError(err.message || 'Login failed. Please verify credentials.');
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

          {/* Branding Banner */}
          <View style={styles.heroBox}>
            <View style={[styles.logoIcon, { backgroundColor: theme.colors.primary }]}>
              <Feather size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandTitle, { color: theme.colors.text }]}>Flingo</Text>
            <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
              Stand out from the flock.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Welcome back</Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              Sign in to connect with your community.
            </Text>

            {!!serverError && (
              <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                <Text style={styles.errorText}>{serverError}</Text>
              </View>
            )}

            {/* Email Field */}
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
                  onChangeText={(val) => { setEmail(val); setServerError(''); }}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }]}>
                <Lock size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                  value={password}
                  onChangeText={(val) => { setPassword(val); setServerError(''); }}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Sign In</Text>
                  <ArrowRight size={18} color="#FFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>Create one</Text>
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
    marginVertical: 20,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  card: {
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 18,
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
    marginBottom: 16,
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
    marginTop: 8,
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
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
