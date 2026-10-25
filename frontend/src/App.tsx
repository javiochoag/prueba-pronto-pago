import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ScorePage } from './pages/ScorePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/score"
            element={
              <ProtectedRoute>
                <ScorePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/score" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
