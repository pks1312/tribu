import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common';
import './CTA.css';

export const CTA: React.FC = () => {
  return (
    <section className="cta">
      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-title">¿Listo para tu Próximo Corte?</h2>
          <p className="cta-description">
            Reserva tu cita ahora y experimenta la diferencia de un servicio profesional
            de primera clase. Nuestro equipo está listo para atenderte.
          </p>
          <Link to="/booking">
            <Button variant="primary" fullWidth={false}>
              Reservar Cita Ahora
            </Button>
          </Link>
        </div>
        <div className="cta-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
        </div>
      </div>
    </section>
  );
};

