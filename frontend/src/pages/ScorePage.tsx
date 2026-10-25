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
    <main className="page">
      <header className="topbar">
        <div>
          <strong>Consulta de Riesgo</strong>
          <span className="muted">
            {' '}
            · {user.role === 'admin' ? 'Administrador' : 'Usuario'}
          </span>
        </div>
        <button type="button" className="linkish" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <section className="card-panel">
        <h1>Score financiero</h1>
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

          <button type="submit" disabled={loading || (!isAdmin && !fixedRut)}>
            {loading ? 'Consultando…' : 'Consultar'}
          </button>
        </form>

        {result && (
          <div className="result" aria-live="polite">
            <p>
              <span className="muted">RUT</span> {result.rut}
            </p>
            <p className="score">{result.score}</p>
            <p className="muted">
              Fecha:{' '}
              {new Date(result.fecha).toLocaleString('es-CL', {
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
