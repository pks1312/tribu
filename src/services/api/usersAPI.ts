import api from './config';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export const usersAPI = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/users/me/');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async getUser(id: number): Promise<User> {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await api.patch(`/users/${id}/`, userData);
    return response.data;
  }
};
