// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const loginUser = async (emailOrUsername, password) => {
  try {
    const response = await axiosInstance.post('/login', { emailOrUsername, password });
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await axiosInstance.post('/register', { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logoutUser = async () => {
  try {
    await axiosInstance.post('/logout');
  } catch (error) {
    throw error.response.data;
  }
};

export const verifyAuth = async () => {
  try {
    const response = await axiosInstance.get('/auth/verify');
    console.log('Response from /auth/verify:', response.data); // Debugging line
    return response.data; // This should contain { user: { id, email, ... } }
  } catch (error) {
    console.error('Error verifying auth:', error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/refresh-token'); // Sends request with cookies
    const newAccessToken = response.data.accessToken;
    localStorage.setItem('accessToken', newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export default axiosInstance;
