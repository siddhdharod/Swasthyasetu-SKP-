import axios, { AxiosInstance, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  withCredentials: true,
});

// Add request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Advanced Retry Logic for AI Services
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;
    
    // Only retry for network errors or 503/504, and only for AI endpoints
    if (
      config && 
      (config.url?.includes('chatbot') || config.url?.includes('ai-suggestions') || config.url?.includes('claims/analyze')) &&
      !config._retry && 
      (error.code === 'ECONNABORTED' || error.response?.status === 503 || error.response?.status === 504)
    ) {
      config._retry = true;
      config.retryCount = (config.retryCount || 0) + 1;
      
      if (config.retryCount <= 2) {
        console.warn(`AI Node congestion detected. Retrying attempt ${config.retryCount}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount));
        return api(config);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
