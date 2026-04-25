// API Base URL - change to your VPS IP or domain in production
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.3:8080/api/v1'
  : 'https://api.yourdomain.com/api/v1';

export const WS_BASE_URL = __DEV__
  ? 'ws://192.168.1.3:8080/api/v1'
  : 'wss://api.yourdomain.com/api/v1';

// App Config
export const APP_NAME = 'AS Cab';
export const APP_VERSION = '1.0.0';

// Supported Languages
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },    // Tamil
  { code: 'tg', label: 'Tanglish' },
];

// Vehicle seat types
export const SEAT_TYPES = {
  FIVE: '5',
  SEVEN: '7',
};

// Booking status colors
export const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#10B981',
  completed: '#6366F1',
  cancelled: '#EF4444',
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  UPI: 'upi',
};
