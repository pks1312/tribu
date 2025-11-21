import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common';
import './Hero.css';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Bienvenidos a',
    titleAccent: 'La Tribu',
    subtitle: 'Salón y Barbería',
    description: 'Vive la excelencia y tradición de la barbería clásica con una atención enfocada a satisfacer 100% a nuestros clientes.',
    cta: 'Reserva tu Cita'
  },
  {
    id: 2,
    title: 'Estilo y Elegancia',
    titleAccent: 'en Cada Corte',
    subtitle: 'Profesionales Expertos',
    description: 'Transformamos tu look con técnicas modernas y atención personalizada. Experimenta el arte de la barbería clásica.',
    cta: 'Ver Servicios'
  },
  {
    id: 3,
    title: 'Tu Imagen',
    titleAccent: 'Nuestra Pasión',
    subtitle: 'Desde 2020',
    description: 'Comprometidos con la calidad y la excelencia en cada detalle. Tu satisfacción es nuestra prioridad.',
    cta: 'Conócenos'
  }
];

export const Hero: React.FC = memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  return (
    <section className="hero">
      <div className="hero-slider">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''} ${index < currentSlide ? 'prev' : index > currentSlide ? 'next' : ''}`}
          >
            <div className="hero-container">
              <div className="hero-content">
                <p className="hero-subtitle">{slide.subtitle}</p>
                <h1 className="hero-title">
                  {slide.title}
                  <span className="hero-title-accent"> {slide.titleAccent}</span>
                </h1>
                <p className="hero-description">{slide.description}</p>
                <div className="hero-cta">
                  <Link to="/booking">
                    <Button variant="primary" fullWidth={false}>
                      {slide.cta}
                    </Button>
                  </Link>
                  <a href="#servicios" className="hero-link">
                    Ver Más
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-indicators">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="hero-scroll">
        <div className="scroll-indicator"></div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';
