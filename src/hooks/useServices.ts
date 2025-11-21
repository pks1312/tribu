import { useState, useEffect, useCallback } from 'react';
import { servicesAPI, type Service } from '@/services/api';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicesAPI.getAllServices();
      setServices(data);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.response?.data?.message || 'Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = useCallback(async (serviceData: Partial<Service>) => {
    try {
      const newService = await servicesAPI.createService(serviceData);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (err: any) {
      console.error('Error creating service:', err);
      throw new Error(err.response?.data?.message || 'Error al crear el servicio');
    }
  }, []);

  const updateService = useCallback(async (id: number, serviceData: Partial<Service>) => {
    try {
      const updatedService = await servicesAPI.updateService(id, serviceData);
      setServices(prev => prev.map(s => s.id === id ? updatedService : s));
      return updatedService;
    } catch (err: any) {
      console.error('Error updating service:', err);
      throw new Error(err.response?.data?.message || 'Error al actualizar el servicio');
    }
  }, []);

  const deleteService = useCallback(async (id: number) => {
    try {
      await servicesAPI.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      console.error('Error deleting service:', err);
      throw new Error(err.response?.data?.message || 'Error al eliminar el servicio');
    }
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    createService,
    updateService,
    deleteService
  };
};
