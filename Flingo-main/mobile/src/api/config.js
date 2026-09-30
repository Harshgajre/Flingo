import AsyncStorage from '@react-native-async-storage/async-storage';

// Default to local machine IP on Wi-Fi network (Port 5000 is where the Express server runs)
export const DEFAULT_API_URL = 'http://10.216.168.101:5000';

let cachedApiUrl = null;

export const getApiBaseUrl = async () => {
  if (cachedApiUrl) return cachedApiUrl;
  try {
    const saved = await AsyncStorage.getItem('@flingo_api_base_url');
    if (saved) {
      cachedApiUrl = saved;
      return saved;
    }
  } catch (e) {
    console.warn('Error reading API base URL from storage', e);
  }
  cachedApiUrl = DEFAULT_API_URL;
  return DEFAULT_API_URL;
};

export const setApiBaseUrl = async (newUrl) => {
  let cleaned = (newUrl || '').trim();
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  cachedApiUrl = cleaned;
  await AsyncStorage.setItem('@flingo_api_base_url', cleaned);
  return cleaned;
};

// Helper to resolve relative media paths (/uploads/...) to full absolute URLs
export const resolveMediaUrl = (path, baseUrl = DEFAULT_API_URL) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = cachedApiUrl || baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
