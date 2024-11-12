// src/services/dbService.js
import axios from 'axios';
import { refreshToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export async function saveTrip(userId, tripDetails) {
  try {
    const response = await axiosInstance.post('/trips', { userId, ...tripDetails });
    return response.data;
  } catch (error) {
    console.error('Error saving trip:', error);
    throw error;
  }
}


export async function getUserTrips(userId) {
  try {
    const response = await axiosInstance.get(`/trips/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user trips:', error);
    throw error;
  }
}

export async function updateTrip(tripId, tripDetails) {
  try {
    const response = await axiosInstance.put(`/trips/${tripId}`, tripDetails);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error updating trip');
  }
}

export async function deleteTrip(tripId) {
  try {
    const response = await axiosInstance.delete(`/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
}

function handleApiError(error, message) {
  console.error(message, error);
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
    if (error.response.status === 401) {
      console.error('Unauthorized: Check API key or token permissions');
    }
  }
  throw error;
}
