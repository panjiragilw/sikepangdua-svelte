// src/lib/api.ts

/**
 * Get the API base URL based on environment
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Log for debugging
  // console.log('Environment:', {
  //   mode: import.meta.env.MODE,
  //   prod: import.meta.env.PROD,
  //   dev: import.meta.env.DEV,
  //   apiBaseUrl: envUrl
  // });
  
  // If explicitly empty or undefined in production, use relative path
  if (envUrl === '' || envUrl === undefined) {
    return '';
  }
  
  // Otherwise use the configured URL
  return envUrl;
}