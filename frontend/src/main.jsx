import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './pages/App.jsx';
import Login from './pages/Login.jsx';
import Add from './pages/Add.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Link from './pages/Link.jsx';
import Interact from './pages/Pending.jsx';
import Profile from './pages/Profile.jsx';
import Modify from './pages/Modify.jsx';
import AddContract from './pages/AddContract.jsx';
import Contracts from './pages/Contracts.jsx';
import ModifyContract from './pages/ModifyContract.jsx';
import Search from './pages/Search.jsx';
import Calendar from './pages/Calendar.jsx';

export function NotFound() {           // ← agrega "export" y se acabó el drama
  return <h2>Página no encontrada 🚫</h2>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <RequireAuth>
              <App />
            </RequireAuth>
          } 
        />
        <Route
          path="/add"
          element={
            <RequireAuth>
              <Add />
            </RequireAuth>
          }
        />
        <Route
          path="/addContract"
          element={
            <RequireAuth>
              <AddContract />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/link"
          element={
            <RequireAuth>
              <Link />
            </RequireAuth>
          }
        />
        <Route
          path="/pending"
          element={
            <RequireAuth>
              <Interact />
            </RequireAuth>
          }
        />
        <Route
          path="/modify/:id"
          element={
            <RequireAuth>
              <Modify />
            </RequireAuth>
          }
        />
        <Route
          path="/contracts"
          element={
            <RequireAuth>
              <Contracts />
            </RequireAuth>
          }
        />
        <Route
          path="/calendar"
          element={
            <RequireAuth>
              <Calendar />
            </RequireAuth>
          }
        />
        <Route
          path="/polizas/:id/edit"
          element={
            <RequireAuth>
              <ModifyContract />
            </RequireAuth>
          }
        />
        <Route
          path="/search"
          element={
            <RequireAuth>
              <Search />
            </RequireAuth>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
