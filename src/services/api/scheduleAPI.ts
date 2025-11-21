import api from './config';

export interface Schedule {
  id: number;
  professional: number;
  professional_name?: string;
  date: string;
  time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const scheduleAPI = {
  async getSchedules(params?: {
    professional_id?: number;
    date?: string;
    is_available?: boolean;
  }): Promise<Schedule[]> {
    const response = await api.get('/schedules/', { params });
    return response.data;
  },

  async getSchedule(id: number): Promise<Schedule> {
    const response = await api.get(`/schedules/${id}/`);
    return response.data;
  },

  async createSchedule(scheduleData: Partial<Schedule>): Promise<Schedule> {
    const response = await api.post('/schedules/', scheduleData);
    return response.data;
  },

  async bulkCreateSchedules(schedules: Partial<Schedule>[]): Promise<any> {
    const response = await api.post('/schedules/bulk_create/', { schedules });
    return response.data;
  },

  async updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule> {
    const response = await api.patch(`/schedules/${id}/`, scheduleData);
    return response.data;
  },

  async deleteSchedule(id: number): Promise<void> {
    await api.delete(`/schedules/${id}/`);
  },

  async getAvailableSlots(professionalId: number, date: string): Promise<string[]> {
    const response = await api.get('/schedules/', {
      params: {
        professional_id: professionalId,
        date,
        is_available: true
      }
    });
    return response.data.map((schedule: Schedule) => schedule.time);
  },

  async bookSlot(professionalId: number, date: string, time: string): Promise<void> {
    // Este método es manejado por el backend al crear la reserva
    const schedules = await this.getSchedules({
      professional_id: professionalId,
      date,
      is_available: true
    });
    
    const schedule = schedules.find(s => s.time === time);
    if (!schedule) {
      throw new Error('Horario no disponible');
    }
  },

  async cancelSlot(professionalId: number, date: string, time: string): Promise<void> {
    const schedules = await this.getSchedules({
      professional_id: professionalId,
      date
    });
    
    const schedule = schedules.find(s => s.time === time);
    if (schedule) {
      await this.updateSchedule(schedule.id, { is_available: true });
    }
  }
};
