import api from './config';

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const servicesAPI = {
  async getAllServices(): Promise<Service[]> {
    const response = await api.get('/services/');
    return response.data;
  },

  async getService(id: number): Promise<Service> {
    const response = await api.get(`/services/${id}/`);
    return response.data;
  },

  async createService(serviceData: Partial<Service>): Promise<Service> {
    const response = await api.post('/services/', serviceData);
    return response.data;
  },

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service> {
    const response = await api.patch(`/services/${id}/`, serviceData);
    return response.data;
  },

  async deleteService(id: number): Promise<void> {
    await api.delete(`/services/${id}/`);
  }
};
