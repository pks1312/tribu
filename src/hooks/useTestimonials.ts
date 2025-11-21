import { useState, useEffect, useCallback } from 'react';
import { testimonialsAPI, type Testimonial } from '@/services/api';

export const useTestimonials = (serviceId?: number) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testimonialsAPI.getAllTestimonials(serviceId);
      setTestimonials(data);
    } catch (err: any) {
      console.error('Error fetching testimonials:', err);
      setError(err.response?.data?.message || 'Error al cargar los testimonios');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const createTestimonial = useCallback(async (testimonialData: Partial<Testimonial>) => {
    try {
      const newTestimonial = await testimonialsAPI.createTestimonial(testimonialData);
      await fetchTestimonials();
      return newTestimonial;
    } catch (err: any) {
      console.error('Error creating testimonial:', err);
      throw new Error(err.response?.data?.message || 'Error al crear el testimonio');
    }
  }, [fetchTestimonials]);

  const updateTestimonial = useCallback(async (id: number, testimonialData: Partial<Testimonial>) => {
    try {
      const updatedTestimonial = await testimonialsAPI.updateTestimonial(id, testimonialData);
      setTestimonials(prev => prev.map(t => t.id === id ? updatedTestimonial : t));
      return updatedTestimonial;
    } catch (err: any) {
      console.error('Error updating testimonial:', err);
      throw new Error(err.response?.data?.message || 'Error al actualizar el testimonio');
    }
  }, []);

  const deleteTestimonial = useCallback(async (id: number) => {
    try {
      await testimonialsAPI.deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting testimonial:', err);
      throw new Error(err.response?.data?.message || 'Error al eliminar el testimonio');
    }
  }, []);

  const approveTestimonial = useCallback(async (id: number) => {
    try {
      await testimonialsAPI.approveTestimonial(id);
      setTestimonials(prev => prev.map(t => 
        t.id === id ? { ...t, is_approved: true } : t
      ));
    } catch (err: any) {
      console.error('Error approving testimonial:', err);
      throw new Error(err.response?.data?.message || 'Error al aprobar el testimonio');
    }
  }, []);

  return {
    testimonials,
    loading,
    error,
    refetch: fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    approveTestimonial
  };
};
