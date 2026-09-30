import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { Zap, Bookmark, Moon, Sun } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const Header = ({ title = 'Flingo', showActions = true }) => {
  const { theme, isDark, toggleTheme } = useAppTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: '#FFF1F2' }]}>
          <Zap size={20} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.primary }]}>{title}</Text>
      </View>

      {showActions && (
        <View style={styles.right}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {isDark ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color={theme.colors.textSecondary} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('Bookmarks')}
            activeOpacity={0.7}
          >
            <Bookmark size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
