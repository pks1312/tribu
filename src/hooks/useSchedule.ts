import { useState, useCallback } from 'react';
import { scheduleAPI, type Schedule } from '@/services/api';

export const useSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSchedules = useCallback(async (params?: {
    professional_id?: number;
    date?: string;
    is_available?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      return await scheduleAPI.getSchedules(params);
    } catch (err: any) {
      console.error('Error fetching schedules:', err);
      setError(err.response?.data?.message || 'Error al cargar los horarios');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableSlots = useCallback(async (professionalId: number, date: string) => {
    try {
      setLoading(true);
      setError(null);
      return await scheduleAPI.getAvailableSlots(professionalId, date);
    } catch (err: any) {
      console.error('Error fetching available slots:', err);
      setError(err.response?.data?.message || 'Error al cargar los horarios disponibles');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (scheduleData: Partial<Schedule>) => {
    try {
      setLoading(true);
      setError(null);
      const newSchedule = await scheduleAPI.createSchedule(scheduleData);
      return newSchedule;
    } catch (err: any) {
      console.error('Error creating schedule:', err);
      setError(err.response?.data?.message || 'Error al crear el horario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkCreateSchedules = useCallback(async (schedules: Partial<Schedule>[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scheduleAPI.bulkCreateSchedules(schedules);
      return result;
    } catch (err: any) {
      console.error('Error creating schedules:', err);
      setError(err.response?.data?.message || 'Error al crear los horarios');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSchedule = useCallback(async (id: number, scheduleData: Partial<Schedule>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSchedule = await scheduleAPI.updateSchedule(id, scheduleData);
      return updatedSchedule;
    } catch (err: any) {
      console.error('Error updating schedule:', err);
      setError(err.response?.data?.message || 'Error al actualizar el horario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSchedule = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await scheduleAPI.deleteSchedule(id);
    } catch (err: any) {
      console.error('Error deleting schedule:', err);
      setError(err.response?.data?.message || 'Error al eliminar el horario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getSchedules,
    getAvailableSlots,
    createSchedule,
    bulkCreateSchedules,
    updateSchedule,
    deleteSchedule
  };
};
