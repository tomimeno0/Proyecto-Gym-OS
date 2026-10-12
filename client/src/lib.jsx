import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export async function api(path, body) {
  let response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      method: body === undefined ? 'GET' : 'POST',
      ...(body === undefined
        ? {}
        : {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }),
    });
  } catch {
    throw new Error('No pudimos conectarnos al servidor. Intentá nuevamente.');
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('El servidor no está disponible. Intentá nuevamente.');
  }
  if (!response.ok) {
    const error = new Error(data.message || 'No se pudo completar la solicitud.');
    error.details = data.errors;
    error.status = response.status;
    if (response.status === 401 && !path.startsWith('/auth/'))
      window.dispatchEvent(new Event('session-expired'));
    throw error;
  }
  return data;
}

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUser((await api('/users/me')).usuario);
    } catch (e) {
      setUser(null);
      if (e.status !== 401) setError(e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    const expire = () => setUser(null);
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, [refresh]);
  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const lock = useRef(false);
  async function run(fn, message = '') {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setSuccess('');
    try {
      const value = await fn();
      setSuccess(message);
      return value;
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  return { busy, error, success, run };
}
