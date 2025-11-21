import React from 'react';
import { Button } from '@/components/common';
import type { Professional } from '@/types/booking';
import './ProfessionalSelection.css';

interface ProfessionalSelectionProps {
  professionals: Professional[];
  onSelect: (professional: Professional) => void;
  onBack: () => void;
}

export const ProfessionalSelection: React.FC<ProfessionalSelectionProps> = ({
  professionals,
  onSelect,
  onBack
}) => {
  return (
    <div className="professional-selection">
      <h2 className="section-title">Selecciona un Profesional</h2>
      <div className="professionals-grid">
        {professionals.map((professional) => (
          <div
            key={professional.id}
            className="professional-card"
            onClick={() => onSelect(professional)}
          >
            <div className="professional-avatar">
              {professional.photoURL ? (
                <img src={professional.photoURL} alt={professional.displayName || professional.name || professional.email || 'Profesional'} />
              ) : (
                <span>{(professional.displayName || professional.name || professional.email || 'P').charAt(0)}</span>
              )}
            </div>
            <h3 className="professional-name">{professional.displayName || professional.name || professional.email}</h3>
            {professional.specialties && professional.specialties.length > 0 && (
              <div className="professional-specialties">
                {professional.specialties.map((specialty, index) => (
                  <span key={index} className="specialty-tag">
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="navigation-buttons">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
      </div>
    </div>
  );
};

