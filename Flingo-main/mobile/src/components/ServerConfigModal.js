import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { DEFAULT_API_URL, getApiBaseUrl, setApiBaseUrl } from '../api/config';
import { Server, CheckCircle2, AlertCircle, X, RotateCcw } from 'lucide-react-native';

export const ServerConfigModal = ({ visible, onClose, onSaved }) => {
  const { theme } = useAppTheme();
  const [url, setUrl] = useState('');
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (visible) {
      getApiBaseUrl().then((savedUrl) => {
        setUrl(savedUrl);
        setTestStatus(null);
        setStatusMsg('');
      });
    }
  }, [visible]);

  const handleTest = async () => {
    const trimmed = (url || '').trim().replace(/\/$/, '');
    if (!trimmed) {
      setTestStatus('error');
      setStatusMsg('Please enter a server URL');
      return;
    }

    setTestStatus('testing');
    setStatusMsg('Pinging server...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${trimmed}/`, { 
        method: 'GET',
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setTestStatus('success');
        setStatusMsg('Connected! Backend is reachable.');
      } else {
        setTestStatus('error');
        setStatusMsg(`Server returned HTTP ${res.status}`);
      }
    } catch (err) {
      setTestStatus('error');
      setStatusMsg(err.message || 'Cannot reach server. Check Wi-Fi & port 5000.');
    }
  };

  const handleSave = async () => {
    const trimmed = (url || '').trim().replace(/\/$/, '');
    if (!trimmed) return;
    await setApiBaseUrl(trimmed);
    if (onSaved) onSaved(trimmed);
    onClose();
  };

  const handleReset = async () => {
    setUrl(DEFAULT_API_URL);
    await setApiBaseUrl(DEFAULT_API_URL);
    setTestStatus(null);
    setStatusMsg('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.primary + '20' }]}>
                <Server size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>Backend Server URL</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Set the API address your phone connects to. Make sure phone and PC are on the same Wi-Fi.
          </Text>

          <TextInput
            style={[styles.input, { 
              color: theme.colors.text, 
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.border 
            }]}
            value={url}
            onChangeText={(val) => {
              setUrl(val);
              setTestStatus(null);
              setStatusMsg('');
            }}
            placeholder="http://10.216.168.101:5000"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {testStatus && (
            <View style={[
              styles.statusBanner, 
              testStatus === 'success' ? styles.statusSuccess : 
              testStatus === 'error' ? styles.statusError : styles.statusTesting
            ]}>
              {testStatus === 'testing' && <ActivityIndicator size="small" color="#6366F1" />}
              {testStatus === 'success' && <CheckCircle2 size={16} color="#10B981" />}
              {testStatus === 'error' && <AlertCircle size={16} color="#EF4444" />}
              <Text style={[
                styles.statusText,
                testStatus === 'success' ? { color: '#065F46' } :
                testStatus === 'error' ? { color: '#991B1B' } : { color: '#3730A3' }
              ]}>
                {statusMsg}
              </Text>
            </View>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={[styles.secondaryBtn, { borderColor: theme.colors.border }]} 
              onPress={handleTest}
              disabled={testStatus === 'testing'}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.colors.text }]}>Test Ping</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryBtn, { borderColor: theme.colors.border }]} 
              onPress={handleReset}
            >
              <RotateCcw size={14} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.secondaryBtnText, { color: theme.colors.textSecondary }]}>Default</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]} 
              onPress={handleSave}
            >
              <Text style={styles.primaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  statusSuccess: {
    backgroundColor: '#D1FAE5',
  },
  statusError: {
    backgroundColor: '#FEE2E2',
  },
  statusTesting: {
    backgroundColor: '#E0E7FF',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
