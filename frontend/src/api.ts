// API utility for handling base URL in development vs production
const getApiBaseUrl = () => {
  // In development, use relative URLs (will be proxied by Vite)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // In production, use the deployed backend URL
  return 'https://informatics-myplan-beta-production.up.railway.app';
};

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const apiGet = (endpoint: string) => apiCall(endpoint);
export const apiPost = (endpoint: string, data: any) => apiCall(endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
});
export const apiPut = (endpoint: string, data: any) => apiCall(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data),
});
export const apiDelete = (endpoint: string) => apiCall(endpoint, {
  method: 'DELETE',
});
