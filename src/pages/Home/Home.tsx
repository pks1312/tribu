import React, { Suspense, lazy, memo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Home.css';

const Hero = lazy(() => import('./sections/Hero').then(module => ({ default: module.Hero })));
const Services = lazy(() => import('./sections/Services').then(module => ({ default: module.Services })));
const About = lazy(() => import('./sections/About').then(module => ({ default: module.About })));
const Testimonials = lazy(() => import('./sections/Testimonials').then(module => ({ default: module.Testimonials })));
const Gallery = lazy(() => import('./sections/Gallery').then(module => ({ default: module.Gallery })));
const CTA = lazy(() => import('./sections/CTA').then(module => ({ default: module.CTA })));

const SectionLoader = () => (
  <div style={{ 
    minHeight: '200px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: 'var(--text-secondary)'
  }}>
    Cargando...
  </div>
);

export const Home: React.FC = memo(() => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        const timeoutId = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [location.hash]);

  return (
    <div className="home">
      <Suspense fallback={<SectionLoader />}>
        <Hero />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <About />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <Services />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <Gallery />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <CTA />
      </Suspense>
    </div>
  );
});

Home.displayName = 'Home';
