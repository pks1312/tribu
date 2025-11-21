import { useState, useEffect, useCallback } from 'react';
import { professionalsAPI, type Professional } from '@/services/api';

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await professionalsAPI.getAllProfessionals();
      setProfessionals(data);
    } catch (err: any) {
      console.error('Error fetching professionals:', err);
      setError(err.response?.data?.message || 'Error al cargar los profesionales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const createProfessional = useCallback(async (professionalData: Partial<Professional>) => {
    try {
      const newProfessional = await professionalsAPI.createProfessional(professionalData);
      setProfessionals(prev => [...prev, newProfessional]);
      return newProfessional;
    } catch (err: any) {
      console.error('Error creating professional:', err);
      throw new Error(err.response?.data?.message || 'Error al crear el profesional');
    }
  }, []);

  const updateProfessional = useCallback(async (id: number, professionalData: Partial<Professional>) => {
    try {
      const updatedProfessional = await professionalsAPI.updateProfessional(id, professionalData);
      setProfessionals(prev => prev.map(p => p.id === id ? updatedProfessional : p));
      return updatedProfessional;
    } catch (err: any) {
      console.error('Error updating professional:', err);
      throw new Error(err.response?.data?.message || 'Error al actualizar el profesional');
    }
  }, []);

  const deleteProfessional = useCallback(async (id: number) => {
    try {
      await professionalsAPI.deleteProfessional(id);
      setProfessionals(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting professional:', err);
      throw new Error(err.response?.data?.message || 'Error al eliminar el profesional');
    }
  }, []);

  const getAvailableDates = useCallback(async (professionalId: number, days: number = 30) => {
    try {
      return await professionalsAPI.getAvailableDates(professionalId, days);
    } catch (err: any) {
      console.error('Error fetching available dates:', err);
      throw new Error(err.response?.data?.message || 'Error al cargar las fechas disponibles');
    }
  }, []);

  return {
    professionals,
    loading,
    error,
    refetch: fetchProfessionals,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    getAvailableDates
  };
};
