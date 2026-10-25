import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { ApiError, fetchScore } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { ScoreResponse } from '../types/auth';

export function ScorePage() {
  const { user, token, logout } = useAuth();
  const [adminRut, setAdminRut] = useState('');
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const authToken = token;
  const isAdmin = user.role === 'admin';
  const fixedRut = user.rut ?? '';

  async function consult(rut: string) {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await fetchScore(rut, authToken);
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message);
      } else {
        setError('No se pudo obtener el score');
      }
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (isAdmin) {
      void consult(adminRut.trim());
    } else {
      void consult(fixedRut);
    }
  }

  return (
    <main className="shell shell--app">
      <header className="topbar">
        <div>
          <div className="topbar-brand">Consulta de Riesgo</div>
          <span className="topbar-meta">
            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
          </span>
        </div>
        <button type="button" className="btn-text" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <section className="panel panel--app">
        <h1 className="section-title">Score financiero</h1>
        <p className="section-lead">
          {isAdmin
            ? 'Ingresa un RUT para obtener su score determinístico.'
            : 'Consulta el score asociado a tu RUT.'}
        </p>

        <form className="form" onSubmit={onSubmit}>
          {isAdmin ? (
            <label>
              RUT a consultar
              <input
                value={adminRut}
                onChange={(e) => setAdminRut(e.target.value)}
                placeholder="12.345.678-9"
                required
              />
            </label>
          ) : (
            <div className="fixed-rut">
              <span className="label">Tu RUT</span>
              <p className="rut-value">{fixedRut}</p>
            </div>
          )}

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button
            className="btn"
            type="submit"
            disabled={loading || (!isAdmin && !fixedRut)}
          >
            {loading ? 'Consultando…' : 'Consultar'}
          </button>
        </form>

        {result && (
          <div className="result" aria-live="polite">
            <p className="result-rut">
              RUT <strong>{result.rut}</strong>
            </p>
            <p className="score">{result.score}</p>
            <p className="result-date">
              Consulta del{' '}
              {new Date(result.fecha).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}{' '}
              a las{' '}
              {new Date(result.fecha).toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC',
              })}{' '}
              UTC
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
