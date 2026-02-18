import axios from 'axios';

// Dynamic Base URL
const getBaseUrl = () => {
  // 1. Priority: Environment Variable (Build time)
  if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
  }
  
  // 2. Priority: Runtime setting (for testing)
  const storedUrl = localStorage.getItem('SERVER_URL');
  if (storedUrl) {
      return storedUrl.startsWith('http') ? storedUrl : `https://${storedUrl}`;
  }
  
  // 3. Fallback: Localhost
  return 'http://127.0.0.1:8000';
};

const client = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000, // 1 minute timeout (for Render cold starts)
});

// Request Interceptor
client.interceptors.request.use(async (config) => {
  config.baseURL = getBaseUrl();
  
  // Attach x-user-id if available
  const userId = localStorage.getItem('x-user-id');
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default client;
