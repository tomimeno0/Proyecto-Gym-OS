import { useId } from 'react';
import { LoaderCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Button({ children, variant = '', busy, className = '', ...props }) {
  return (
    <button className={`btn ${variant} ${className}`} {...props} disabled={props.disabled || busy}>
      {busy && <LoaderCircle size={17} className="spin" />}
      {children}
    </button>
  );
}
export function Field({ label, hint, children, ...props }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children ? (
        children
      ) : (
        <input id={id} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      )}{' '}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Feedback({ error, success }) {
  return (
    <>
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={20} />
          <div>
            {error.message || String(error)}
            {Array.isArray(error.details) && (
              <ul>
                {error.details.map((d, i) => (
                  <li key={i}>
                    {d.field}: {d.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {success && (
        <div className="notice success" role="status">
          <CheckCircle2 size={20} />
          {success}
        </div>
      )}
    </>
  );
}
