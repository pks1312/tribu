import { useState, useEffect, useCallback } from 'react';
import { bookingsAPI, type Booking, type BookingData } from '@/services/api';

export const useBookings = (userId?: number) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = userId 
        ? await bookingsAPI.getUserBookings(userId)
        : await bookingsAPI.getAllBookings();
      setBookings(data);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = useCallback(async (bookingData: BookingData, userId?: number) => {
    try {
      const bookingId = await bookingsAPI.createBooking(bookingData, userId);
      await fetchBookings();
      return bookingId;
    } catch (err: any) {
      console.error('Error creating booking:', err);
      throw new Error(err.response?.data?.message || 'Error al crear la reserva');
    }
  }, [fetchBookings]);

  const updateBookingStatus = useCallback(async (bookingId: number, status: Booking['status']) => {
    try {
      await bookingsAPI.updateBookingStatus(bookingId, status);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status } : b
      ));
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      throw new Error(err.response?.data?.message || 'Error al actualizar el estado de la reserva');
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: number) => {
    try {
      await bookingsAPI.cancelBooking(bookingId);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      ));
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      throw new Error(err.response?.data?.message || 'Error al cancelar la reserva');
    }
  }, []);

  const confirmBooking = useCallback(async (bookingId: number) => {
    try {
      await bookingsAPI.confirmBooking(bookingId);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'confirmed' as const } : b
      ));
    } catch (err: any) {
      console.error('Error confirming booking:', err);
      throw new Error(err.response?.data?.message || 'Error al confirmar la reserva');
    }
  }, []);

  const completeBooking = useCallback(async (bookingId: number) => {
    try {
      await bookingsAPI.completeBooking(bookingId);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'completed' as const } : b
      ));
    } catch (err: any) {
      console.error('Error completing booking:', err);
      throw new Error(err.response?.data?.message || 'Error al completar la reserva');
    }
  }, []);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    confirmBooking,
    completeBooking
  };
};
