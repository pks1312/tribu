import React from 'react';
import { Button } from '@/components/common';
import { useSchedule } from '@/hooks/useSchedule';
import './TimeSelection.css';

interface TimeSelectionProps {
  professionalId?: string;
  selectedDate: Date;
  selectedTime?: string;
  onSelect: (time: string) => void;
  onBack: () => void;
}

export const TimeSelection: React.FC<TimeSelectionProps> = ({
  professionalId,
  selectedDate,
  selectedTime,
  onSelect,
  onBack
}) => {
  const { availableSlots, loading } = useSchedule(professionalId, selectedDate);

  if (!professionalId) {
    return (
      <div className="time-selection">
        <div className="no-professional-message">
          <p>Por favor, selecciona un profesional primero.</p>
        </div>
        <div className="navigation-buttons">
          <Button variant="outline" onClick={onBack}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="time-selection">
      <h2 className="section-title">Selecciona una Hora</h2>
      
      {loading ? (
        <div className="time-loading">
          <p>Cargando horarios disponibles...</p>
        </div>
      ) : (
        <>
          <div className="time-slots-grid">
            {availableSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  className={`time-slot ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelect(time)}
                >
                  {time}
                </button>
              );
            })}
          </div>
          
          {availableSlots.length === 0 && (
            <div className="no-slots-message">
              <p>No hay horarios disponibles para esta fecha. Por favor, selecciona otra fecha.</p>
            </div>
          )}
        </>
      )}

      <div className="navigation-buttons">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
      </div>
    </div>
  );
};
