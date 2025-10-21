""//frontend/src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import SearchForm from '../components/SearchForm';
import Footer from '../components/Footer';
import './Home.css';

const PROMO_KEY = 'pearl_promo_dismissed_until';

const Home: React.FC = () => {
  const promoDurationMs = 48 * 60 * 60 * 1000;
  const [promoVisible, setPromoVisible] = useState<boolean>(true);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(promoDurationMs);

  useEffect(() => {
    const stored = localStorage.getItem(PROMO_KEY);
    if (stored) {
      const until = Number(stored);
      if (!isNaN(until) && Date.now() < until) {
        setPromoVisible(false);
        return;
      }
    }

    const startedAt = Date.now();
    const expiresAt = startedAt + promoDurationMs;
    setTimeLeftMs(Math.max(0, expiresAt - Date.now()));

    const t = setInterval(() => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeftMs(0);
        clearInterval(t);
      } else {
        setTimeLeftMs(diff);
      }
    }, 1000);

    return () => clearInterval(t);
  }, []);

  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const handleDismiss = (remember: boolean) => {
    setPromoVisible(false);
    if (remember) {
      const until = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(PROMO_KEY, String(until));
    }
  };

  const scrollToSearch = () => {
    const el =
      document.querySelector<HTMLElement>('.search-card') ||
      document.querySelector<HTMLElement>('.search-form') ||
      document.querySelector<HTMLElement>('#flight-search');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="page">
      <Navbar />
      <main className="hero">
        <img
          src="/images/fondoHome.png"
          alt="Avión sobre el atardecer"
          className="hero__bg"
          loading="lazy"
        />
        <div className="hero__overlay" aria-hidden="true" />

        {/* CONTENIDO SOBRE LA IMAGEN */}
        <div className="hero__content" role="main" aria-label="Portada principal">
          <div className="hero__text">
            <h1 className="hero__title">¡Bienvenido!</h1>
          </div>

          {promoVisible && (
            <div className="promo p-20" role="region" aria-label="Promoción especial">
              <div className="promo__left">
                <span className="promo__tag">Oferta limitada</span>
                <h3 className="promo__title">Encuentra el vuelo perfecto!</h3>
                <p className="promo__subtitle">
                  15% OFF en rutas seleccionadas — usa el cupón <strong>VUELO15</strong>
                </p>
                <div className="promo__meta" aria-live="polite">
                  Vence en: <strong>{formatTime(timeLeftMs)}</strong>
                </div>
              </div>

              <div className="promo__actions">
                <button
                  className="promo__btn promo__btn--primary"
                  onClick={() => {
                    scrollToSearch();
                  }}
                >
                  Acceder
                </button>

                <button
                  className="promo__btn promo__btn--ghost"
                  onClick={() => {
                    window.location.href = '/ofertas';
                  }}
                >
                  Ver ofertas
                </button>

                <div className="promo__dismiss">
                  <button className="promo__link" onClick={() => handleDismiss(false)}>
                    Recordar luego
                  </button>
                  <button className="promo__link" onClick={() => handleDismiss(true)}>
                    No mostrar de nuevo
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="search-card" role="region" aria-label="Buscador de vuelos">
            <h2 className="search-card__heading">¿A donde quieres ir?</h2>
            <SearchForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
