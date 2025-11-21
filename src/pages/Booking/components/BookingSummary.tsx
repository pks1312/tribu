import React from 'react';
import { Button } from '@/components/common';
import type { BookingData, Service, Professional } from '@/types/booking';
import { formatDate, formatTime, formatCurrency } from '@/utils/helpers';
import './BookingSummary.css';

interface BookingSummaryProps {
  bookingData: BookingData;
  service?: Service;
  professional?: Professional;
  onConfirm: () => void;
  onBack: () => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  bookingData,
  service,
  professional,
  onConfirm,
  onBack
}) => {
  const bookingDate = bookingData.date ? new Date(bookingData.date) : new Date();

  return (
    <div className="booking-summary">
      <h2 className="section-title">Resumen de tu Reserva</h2>
      <div className="summary-card">
        <div className="summary-section">
          <h3 className="summary-label">Servicio</h3>
          <p className="summary-value">{service?.name || 'No seleccionado'}</p>
          {service && (
            <p className="summary-detail">
              Duración: {service.duration} minutos • {formatCurrency(service.price)}
            </p>
          )}
        </div>

        <div className="summary-section">
          <h3 className="summary-label">Profesional</h3>
          <p className="summary-value">{professional?.name || 'No seleccionado'}</p>
        </div>

        <div className="summary-section">
          <h3 className="summary-label">Fecha y Hora</h3>
          <p className="summary-value">{formatDate(bookingDate)}</p>
          <p className="summary-detail">{formatTime(bookingData.time)}</p>
        </div>

        <div className="summary-section">
          <h3 className="summary-label">Datos de Contacto</h3>
          <p className="summary-value">{bookingData.clientName}</p>
          <p className="summary-detail">{bookingData.clientEmail}</p>
          <p className="summary-detail">{bookingData.clientPhone}</p>
        </div>

        {bookingData.notes && (
          <div className="summary-section">
            <h3 className="summary-label">Notas</h3>
            <p className="summary-value">{bookingData.notes}</p>
          </div>
        )}

        {service && (
          <div className="summary-total">
            <div className="total-row">
              <span className="total-label">Total a Pagar</span>
              <span className="total-amount">{formatCurrency(service.price)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={onConfirm} fullWidth>
          Confirmar Reserva
        </Button>
      </div>
    </div>
  );
};

