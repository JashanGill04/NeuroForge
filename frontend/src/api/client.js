import axios from 'axios';
import keycloak from '../lib/keyclock';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// 1. Create the Axios client instance first
const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. Intercept outgoing requests to attach the Keycloak JWT
client.interceptors.request.use((config) => {
  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

// 3. Keep your teammate's error normalizer for clean UI errors
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const backendMessage = err?.response?.data?.error;
    const message = backendMessage || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default client;