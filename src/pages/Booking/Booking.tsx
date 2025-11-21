import React, { useState, useCallback, memo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BookingData, Professional, Service } from '@/types/booking';
import { useBookings } from '@/hooks/useBookings';
import { useServices } from '@/hooks/useServices';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceSelection } from './components/ServiceSelection';
import { ProfessionalSelection } from './components/ProfessionalSelection';
import { DateSelection } from './components/DateSelection';
import { TimeSelection } from './components/TimeSelection';
import { ClientForm } from './components/ClientForm';
import { BookingSummary } from './components/BookingSummary';
import './Booking.css';

export const Booking: React.FC = memo(() => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});
  const { user, userProfile } = useAuth();

  const { createBooking } = useBookings();
  const { services: availableServices } = useServices();
  const { professionals } = useProfessionals();

  const isAuthenticated = !!user;
  const totalSteps = isAuthenticated ? 5 : 6;

  // Leer parámetros de URL y pre-seleccionar servicio y profesional
  useEffect(() => {
    const serviceId = searchParams.get('service');
    const professionalId = searchParams.get('professional');

    if (serviceId && availableServices.length > 0) {
      const service = availableServices.find(s => s.id === serviceId);
      if (service) {
        setBookingData(prev => ({ ...prev, serviceId: service.id }));
        if (professionalId && professionals.length > 0) {
          const professional = professionals.find(p => p.id === professionalId);
          if (professional) {
            setBookingData(prev => ({ ...prev, professionalId: professional.id }));
            setCurrentStep(3); // Ir directamente a selección de fecha
          } else {
            setCurrentStep(2); // Ir a selección de profesional
          }
        } else {
          setCurrentStep(2); // Ir a selección de profesional
        }
      }
    } else if (professionalId && professionals.length > 0) {
      const professional = professionals.find(p => p.id === professionalId);
      if (professional) {
        setBookingData(prev => ({ ...prev, professionalId: professional.id }));
        setCurrentStep(1); // Empezar en selección de servicio
      }
    }
  }, [searchParams, availableServices, professionals]);

  useEffect(() => {
    if (isAuthenticated && userProfile && currentStep === 4) {
      setBookingData(prev => ({
        ...prev,
        clientName: userProfile.displayName || user?.displayName || user?.email?.split('@')[0] || '',
        clientEmail: userProfile.email || user?.email || '',
        clientPhone: userProfile.phone || ''
      }));
    }
  }, [isAuthenticated, userProfile, user, currentStep]);

  const handleServiceSelect = useCallback((service: Service) => {
    setBookingData(prev => ({ ...prev, serviceId: service.id }));
    setCurrentStep(2);
  }, []);

  const handleProfessionalSelect = useCallback((professional: Professional) => {
    setBookingData(prev => ({ ...prev, professionalId: professional.id }));
    setCurrentStep(3);
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    setBookingData(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
    setCurrentStep(4);
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    setBookingData(prev => ({ ...prev, time }));
    
    if (isAuthenticated && userProfile) {
      setBookingData(prev => ({
        ...prev,
        time,
        clientName: userProfile.displayName || user?.displayName || user?.email?.split('@')[0] || '',
        clientEmail: userProfile.email || user?.email || '',
        clientPhone: userProfile.phone || ''
      }));
      setCurrentStep(5);
    } else {
      setCurrentStep(5);
    }
  }, [isAuthenticated, userProfile, user]);

  const servicesToShow = availableServices.length > 0 ? availableServices : [
    { id: '1', name: 'Corte de Cabello', duration: 30, price: 15000, description: 'Corte moderno y profesional' },
    { id: '2', name: 'Corte + Barba', duration: 45, price: 20000, description: 'Corte completo con arreglo de barba' },
    { id: '3', name: 'Afeitado Clásico', duration: 25, price: 12000, description: 'Afeitado tradicional con navaja' },
    { id: '4', name: 'Tratamiento Capilar', duration: 40, price: 18000, description: 'Hidratación y cuidado del cabello' },
  ];

  const professionalsToShow = professionals.length > 0 ? professionals : [
    { id: '1', name: 'Angelo Cuadra', displayName: 'Angelo Cuadra', email: 'angelo@example.com', specialties: ['Cortes Modernos', 'Barba', 'Afeitado'], active: true },
    { id: '2', name: 'Profesional 2', displayName: 'Profesional 2', email: 'prof2@example.com', specialties: ['Cortes Clásicos', 'Tratamientos'], active: true },
  ];

  const handleClientSubmit = useCallback((clientData: { name: string; email: string; phone: string; notes?: string }) => {
    setBookingData(prev => ({ ...prev, ...clientData }));
    setCurrentStep(6);
  }, []);

  const handleConfirmBooking = useCallback(async () => {
    try {
      if (bookingData.serviceId && bookingData.professionalId && bookingData.date && bookingData.time && 
          bookingData.clientName && bookingData.clientEmail && bookingData.clientPhone) {
        const bookingId = await createBooking(bookingData as BookingData, user?.uid);
        
        const selectedService = servicesToShow.find(s => s.id === bookingData.serviceId);
        const selectedProfessional = professionalsToShow.find(p => p.id === bookingData.professionalId);
        
        if (selectedService && selectedProfessional) {
          const { emailService } = await import('@/services/notifications/emailService');
          const { whatsappService } = await import('@/services/notifications/whatsappService');
          const { formatDate } = await import('@/utils/helpers');
          
          const bookingDate = new Date(bookingData.date + 'T00:00:00');
          const formattedDate = formatDate(bookingDate);
          
          try {
            await emailService.sendBookingConfirmation({
              email: bookingData.clientEmail,
              clientName: bookingData.clientName,
              serviceName: selectedService.name,
              professionalName: selectedProfessional.displayName || selectedProfessional.name || selectedProfessional.email,
              date: formattedDate,
              time: bookingData.time,
              bookingId
            });
          } catch (emailError) {
            console.error('Error al enviar email:', emailError);
          }
          
          try {
            const whatsappLink = whatsappService.getWhatsAppLink(
              bookingData.clientPhone,
              `Hola ${bookingData.clientName}, tu reserva en La Tribu ha sido confirmada:\n\nServicio: ${selectedService.name}\nProfesional: ${selectedProfessional.displayName || selectedProfessional.name || selectedProfessional.email}\nFecha: ${formattedDate}\nHora: ${bookingData.time}\n\nID: ${bookingId}\n\nTe esperamos!`
            );
            window.open(whatsappLink, '_blank');
          } catch (whatsappError) {
            console.error('Error al enviar WhatsApp:', whatsappError);
          }
        }
        
        alert(`¡Reserva confirmada exitosamente! ID: ${bookingId}\n\nSe ha enviado un email de confirmación y se abrirá WhatsApp para confirmar.`);
        setCurrentStep(1);
        setBookingData({});
      } else {
        alert('Por favor, completa todos los campos requeridos.');
      }
    } catch (error: any) {
      console.error('Error al confirmar reserva:', error);
      alert(error.message || 'Error al confirmar la reserva. Por favor, intenta nuevamente.');
    }
  }, [bookingData, createBooking, servicesToShow, professionalsToShow, user]);

  const selectedService = servicesToShow.find(s => s.id === bookingData.serviceId);
  const selectedProfessional = professionalsToShow.find(p => p.id === bookingData.professionalId);

  const getStepLabel = (step: number) => {
    if (isAuthenticated) {
      switch (step) {
        case 1: return 'Servicio';
        case 2: return 'Barbero';
        case 3: return 'Fecha';
        case 4: return 'Hora';
        case 5: return 'Confirmar';
        default: return '';
      }
    } else {
      switch (step) {
        case 1: return 'Servicio';
        case 2: return 'Barbero';
        case 3: return 'Fecha';
        case 4: return 'Hora';
        case 5: return 'Datos';
        case 6: return 'Confirmar';
        default: return '';
      }
    }
  };

  const getBackStep = () => {
    if (isAuthenticated) {
      if (currentStep === 5) return 4;
    } else {
      if (currentStep === 6) return 5;
      if (currentStep === 5) return 4;
    }
    return currentStep - 1;
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1 className="booking-title">Reserva tu Cita</h1>
        <p className="booking-subtitle">Sistema de agendamiento profesional</p>
        {isAuthenticated && (
          <p className="booking-user-info">
            Reservando como: <strong>{userProfile?.displayName || user?.email}</strong>
          </p>
        )}
      </div>

      <div className="booking-steps">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`booking-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">{getStepLabel(step)}</div>
          </div>
        ))}
      </div>

      <div className="booking-content">
        {currentStep === 1 && (
          <ServiceSelection
            services={servicesToShow as Service[]}
            onSelect={handleServiceSelect}
          />
        )}

        {currentStep === 2 && (
          <ProfessionalSelection
            professionals={professionalsToShow}
            onSelect={handleProfessionalSelect}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <DateSelection
            selectedDate={bookingData.date ? new Date(bookingData.date) : undefined}
            onSelect={handleDateSelect}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <TimeSelection
            professionalId={bookingData.professionalId}
            selectedDate={bookingData.date ? new Date(bookingData.date) : new Date()}
            selectedTime={bookingData.time}
            onSelect={handleTimeSelect}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {!isAuthenticated && currentStep === 5 && (
          <ClientForm
            onSubmit={handleClientSubmit}
            onBack={() => setCurrentStep(4)}
          />
        )}

        {(isAuthenticated ? currentStep === 5 : currentStep === 6) && (
          <BookingSummary
            bookingData={bookingData as BookingData}
            service={selectedService}
            professional={selectedProfessional}
            onConfirm={handleConfirmBooking}
            onBack={() => setCurrentStep(getBackStep())}
          />
        )}
      </div>
    </div>
  );
});

Booking.displayName = 'Booking';
