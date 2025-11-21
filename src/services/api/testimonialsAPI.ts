import api from './config';

export interface Testimonial {
  id: number;
  author: string;
  content: string;
  rating: number;
  service?: number;
  service_name?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export const testimonialsAPI = {
  async getAllTestimonials(serviceId?: number): Promise<Testimonial[]> {
    const params = serviceId ? { service_id: serviceId } : {};
    const response = await api.get('/testimonials/', { params });
    return response.data;
  },

  async getTestimonial(id: number): Promise<Testimonial> {
    const response = await api.get(`/testimonials/${id}/`);
    return response.data;
  },

  async createTestimonial(testimonialData: Partial<Testimonial>): Promise<Testimonial> {
    const response = await api.post('/testimonials/', testimonialData);
    return response.data;
  },

  async updateTestimonial(id: number, testimonialData: Partial<Testimonial>): Promise<Testimonial> {
    const response = await api.patch(`/testimonials/${id}/`, testimonialData);
    return response.data;
  },

  async deleteTestimonial(id: number): Promise<void> {
    await api.delete(`/testimonials/${id}/`);
  },

  async approveTestimonial(id: number): Promise<void> {
    await api.post(`/testimonials/${id}/approve/`);
  }
};
