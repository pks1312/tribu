import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { bookingsAPI, type BookingDocument } from '@/services/api/bookingsAPI';
import { servicesAPI, type ServiceDocument } from '@/services/api/servicesAPI';
import { usersAPI } from '@/services/api/usersAPI';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Modal, Icon } from '@/components/common';
import { formatDate, formatTime } from '@/utils/helpers';
import './MySchedule.css';

const WORKING_HOURS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

const DAYS_TO_SHOW = 7;

export const MySchedule: React.FC = memo(() => {
  const { user, userProfile, isAdmin } = useAuth();
  const [bookings, setBookings] = useState<BookingDocument[]>([]);
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDocument | null>(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceId: '',
    professionalId: user?.uid || '',
    notes: ''
  });

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [allBookings, allServices, allProfessionals] = await Promise.all([
        bookingsAPI.getAllBookings(),
        servicesAPI.getServices(),
        usersAPI.getWorkers()
      ]);

      let filteredBookings = allBookings;
      if (!isAdmin && user.uid) {
        filteredBookings = allBookings.filter(b => b.professionalId === user.uid);
      }

      setBookings(filteredBookings);
      setServices(allServices);
      setProfessionals(allProfessionals);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la agenda');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [startDate]);

  const getBookingForSlot = useCallback((date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.find(b => {
      const bookingDate = typeof b.date === 'string' ? b.date : b.date.toDate().toISOString().split('T')[0];
      return bookingDate === dateStr && b.time === time;
    });
  }, [bookings]);

  const getServiceName = useCallback((serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Servicio';
  }, [services]);

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'pending': return 'booking-pending';
      case 'confirmed': return 'booking-confirmed';
      case 'completed': return 'booking-completed';
      case 'cancelled': return 'booking-cancelled';
      default: return '';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return '';
    }
  };

  const goToPreviousWeek = useCallback(() => {
    setStartDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setStartDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setStartDate(new Date());
  }, []);

  const handleSlotClick = useCallback((date: Date, time: string) => {
    const isPast = new Date() > new Date(`${date.toISOString().split('T')[0]}T${time}`);
    if (isPast) return;

    const booking = getBookingForSlot(date, time);
    
    if (booking) {
      setSelectedBooking(booking);
      setSelectedSlot(null);
    } else {
      setSelectedSlot({ date, time });
      setSelectedBooking(null);
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        serviceId: '',
        professionalId: isAdmin ? '' : (user?.uid || ''),
        notes: ''
      });
    }
    setIsModalOpen(true);
  }, [getBookingForSlot, isAdmin, user]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setSelectedBooking(null);
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      serviceId: '',
      professionalId: user?.uid || '',
      notes: ''
    });
    setError(null);
  }, [user]);

  const handleCreateBooking = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setError(null);

    if (!formData.clientName.trim()) {
      setError('El nombre del cliente es requerido');
      return;
    }

    if (!formData.clientEmail.trim()) {
      setError('El email del cliente es requerido');
      return;
    }

    if (!formData.clientPhone.trim()) {
      setError('El teléfono del cliente es requerido');
      return;
    }

    if (!formData.serviceId) {
      setError('Debes seleccionar un servicio');
      return;
    }

    if (!formData.professionalId) {
      setError('Debes seleccionar un profesional');
      return;
    }

    try {
      setProcessing(true);

      await bookingsAPI.createBooking({
        serviceId: formData.serviceId,
        professionalId: formData.professionalId,
        date: selectedSlot.date.toISOString().split('T')[0],
        time: selectedSlot.time,
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim(),
        clientPhone: formData.clientPhone.trim(),
        notes: formData.notes.trim(),
        status: 'confirmed'
      });

      await loadData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setProcessing(false);
    }
  }, [selectedSlot, formData, loadData, handleCloseModal]);

  const handleCancelBooking = useCallback(async () => {
    if (!selectedBooking) return;

    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await bookingsAPI.updateBookingStatus(selectedBooking.id!, 'cancelled');

      await loadData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Error al cancelar la reserva');
    } finally {
      setProcessing(false);
    }
  }, [selectedBooking, loadData, handleCloseModal]);

  const getProfessionalName = useCallback((professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    return professional?.displayName || professional?.email || 'Profesional';
  }, [professionals]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekBookings = bookings.filter(b => {
      const bookingDate = typeof b.date === 'string' ? b.date : b.date.toDate().toISOString().split('T')[0];
      const booking = new Date(bookingDate);
      const weekStart = new Date(startDate);
      const weekEnd = new Date(startDate);
      weekEnd.setDate(weekStart.getDate() + 7);
      return booking >= weekStart && booking < weekEnd;
    });

    return {
      today: bookings.filter(b => {
        const bookingDate = typeof b.date === 'string' ? b.date : b.date.toDate().toISOString().split('T')[0];
        return bookingDate === today;
      }).length,
      thisWeek: thisWeekBookings.length,
      confirmed: thisWeekBookings.filter(b => b.status === 'confirmed').length,
      pending: thisWeekBookings.filter(b => b.status === 'pending').length
    };
  }, [bookings, startDate]);

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="spinner"></div>
        <p>Cargando agenda...</p>
      </div>
    );
  }

  return (
    <div className="my-schedule">
      <div className="management-header">
        <div>
          <h2 className="management-title">
            {isAdmin ? 'Todas las Agendas' : 'Mi Agenda Personal'}
          </h2>
          <p className="management-subtitle">
            {isAdmin 
              ? 'Visualiza todas las reservas del equipo' 
              : `Agenda personal de ${userProfile?.displayName || user?.email}`}
          </p>
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

      <div className="schedule-stats">
        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#7FD3B0' }}>
            <Icon name="calendar" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Hoy</span>
            <span className="stat-mini-value">{stats.today}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#4ECDC4' }}>
            <Icon name="calendar" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Esta Semana</span>
            <span className="stat-mini-value">{stats.thisWeek}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#A8E6CF' }}>
            <Icon name="check" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Confirmadas</span>
            <span className="stat-mini-value">{stats.confirmed}</span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-icon" style={{ background: '#ff9500' }}>
            <Icon name="clock" size={20} color="white" />
          </div>
          <div className="stat-mini-content">
            <span className="stat-mini-label">Pendientes</span>
            <span className="stat-mini-value">{stats.pending}</span>
          </div>
        </div>
      </div>

      <div className="schedule-controls">
        <button onClick={goToPreviousWeek} className="nav-btn" title="Semana anterior">
          <Icon name="x" size={18} style={{ transform: 'rotate(180deg)' }} />
          <span>Anterior</span>
        </button>

        <button onClick={goToToday} className="today-btn">
          Hoy
        </button>

        <button onClick={goToNextWeek} className="nav-btn" title="Semana siguiente">
          <span>Siguiente</span>
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-grid">
          <div className="calendar-header">
            <div className="time-column-header">Hora</div>
            {dateRange.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={index} className={`day-header ${isToday ? 'today' : ''}`}>
                  <div className="day-name">{date.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                  <div className="day-number">{date.getDate()}</div>
                  <div className="day-month">{date.toLocaleDateString('es-ES', { month: 'short' })}</div>
                </div>
              );
            })}
          </div>

          <div className="calendar-body">
            {WORKING_HOURS.map((time) => (
              <div key={time} className="time-row">
                <div className="time-label">{time}</div>
                {dateRange.map((date, index) => {
                  const booking = getBookingForSlot(date, time);
                  const isPast = new Date() > new Date(`${date.toISOString().split('T')[0]}T${time}`);

                  return (
                    <div 
                      key={index} 
                      className={`time-slot ${booking ? getStatusClass(booking.status) : ''} ${isPast ? 'past' : ''} ${!isPast ? 'clickable' : ''}`}
                      onClick={() => !isPast && handleSlotClick(date, time)}
                    >
                      {booking ? (
                        <div className="booking-info">
                          <div className="booking-client">{booking.clientName}</div>
                          <div className="booking-service">{getServiceName(booking.serviceId)}</div>
                          <div className="booking-status">{getStatusLabel(booking.status)}</div>
                        </div>
                      ) : (
                        <div className="slot-available">
                          <Icon name="plus" size={16} color="var(--text-tertiary)" />
                          <span>Disponible</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="schedule-legend">
        <h4>Leyenda</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color booking-pending"></div>
            <span>Pendiente</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booking-confirmed"></div>
            <span>Confirmada</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booking-completed"></div>
            <span>Completada</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booking-cancelled"></div>
            <span>Cancelada</span>
          </div>
          <div className="legend-item">
            <div className="legend-color slot-available"></div>
            <span>Disponible</span>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="schedule-modal">
          {selectedBooking ? (
            <>
              <div className="modal-header-schedule">
                <Icon name="calendar" size={28} color="var(--accent-primary)" />
                <h3 className="modal-title-schedule">Detalles de la Reserva</h3>
              </div>

              {error && (
                <div className="error-banner">
                  <Icon name="x" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label">Cliente:</span>
                  <span className="detail-value">{selectedBooking.clientName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedBooking.clientEmail}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Teléfono:</span>
                  <span className="detail-value">{selectedBooking.clientPhone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Servicio:</span>
                  <span className="detail-value">{getServiceName(selectedBooking.serviceId)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Profesional:</span>
                  <span className="detail-value">{getProfessionalName(selectedBooking.professionalId)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">
                    {formatDate(typeof selectedBooking.date === 'string' ? new Date(selectedBooking.date) : selectedBooking.date.toDate())}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Hora:</span>
                  <span className="detail-value">{formatTime(selectedBooking.time)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estado:</span>
                  <span className={`status-badge-modal ${getStatusClass(selectedBooking.status)}`}>
                    {getStatusLabel(selectedBooking.status)}
                  </span>
                </div>
                {selectedBooking.notes && (
                  <div className="detail-row">
                    <span className="detail-label">Notas:</span>
                    <span className="detail-value">{selectedBooking.notes}</span>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={handleCloseModal} disabled={processing}>
                  Cerrar
                </Button>
                {selectedBooking.status !== 'cancelled' && (
                  <Button 
                    type="button" 
                    onClick={handleCancelBooking}
                    disabled={processing}
                    style={{ background: '#ff3b30' }}
                  >
                    <Icon name="x" size={18} color="currentColor" />
                    <span>{processing ? 'Cancelando...' : 'Cancelar Reserva'}</span>
                  </Button>
                )}
              </div>
            </>
          ) : selectedSlot && (
            <>
              <div className="modal-header-schedule">
                <Icon name="plus" size={28} color="var(--accent-primary)" />
                <h3 className="modal-title-schedule">Nueva Reserva Manual</h3>
              </div>

              <p className="modal-subtitle-schedule">
                {formatDate(selectedSlot.date)} a las {selectedSlot.time}
              </p>

              {error && (
                <div className="error-banner">
                  <Icon name="x" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="booking-form">
                <Input
                  id="client-name"
                  label="Nombre del Cliente"
                  value={formData.clientName}
                  onChange={(value) => setFormData({ ...formData, clientName: value })}
                  placeholder="Ej: Juan Pérez"
                  required
                />

                <Input
                  id="client-email"
                  label="Email del Cliente"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(value) => setFormData({ ...formData, clientEmail: value })}
                  placeholder="ejemplo@correo.com"
                  required
                />

                <Input
                  id="client-phone"
                  label="Teléfono del Cliente"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(value) => setFormData({ ...formData, clientPhone: value })}
                  placeholder="+56 9 1234 5678"
                  required
                />

                <div className="form-group-modern">
                  <label htmlFor="service-select" className="input-label-modern">
                    Servicio
                  </label>
                  <select
                    id="service-select"
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    className="select-field-modern"
                    required
                  >
                    <option value="">Seleccionar servicio...</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.duration} min
                      </option>
                    ))}
                  </select>
                </div>

                {isAdmin && (
                  <div className="form-group-modern">
                    <label htmlFor="professional-select" className="input-label-modern">
                      Profesional
                    </label>
                    <select
                      id="professional-select"
                      value={formData.professionalId}
                      onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                      className="select-field-modern"
                      required
                    >
                      <option value="">Seleccionar profesional...</option>
                      {professionals.map(professional => (
                        <option key={professional.id} value={professional.id}>
                          {professional.displayName || professional.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group-modern">
                  <label htmlFor="booking-notes" className="input-label-modern">
                    Notas (opcional)
                  </label>
                  <textarea
                    id="booking-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Información adicional sobre la reserva..."
                    className="textarea-field-modern"
                    rows={3}
                  />
                </div>

                <div className="modal-actions">
                  <Button type="button" variant="outline" onClick={handleCloseModal} disabled={processing}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={processing}>
                    <Icon name="check" size={18} color="currentColor" />
                    <span>{processing ? 'Creando...' : 'Crear Reserva'}</span>
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
});

MySchedule.displayName = 'MySchedule';

