import React from 'react';
import { Button } from '@/components/common';
import { getAvailableDates, formatDate } from '@/utils/helpers';
import './DateSelection.css';

interface DateSelectionProps {
  selectedDate?: Date;
  onSelect: (date: Date) => void;
  onBack: () => void;
}

export const DateSelection: React.FC<DateSelectionProps> = ({ selectedDate, onSelect, onBack }) => {
  const availableDates = getAvailableDates(30);

  return (
    <div className="date-selection">
      <h2 className="section-title">Selecciona una Fecha</h2>
      <div className="dates-grid">
        {availableDates.map((date) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <button
              key={date.toISOString()}
              className={`date-card ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => onSelect(date)}
            >
              <div className="date-day">{date.getDate()}</div>
              <div className="date-month">
                {date.toLocaleDateString('es-CL', { month: 'short' })}
              </div>
              <div className="date-weekday">
                {date.toLocaleDateString('es-CL', { weekday: 'short' })}
              </div>
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <div className="selected-date-info">
          <p>Fecha seleccionada: <strong>{formatDate(selectedDate)}</strong></p>
        </div>
      )}
      <div className="navigation-buttons">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
      </div>
    </div>
  );
};

