import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/** Placeholder de Etapa 4: sesión protegida. La consulta de score se agrega en Etapa 5. */
export function ScorePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
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
        <h1>Sesión iniciada</h1>
        <p className="muted">
          Auth OK. La consulta de score se implementa en la siguiente etapa.
        </p>
        {user.rut && (
          <p>
            RUT en token: <strong>{user.rut}</strong>
          </p>
        )}
      </section>
    </main>
  );
}
