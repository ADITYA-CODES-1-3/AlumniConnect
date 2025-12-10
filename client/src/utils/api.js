import axios from 'axios';

// 1. Define the Root Server URL (For Socket.io) - NO "/api" at the end
const SERVER_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'  
  : 'https://alumniconnect-ub5c.onrender.com'; 

// 2. Define the API URL (For Axios) - WITH "/api" at the end
const API_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Export SERVER_URL so Chat & Mentorship pages can use it
export { SERVER_URL }; 
export default api;

export const fetchEvents = () => api.get('/events/all');
export const createEvent = (eventData) => api.post('/events/create', eventData);
export const registerEvent = (eventId) => api.post(`/events/register/${eventId}`);