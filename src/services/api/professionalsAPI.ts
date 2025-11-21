import api from './config';

export interface Professional {
  id: number;
  name: string;
  bio: string;
  photo_url?: string;
  specialties: string;
  specialties_list?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const professionalsAPI = {
  async getAllProfessionals(): Promise<Professional[]> {
    const response = await api.get('/professionals/');
    return response.data;
  },

  async getProfessional(id: number): Promise<Professional> {
    const response = await api.get(`/professionals/${id}/`);
    return response.data;
  },

  async createProfessional(professionalData: Partial<Professional>): Promise<Professional> {
    const response = await api.post('/professionals/', professionalData);
    return response.data;
  },

  async updateProfessional(id: number, professionalData: Partial<Professional>): Promise<Professional> {
    const response = await api.patch(`/professionals/${id}/`, professionalData);
    return response.data;
  },

  async deleteProfessional(id: number): Promise<void> {
    await api.delete(`/professionals/${id}/`);
  },

  async getAvailableDates(professionalId: number, days: number = 30): Promise<string[]> {
    const response = await api.get(`/professionals/${professionalId}/available_dates/`, {
      params: { days }
    });
    return response.data.dates;
  }
};
