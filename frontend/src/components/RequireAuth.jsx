// src/components/RequireAuth.jsx
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { url } from '../helpers/url';
import { apiFetch } from '../helpers/apiFetch';

export default function RequireAuth({ children }) {
  const [auth, setAuth] = useState(null);  // null = cargando, true/false = estado
  const location = useLocation();

  useEffect(() => {
    apiFetch(`${url}/api/status`, {
      credentials: 'include'           // para enviar la cookie de sesión
    })
      .then(res => res.json())
      .then(data => setAuth(data.ok))  // data.ok = true/false
      .catch(() => setAuth(false));    // on error, asumimos no auth
  }, []);

  if (auth === null) {
    return <p>⏳ Verificando sesión...</p>;
  }

  if (!auth) {
    // guardamos la ruta actual en state, opcional
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
