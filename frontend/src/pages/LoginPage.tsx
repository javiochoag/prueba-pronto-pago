import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/score" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/score', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          const wait =
            err.retryAfterSeconds != null
              ? ` Reintenta en ~${Math.ceil(err.retryAfterSeconds / 60)} min.`
              : '';
          setError(`${err.message}.${wait}`);
        } else {
          setError(err.message);
        }
      } else {
        setError('No se pudo iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell shell--login">
      <div className="brand-block">
        <p className="brand-mark">Fintech · Riesgo</p>
        <h1 className="brand-title">Consulta de Riesgo Financiero</h1>
        <p className="brand-lead">
          Evalúa el score crediticio asociado a un RUT con acceso según tu rol.
        </p>
      </div>

      <section className="panel" aria-label="Inicio de sesión">
        <form className="form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
}
