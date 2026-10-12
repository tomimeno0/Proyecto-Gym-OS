import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { api, useAuth, useAction } from '../lib';
import { Button, Field, Feedback } from '../components/ui';
import { Brand } from './Landing';

export default function Auth({ mode }) {
  const { user, setUser, loading, error, refresh } = useAuth();
  const action = useAction();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [registered, setRegistered] = useState(false);
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
  if (user) return <Navigate to="/cuenta" replace />;
  const registering = mode === 'registro';
  const field = (key) => ({
    name: key,
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });
  function submit(e) {
    e.preventDefault();
    action.run(
      async () => {
        if (registering && form.password !== form.confirm)
          throw new Error('Las contraseñas no coinciden.');
        const data = await api(
          registering ? '/auth/register' : '/auth/login',
          registering
            ? {
                nombre: form.nombre,
                apellido: form.apellido,
                email: form.email,
                password: form.password,
              }
            : { email: form.email, password: form.password },
        );
        setForm((current) => ({ ...current, password: '', confirm: '' }));
        if (registering) setRegistered(true);
        else setUser(data.usuario);
      },
      registering ? 'Cuenta creada. Ya podés iniciar sesión.' : '',
    );
  }
  return (
    <div className="auth-layout">
      <aside>
        <Brand />
        <div>
          <p className="eyebrow">MENOS DESORDEN. MÁS CONSTANCIA.</p>
          <h2>
            Tu mejor versión
            <br />
            se construye
            <br />
            <em>día a día.</em>
          </h2>
          <div className="auth-lines" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
        <p>ENTRENAMIENTO + NUTRICIÓN + PROGRESO</p>
      </aside>
      <main>
        <Link className="back-link" to="/">
          ← Volver al inicio
        </Link>
        <div className="auth-form">
          <p className="eyebrow">GYM—OS / TU ESPACIO PERSONAL</p>
          <h1>{registering ? 'Tu próximo paso empieza acá.' : 'Volvé a tu ritmo.'}</h1>
          <p className="muted">
            {registering
              ? 'Creá tu cuenta para acceder al proyecto.'
              : 'Ingresá con tu correo y contraseña.'}
          </p>
          {registered ? (
            <>
              <Feedback success={action.success} />
              <Link className="btn full" to="/login">
                Iniciar sesión
                <ArrowUpRight size={18} />
              </Link>
            </>
          ) : (
            <form onSubmit={submit} aria-busy={action.busy}>
              <fieldset disabled={action.busy}>
                {registering && (
                  <div className="form-grid">
                    <Field
                      label="Nombre"
                      autoComplete="given-name"
                      required
                      minLength={2}
                      maxLength={100}
                      {...field('nombre')}
                    />
                    <Field
                      label="Apellido"
                      autoComplete="family-name"
                      maxLength={100}
                      {...field('apellido')}
                    />
                  </div>
                )}
                <Field
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={150}
                  {...field('email')}
                />
                <Field
                  label="Contraseña"
                  type="password"
                  autoComplete={registering ? 'new-password' : 'current-password'}
                  required
                  minLength={registering ? 10 : 1}
                  maxLength={128}
                  hint={registering ? 'Entre 10 y 128 caracteres.' : undefined}
                  {...field('password')}
                />
                {registering && (
                  <Field
                    label="Repetir contraseña"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={10}
                    maxLength={128}
                    {...field('confirm')}
                  />
                )}
                <Feedback {...action} />
                <Button busy={action.busy} className="full">
                  {registering ? 'Crear cuenta' : 'Iniciar sesión'}
                  <ArrowUpRight size={18} />
                </Button>
              </fieldset>
            </form>
          )}
          <p>
            {registering ? (
              <Link to="/login">Volver a iniciar sesión</Link>
            ) : (
              <>
                ¿Todavía no tenés cuenta? <Link to="/registro">Registrate</Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
