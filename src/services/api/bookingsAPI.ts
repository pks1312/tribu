import api from './config';

export interface BookingData {
  professional: number;
  professionalId?: number; // Compatibilidad
  service: number;
  serviceId?: number; // Compatibilidad
  client_name: string;
  clientName?: string; // Compatibilidad
  client_email: string;
  clientEmail?: string; // Compatibilidad
  client_phone: string;
  clientPhone?: string; // Compatibilidad
  date: string;
  time: string;
  notes?: string;
}

export interface Booking {
  id: number;
  user?: number;
  professional: number;
  professional_name: string;
  service: number;
  service_name: string;
  service_duration: number;
  service_price: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  created_at: string;
  updated_at: string;
}

// Función helper para normalizar datos
const normalizeBookingData = (data: BookingData): any => {
  return {
    professional: data.professional || data.professionalId,
    service: data.service || data.serviceId,
    client_name: data.client_name || data.clientName,
    client_email: data.client_email || data.clientEmail,
    client_phone: data.client_phone || data.clientPhone,
    date: data.date,
    time: data.time,
    notes: data.notes || ''
  };
};

export const bookingsAPI = {
  async createBooking(bookingData: BookingData, userId?: number): Promise<number> {
    const normalizedData = normalizeBookingData(bookingData);
    if (userId) {
      normalizedData.user = userId;
    }
    
    const response = await api.post('/bookings/', normalizedData);
    return response.data.id;
  },

  async getBooking(bookingId: number): Promise<Booking> {
    const response = await api.get(`/bookings/${bookingId}/`);
    return response.data;
  },

  async getUserBookings(userId: number): Promise<Booking[]> {
    const response = await api.get('/bookings/', {
      params: { user_id: userId }
    });
    return response.data;
  },

  async updateBookingStatus(bookingId: number, status: Booking['status']): Promise<void> {
    await api.patch(`/bookings/${bookingId}/`, { status });
  },

  async getAllBookings(): Promise<Booking[]> {
    const response = await api.get('/bookings/');
    return response.data;
  },

  async getBookingsByDate(date: string): Promise<Booking[]> {
    const response = await api.get('/bookings/', {
      params: { date }
    });
    return response.data;
  },

  async getBookingsByProfessional(professionalId: number): Promise<Booking[]> {
    const response = await api.get('/bookings/', {
      params: { professional_id: professionalId }
    });
    return response.data;
  },

  async updateBooking(bookingId: number, updates: Partial<Booking>): Promise<void> {
    await api.patch(`/bookings/${bookingId}/`, updates);
  },

  async cancelBooking(bookingId: number): Promise<void> {
    await api.post(`/bookings/${bookingId}/cancel/`);
  },

  async confirmBooking(bookingId: number): Promise<void> {
    await api.post(`/bookings/${bookingId}/confirm/`);
  },

  async completeBooking(bookingId: number): Promise<void> {
    await api.post(`/bookings/${bookingId}/complete/`);
  }
};
