import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from './config';

export const apiClient = async (endpoint, options = {}) => {
  const baseUrl = await getApiBaseUrl();
  const token = await AsyncStorage.getItem('@flingo_jwt_token');

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set default Content-Type to JSON
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || response.statusText || 'Request failed';
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.warn(`API Error [${options.method || 'GET'} ${cleanEndpoint}]:`, error.message);
    throw error;
  }
};
