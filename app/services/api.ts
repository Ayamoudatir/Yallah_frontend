// app/services/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

/* =========================
   REQUEST INTERCEPTOR
   ========================= */
API.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

/* =========================
   RESPONSE INTERCEPTOR
   ========================= */
API.interceptors.response.use(
  (response) => {
    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
    );
    return response;
  },
  (error) => {
    const status = error.response?.status;

    /**
     * ⛔️ 400 / 401
     * → erreurs métier normales (validation, auth)
     * → PAS de log rouge
     */
    if (status === 400 || status === 401) {
      return Promise.reject(error);
    }

    /**
     * ❌ VRAIES erreurs techniques
     */
    console.error('❌ API Error:', {
      message: error.message,
      status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    return Promise.reject(error);
  }
);

export default API;