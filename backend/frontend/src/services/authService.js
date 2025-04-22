// src/services/authService.js
import axios from 'axios';

// Remove /api from the base URL since it's already in REACT_APP_API_URL
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const loginUser = async (emailOrUsername, password) => {
  try {
    const response = await axiosInstance.post('/api/login', { emailOrUsername, password });
    if (response.data && response.data.user) {
      return response.data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await axiosInstance.post('/api/register', { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const logoutUser = async () => {
  try {
    await axiosInstance.post('/api/logout');
  } catch (error) {
    throw error.response?.data || { message: 'Logout failed' };
  }
};

export const verifyAuth = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/verify');
    if (response.data && response.data.user) {
      return response.data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Auth verification error:', error);
    throw error.response?.data || { message: 'Auth verification failed' };
  }
};

export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/api/refresh-token');
    if (response.data && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data.accessToken;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error.response?.data || { message: 'Token refresh failed' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export default axiosInstance;
