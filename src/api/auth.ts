import apiClient, { setAuthToken } from './client';
import { ApiResponse, User } from '../types';

export interface LoginResponse {
  user: User;
  token: string;
}

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
  if (response.data.success && response.data.data) {
    setAuthToken(response.data.data.token);
    return response.data.data;
  }
  throw new Error(response.data.message || 'Login failed');
};

export const getProfileApi = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
  if (response.data.success && response.data.data) {
    return response.data.data.user;
  }
  throw new Error('Failed to fetch profile');
};

export const getUsersApi = async (): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<User[]>>('/auth/users');
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  return [];
};

export const createUserApi = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager';
}): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>('/auth/users', userData);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to create user');
};

export const deleteUserApi = async (userId: string): Promise<void> => {
  await apiClient.delete(`/auth/users/${userId}`);
};
