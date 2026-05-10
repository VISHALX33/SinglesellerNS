import axios from 'axios';
import config from './config';

const api = axios.create({
  baseURL: config.API_URL,
});

// Add interceptor to include token if available
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default api;
