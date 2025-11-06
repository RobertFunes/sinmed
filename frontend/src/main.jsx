import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import './index.css';
import App from './pages/App.jsx';
import Login from './pages/Login.jsx';
import Add from './pages/Add.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Link from './pages/Link.jsx';
import Interact from './pages/Pending.jsx';
import Profile from './pages/Profile.jsx';
import Modify from './pages/Modify.jsx';
import ModifyContract from './pages/ModifyContract.jsx';
import Search from './pages/Search.jsx';
import Calendar from './pages/Calendar.jsx';
import NewAppointment from './pages/NewAppointment.jsx';
import ModifyAppointment from './pages/ModifyAppointment.jsx';

export function NotFound() {           // ← agrega "export" y se acabó el drama
  return <h2>Página no encontrada 🚫</h2>;
}

const ProtectedOutlet = () => (
  <RequireAuth>
    <Outlet />
  </RequireAuth>
);

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedOutlet />,
    children: [
      { path: '/', element: <App /> },
      { path: '/add', element: <Add /> },
      { path: '/profile/:id', element: <Profile /> },
      { path: '/link', element: <Link /> },
      { path: '/pending', element: <Interact /> },
      { path: '/modify/:id', element: <Modify /> },
      { path: '/calendar', element: <Calendar /> },
      { path: '/calendar/new', element: <NewAppointment /> },
      { path: '/calendar/modify', element: <ModifyAppointment /> },
      { path: '/polizas/:id/edit', element: <ModifyContract /> },
      { path: '/search', element: <Search /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
