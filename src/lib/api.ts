// API configuration
// In development, use the Vite proxy (empty string = relative URLs)
// In production, use the environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:8787');

export const API_ENDPOINTS = {
  machines: `${API_BASE_URL}/api/machines`,
  query: `${API_BASE_URL}/api/query`,
  queryStream: `${API_BASE_URL}/api/query/stream`,
  health: `${API_BASE_URL}/api/health`,
  tts: `${API_BASE_URL}/api/tts`,
  ingest: `${API_BASE_URL}/api/ingest`,
  ingestUpload: `${API_BASE_URL}/api/ingest/upload`,
};

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
export const apiBaseUrl = API_BASE_URL;

// Enhanced fetch with retry logic and error handling
export async function apiCall(
  endpoint: string, 
  options: RequestInit = {}, 
  retries = 3
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // If successful, return response
      if (response.ok || response.status < 500) {
        return response;
      }

      // If server error and we have retries left, continue
      if (i === retries - 1) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // If network error and we have retries left, continue
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error('Max retries exceeded');
}

// Health check function
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 5000
    } as any);
    return response.ok;
  } catch {
    return false;
  }
}
