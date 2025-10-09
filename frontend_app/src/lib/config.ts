/**
 * Configuration Module
 * Accesses runtime configuration from window.VERIDIA_CONFIG
 * NO HARDCODED PATHS - All configuration is dynamic
 */

interface VeridiaConfig {
  API_BASE_URL: string;
  VERSION: string;
  ENVIRONMENT: string;
}

// Extend Window interface to include VERIDIA_CONFIG
declare global {
  interface Window {
    VERIDIA_CONFIG: VeridiaConfig;
  }
}

/**
 * Get runtime configuration
 * This is loaded from config.js which is generated at deployment time
 */
export function getConfig(): VeridiaConfig {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return {
      API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      VERSION: '1.0.0',
      ENVIRONMENT: process.env.NODE_ENV || 'development'
    };
  }
  
  // Client-side: use runtime config from window.VERIDIA_CONFIG
  if (!window.VERIDIA_CONFIG) {
    console.warn('VERIDIA_CONFIG not loaded, using defaults');
    return {
      API_BASE_URL: 'http://localhost:8000',
      VERSION: '1.0.0',
      ENVIRONMENT: 'development'
    };
  }
  
  return window.VERIDIA_CONFIG;
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return getConfig().API_BASE_URL;
}

/**
 * Get application version
 */
export function getAppVersion(): string {
  return getConfig().VERSION;
}

/**
 * Get environment
 */
export function getEnvironment(): string {
  return getConfig().ENVIRONMENT;
}
