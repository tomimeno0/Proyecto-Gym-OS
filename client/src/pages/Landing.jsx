import { Link } from 'react-router-dom';
import { ArrowUpRight, Activity, Dumbbell, Utensils, ChartNoAxesCombined } from 'lucide-react';
import { useAuth } from '../lib';

export function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <Activity size={22} />
      </span>
      GYM<span className="brand-light">—OS</span>
    </Link>
  );
}
export function Landing({ about = false }) {
  const { user } = useAuth();
  return (
    <div className="landing">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <nav className="public-nav" aria-label="Principal">
        <Brand />
        <div className="actions">
          <Link to="/nosotros">El proyecto</Link>
          <Link className="btn" to={user ? '/cuenta' : '/login'}>
            {user ? 'Abrir mi espacio' : 'Iniciar sesión'}
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </nav>
      <main id="main-content">
        <section className="hero">
          <div>
            <span className="eyebrow">ENTRENÁ CON INTENCIÓN</span>
            <h1>
              {about ? (
                'Un lugar para ver hasta dónde llegás.'
              ) : (
                <>
                  Cada esfuerzo
                  <br />
                  cuenta.
                  <br />
                  <em>Hacelo visible.</em>
                </>
              )}
            </h1>
            <p>
              {about
                ? 'GYM-OS reúne tus rutinas, alimentación y mediciones para que puedas registrar tu recorrido y tomar decisiones con tus propios datos.'
                : 'Tu entrenamiento, tu alimentación y tu progreso. Todo en un espacio pensado para que puedas concentrarte en avanzar.'}
            </p>
            <Link to={user ? '/cuenta' : '/registro'} className="btn lime">
              {user ? 'Ver mi cuenta' : 'Crear mi cuenta'}
              <ArrowUpRight size={19} />
            </Link>
            <span className="hero-note">Tu ritmo. Tus objetivos. Tus datos.</span>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-word">
              GO
              <br />
              FURTHER<span>UN DÍA A LA VEZ / GYM—OS</span>
            </div>
            <div className="art-bottom">
              <Activity />
              <span>
                LA CONSTANCIA
                <br />
                ES TU MEJOR MARCA.
              </span>
              <span>↗</span>
            </div>
          </div>
        </section>
        <section className="feature-grid">
          {[
            [
              Dumbbell,
              '01 / ENTRENAMIENTO',
              'Un plan que podés seguir.',
              'Creá rutinas por día y registrá las series, repeticiones y cargas de cada sesión.',
            ],
            [
              Utensils,
              '02 / NUTRICIÓN',
              'Alimentación, en contexto.',
              'Organizá tus comidas y compará tus registros con las metas de tu plan.',
            ],
            [
              ChartNoAxesCombined,
              '03 / PROGRESO',
              'Más que un número.',
              'Conservá tu historial, observá los cambios y marcá tus objetivos cumplidos.',
            ],
          ].map(([Icon, k, t, d]) => (
            <article key={k}>
              <Icon />
              <p className="eyebrow">{k}</p>
              <h2>{t}</h2>
              <p>{d}</p>
            </article>
          ))}
        </section>
        <p className="scope-note">
          Entrega actual: inicio, registro e inicio de sesión. Las secciones de entrenamiento,
          nutrición y progreso describen el proyecto completo y todavía no están disponibles en esta
          entrega.
        </p>
        <p className="disclaimer">
          GYM-OS es una herramienta de organización y registro. No sustituye la orientación de
          profesionales de salud, nutrición o entrenamiento.
        </p>
      </main>
      <footer>
        <Brand />
        <span>Hecho para el proceso, no solo para el resultado.</span>
      </footer>
    </div>
  );
}
