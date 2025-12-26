// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://choir-backend-925038690128.us-central1.run.app';

export const API_ENDPOINTS = {
  rehearsals: `${API_URL}/rehearsals`,
  health: `${API_URL}/health`,
};

// Request configuration
export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};
