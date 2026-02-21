// src/components/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 import de navegación
import { url } from '../helpers/url';
import {
  Container,
  Form,
  Title,
  Field,
  Label,
  Input,
  Button,
  ErrorText,
} from './Login.styles';

export default function Login() {
  const [usuario, setUsuario]     = useState('');
  const [contrasena, setPassword] = useState('');
  const [pin, setPin]             = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate(); // 👈 hook para redirigir

  // 🔍 Al montar, checamos si ya estamos auth
  useEffect(() => {
    fetch(`${url}/api/status`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          // Si ya tiene cookie válida, lo llevamos al root
          navigate('/', { replace: true });
        }
      })
      .catch(() => {
        // Si hay error, no hacemos nada y dejamos que muestre el login
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${url}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 👈 enviamos cookie
        body: JSON.stringify({
          username: usuario,
          password: contrasena,
          usuario,
          contrasena,
          pin,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en login');

      // 🚀 Éxito: redirigimos al root
      navigate('/', { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>Iniciar Sesión 🔒</Title>

        <Field>
          <Label>Usuario</Label>
          <Input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            placeholder="Tu usuario"
          />
        </Field>

        <Field>
          <Label>Contraseña</Label>
          <Input
            type="password"
            value={contrasena}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Tu contraseña"
          />
        </Field>

        <Field>
          <Label>PIN</Label>
          <Input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            placeholder="1234"
            maxLength={6}
          />
        </Field>

        {error && <ErrorText>❌ {error}</ErrorText>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Cargando…' : 'Entrar 🔑'}
        </Button>
      </Form>
    </Container>
  );
}
