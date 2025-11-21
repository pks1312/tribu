import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { bookingsAPI, type BookingDocument } from '@/services/api/bookingsAPI';
import { servicesAPI, type ServiceDocument } from '@/services/api/servicesAPI';
import { professionalsAPI, type ProfessionalDocument } from '@/services/api/professionalsAPI';
import { formatDate, formatTime } from '@/utils/helpers';
import { Icon } from '@/components/common';
import './BookingsManagement.css';

export const BookingsManagement: React.FC = memo(() => {
  const [bookings, setBookings] = useState<BookingDocument[]>([]);
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allBookings, allServices, allProfessionals] = await Promise.all([
        bookingsAPI.getAllBookings(),
        servicesAPI.getServices(),
        professionalsAPI.getProfessionals()
      ]);
      setBookings(allBookings);
      setServices(allServices);
      setProfessionals(allProfessionals);
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      setError(err.message || 'Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = useCallback(async (bookingId: string, newStatus: BookingDocument['status']) => {
    try {
      setUpdating(bookingId);
      setError(null);
      await bookingsAPI.updateBookingStatus(bookingId, newStatus);
      await loadData();
    } catch (err: any) {
      console.error('Error updating booking:', err);
      setError(err.message || 'Error al actualizar la reserva');
    } finally {
      setUpdating(null);
    }
  }, [loadData]);

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    if (selectedDate) {
      filtered = filtered.filter(b => {
        const bookingDate = typeof b.date === 'string' ? b.date : b.date.toDate().toISOString().split('T')[0];
        return bookingDate === selectedDate;
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      const dateA = typeof a.date === 'string' ? a.date : a.date.toDate().toISOString();
      const dateB = typeof b.date === 'string' ? b.date : b.date.toDate().toISOString();
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return (b.time || '').localeCompare(a.time || '');
    });
  }, [bookings, selectedDate, filterStatus]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => {
      const bookingDate = typeof b.date === 'string' ? b.date : b.date.toDate().toISOString().split('T')[0];
      return bookingDate === today;
    });

    return {
      total: bookings.length,
      today: {
        total: todayBookings.length,
        pending: todayBookings.filter(b => b.status === 'pending').length,
        confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
        completed: todayBookings.filter(b => b.status === 'completed').length,
        cancelled: todayBookings.filter(b => b.status === 'cancelled').length
      },
      filtered: {
        total: filteredBookings.length,
        pending: filteredBookings.filter(b => b.status === 'pending').length,
        confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
        completed: filteredBookings.filter(b => b.status === 'completed').length,
        cancelled: filteredBookings.filter(b => b.status === 'cancelled').length
      }
    };
  }, [bookings, filteredBookings]);

  const getServiceName = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Servicio desconocido';
  }, [services]);

  const getProfessionalName = useCallback((professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    return professional?.name || 'Profesional desconocido';
  }, [professionals]);

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'pending': return 'status-badge-pending';
      case 'confirmed': return 'status-badge-confirmed';
      case 'completed': return 'status-badge-completed';
      case 'cancelled': return 'status-badge-cancelled';
      default: return 'status-badge-pending';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="bookings-loading">
        <div className="spinner"></div>
        <p>Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="bookings-management">
      <div className="management-header">
        <div>
          <h2 className="management-title">Gestión de Reservas</h2>
          <p className="management-subtitle">Administra el estado de las citas y reservas</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <Icon name="x" size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-dismiss">
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      <div className="bookings-quick-stats">
        <div className="quick-stat-card">
          <div className="quick-stat-icon" style={{ background: '#7FD3B0' }}>
            <Icon name="calendar" size={20} color="white" />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-label">Total Hoy</span>
            <span className="quick-stat-value">{stats.today.total}</span>
          </div>
        </div>

        <div className="quick-stat-card">
          <div className="quick-stat-icon" style={{ background: '#ff9500' }}>
            <Icon name="clock" size={20} color="white" />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-label">Pendientes</span>
            <span className="quick-stat-value">{stats.today.pending}</span>
          </div>
        </div>

        <div className="quick-stat-card">
          <div className="quick-stat-icon" style={{ background: '#A8E6CF' }}>
            <Icon name="check" size={20} color="white" />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-label">Confirmadas</span>
            <span className="quick-stat-value">{stats.today.confirmed}</span>
          </div>
        </div>

        <div className="quick-stat-card">
          <div className="quick-stat-icon" style={{ background: '#4ECDC4' }}>
            <Icon name="checkCircle" size={20} color="white" />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-label">Completadas</span>
            <span className="quick-stat-value">{stats.today.completed}</span>
          </div>
        </div>
      </div>

      <div className="bookings-controls">
        <div className="filters-group">
          <div className="filter-item">
            <label htmlFor="date-filter">Fecha</label>
            <input
              type="date"
              id="date-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-date-input"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="clear-filter-btn"
                title="Limpiar filtro"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>

          <div className="filter-item">
            <label htmlFor="status-filter">Estado</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-status-select"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          <span className="results-count">{stats.filtered.total} reservas encontradas</span>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bookings-empty-state">
          <Icon name="calendar" size={64} color="var(--text-tertiary)" />
          <h3>No hay reservas</h3>
          <p>No se encontraron reservas con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="bookings-table-wrapper">
          <table className="bookings-table-modern">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Profesional</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const bookingDate = typeof booking.date === 'string' 
                  ? new Date(booking.date) 
                  : booking.date.toDate();
                const isUpdating = updating === booking.id;

                return (
                  <tr key={booking.id} className={isUpdating ? 'updating' : ''}>
                    <td>
                      <div className="datetime-cell">
                        <div className="date-row">
                          <Icon name="calendar" size={14} color="var(--text-tertiary)" />
                          <span>{formatDate(bookingDate)}</span>
                        </div>
                        <div className="time-row">
                          <Icon name="clock" size={14} color="var(--text-tertiary)" />
                          <span>{formatTime(booking.time)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="client-cell">
                        <strong className="client-name">{booking.clientName}</strong>
                        <span className="client-email">{booking.clientEmail}</span>
                        {booking.clientPhone && (
                          <span className="client-phone">{booking.clientPhone}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="service-name">{getServiceName(booking.serviceId)}</span>
                    </td>
                    <td>
                      <span className="professional-name">{getProfessionalName(booking.professionalId)}</span>
                    </td>
                    <td>
                      <span className={`status-badge-modern ${getStatusClass(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking.id!, 'confirmed')}
                              className="action-btn action-confirm"
                              disabled={isUpdating}
                              title="Confirmar reserva"
                            >
                              <Icon name="check" size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id!, 'cancelled')}
                              className="action-btn action-cancel"
                              disabled={isUpdating}
                              title="Cancelar reserva"
                            >
                              <Icon name="x" size={16} />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking.id!, 'completed')}
                              className="action-btn action-complete"
                              disabled={isUpdating}
                              title="Marcar como completada"
                            >
                              <Icon name="checkCircle" size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id!, 'cancelled')}
                              className="action-btn action-cancel"
                              disabled={isUpdating}
                              title="Cancelar reserva"
                            >
                              <Icon name="x" size={16} />
                            </button>
                          </>
                        )}
                        {(booking.status === 'completed' || booking.status === 'cancelled') && (
                          <span className="actions-placeholder">Sin acciones</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

BookingsManagement.displayName = 'BookingsManagement';
