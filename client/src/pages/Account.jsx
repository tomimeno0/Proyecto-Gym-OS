import { Link, Navigate } from 'react-router-dom';
import { api, useAuth, useAction } from '../lib';
import { Button, Feedback } from '../components/ui';
import { Brand } from './Landing';

export default function Account() {
  const { user, setUser, loading, error, refresh } = useAuth();
  const action = useAction();
  if (loading)
    return (
      <div className="loading" role="status">
        Comprobando tu sesión…
      </div>
    );
  if (error)
    return (
      <main className="connection-error">
        <Feedback error={error} />
        <Button onClick={refresh}>Reintentar conexión</Button>
        <Link to="/">Volver al inicio</Link>
      </main>
    );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="landing">
      <nav className="public-nav" aria-label="Principal">
        <Brand />
        <Link to="/">Volver al inicio</Link>
      </nav>
      <main className="account-content">
        <p className="eyebrow">GYM—OS / MI CUENTA</p>
        <h1>Hola, {user.nombre}.</h1>
        <p className="muted">
          Tu sesión está iniciada. Esta entrega incluye el acceso y la gestión de la sesión.
        </p>
        <dl className="account-details">
          <dt>Nombre</dt>
          <dd>
            {user.nombre} {user.apellido}
          </dd>
          <dt>Correo</dt>
          <dd>{user.email}</dd>
          <dt>Rol</dt>
          <dd>{user.roles.join(', ')}</dd>
          <dt>Estado</dt>
          <dd>{user.estado}</dd>
        </dl>
        <Feedback {...action} />
        <Button
          busy={action.busy}
          onClick={() =>
            action.run(async () => {
              try {
                await api('/auth/logout', {});
              } catch (e) {
                if (e.status !== 401) throw e;
              }
              setUser(null);
            })
          }
        >
          Cerrar sesión
        </Button>
      </main>
    </div>
  );
}
