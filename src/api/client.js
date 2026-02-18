import axios from 'axios';

// Dynamic Base URL (can be set in localStorage for flexibility)
const getBaseUrl = () => {
  const storedIp = localStorage.getItem('SERVER_IP');
  return storedIp ? `http://${storedIp}:8000` : 'http://127.0.0.1:8000';
};

const client = axios.create({
  baseURL: getBaseUrl(),
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
