import React from 'react';
import type { Service } from '@/types/booking';
import { formatCurrency } from '@/utils/helpers';
import './ServiceSelection.css';

interface ServiceSelectionProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({ services, onSelect }) => {
  return (
    <div className="service-selection">
      <h2 className="section-title">Selecciona un Servicio</h2>
      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-card"
            onClick={() => onSelect(service)}
          >
            <div className="service-header">
              <h3 className="service-name">{service.name}</h3>
              <span className="service-price">{formatCurrency(service.price)}</span>
            </div>
            {service.description && (
              <p className="service-description">{service.description}</p>
            )}
            <div className="service-duration">
              <span>{service.duration} minutos</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

