/**
 * Application Configuration
 * Centralized configuration for API endpoints and environment variables
 */

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  'http://localhost:8000';

export const API_ENDPOINTS = {
  YOUTUBE: {
    SYNC: `${API_BASE_URL}/api/v1/youtube/sync`,
  },
  AI: {
    GENERATE_SCRIPT: `${API_BASE_URL}/api/v1/ai/generate-script`,
    GENERATE_METADATA: `${API_BASE_URL}/api/v1/ai/generate-metadata`,
    ANALYZE_THUMBNAIL: `${API_BASE_URL}/api/v1/ai/analyze-thumbnail`,
  },
  ANALYTICS: {
    OVERVIEW: `${API_BASE_URL}/api/v1/analytics/overview`,
    TRENDS: `${API_BASE_URL}/api/v1/analytics/trends`,
    PROCESS: `${API_BASE_URL}/api/v1/analytics/process`,
  },
} as const;

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
