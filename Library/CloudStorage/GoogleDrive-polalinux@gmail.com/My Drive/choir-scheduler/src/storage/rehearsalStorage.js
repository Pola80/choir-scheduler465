import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'CHOIR_REHEARSALS_v1';

// Set your Cloud Run / production URL here. Leave as the placeholder to use
// a sensible default for local development (Android emulator or localhost).
let CLOUD_RUN_URL = 'https://YOUR_CLOUD_RUN_URL.a.run.app';

// Default API_BASE resolution logic:
// - If CLOUD_RUN_URL has been replaced with a real URL, use it (production)
// - Otherwise, use emulator/localhost for local development
let API_BASE = CLOUD_RUN_URL !== 'https://YOUR_CLOUD_RUN_URL.a.run.app'
  ? CLOUD_RUN_URL
  : (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

// Allow runtime override (useful in debugging or CI)
export function setApiBase(url) {
  API_BASE = url;
}

async function fetchOrFallback(fetcher, fallbackFn) {
  try {
    return await fetcher();
  } catch (e) {
    console.warn('backend unavailable, falling back to AsyncStorage', e.message || e);
    return await fallbackFn();
  }
}

export async function loadRehearsals() {
  return fetchOrFallback(async () => {
    const res = await fetch(`${API_BASE}/rehearsals`);
    if (!res.ok) throw new Error('Network error');
    return res.json();
  }, async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('loadRehearsals', e);
      return [];
    }
  });
}

export async function saveRehearsal(rehearsal) {
  return fetchOrFallback(async () => {
    const res = await fetch(`${API_BASE}/rehearsals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rehearsal)
    });
    if (!res.ok) throw new Error('Network error');
    return res.json();
  }, async () => {
    const all = await loadRehearsals();
    all.push(rehearsal);
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
    return rehearsal;
  });
}

export async function getRehearsal(id) {
  return fetchOrFallback(async () => {
    const res = await fetch(`${API_BASE}/rehearsals/${id}`);
    if (!res.ok) throw new Error('Network error');
    return res.json();
  }, async () => {
    const all = await loadRehearsals();
    return all.find(r => r.id === id) || null;
  });
}

export async function deleteRehearsal(id) {
  return fetchOrFallback(async () => {
    const res = await fetch(`${API_BASE}/rehearsals/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error('Network error');
    return true;
  }, async () => {
    const all = await loadRehearsals();
    const remaining = all.filter(r => r.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(remaining));
    return true;
  });
}
