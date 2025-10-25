/**
 * API Configuration for Ar-Rahnu & BSE System
 * 
 * This file defines the API endpoints for both modules.
 * The frontend will dynamically route to the appropriate backend
 * based on the user's scope and the feature being accessed.
 */

export const API_ENDPOINTS = {
  RAHNU: import.meta.env.VITE_RAHNU_API_URL || 'http://localhost:4001',
  BSE: import.meta.env.VITE_BSE_API_URL || 'http://localhost:4002',
} as const;

/**
 * Get the appropriate API URL based on the module scope
 */
export function getApiUrl(scope: 'rahnu' | 'bse' | 'admin'): string {
  if (scope === 'rahnu') return API_ENDPOINTS.RAHNU;
  if (scope === 'bse') return API_ENDPOINTS.BSE;
  // Admin has access to both, default to Rahnu
  return API_ENDPOINTS.RAHNU;
}

/**
 * Helper to build full API endpoint URLs
 */
export function buildApiUrl(scope: 'rahnu' | 'bse', path: string): string {
  const baseUrl = scope === 'rahnu' ? API_ENDPOINTS.RAHNU : API_ENDPOINTS.BSE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/api/${scope}${cleanPath}`;
}

export default API_ENDPOINTS;

