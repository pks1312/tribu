import React from 'react';
import './About.css';

export const About: React.FC = () => {
  return (
    <section id="sobre-nosotros" className="about">
      <div className="about-container">
        <div className="about-content">
          <div className="about-text">
            <span className="about-badge">Compromiso</span>
            <h2 className="section-title">Nosotros</h2>
            <p className="about-description">
              En <strong>La Tribu</strong> nos hacemos responsables del cuidado integral
              masculino a través de un servicio de excelencia y arraigado en las antiguas
              tradiciones, en un ambiente único e inspirado en las clásicas barberías de antaño,
              con una atención de primer nivel más un amplio catálogo de productos con stock permanente.
            </p>
            <p className="about-description">
              Experimenta, descubre y vive junto a nosotros el arte de la barbería clásica.
              Nuestro equipo está compuesto por profesionales altamente calificados que
              entienden la importancia de cada detalle en tu imagen personal.
            </p>
            <div className="about-actions">
              <a href="#servicios" className="about-link">
                Nuestros Servicios
              </a>
              <a href="/booking" className="about-link">
                Reserva tu Hora
              </a>
            </div>
          </div>
          <div className="about-visual">
            <div className="about-card">
              <div className="card-pattern"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
