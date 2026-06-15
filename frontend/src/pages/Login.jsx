// src/components/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 import de navegación
import { FaEye, FaLock, FaShieldAlt, FaUser } from 'react-icons/fa';
import { url } from '../helpers/url';
import {
  Container,
  Form,
  Title,
  BrandMark,
  Header,
  Field,
  Label,
  Input,
  InputShell,
  FieldIcon,
  RevealButton,
  Button,
  ErrorText,
} from './Login.styles';

export default function Login() {
  const [usuario, setUsuario]     = useState('');
  const [contrasena, setPassword] = useState('');
  const [pin, setPin]             = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // 👈 hook para redirigir

  const revealPassword = () => setShowPassword(true);
  const hidePassword = () => setShowPassword(false);

  // 🔍 Al montar, checamos si ya estamos auth
  useEffect(() => {
    fetch(`${url}/api/status`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          // Si ya tiene cookie válida, lo llevamos al listado privado
          navigate('/profiles', { replace: true });
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

      // 🚀 Éxito: redirigimos al listado privado
      navigate('/profiles', { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Header>
          <BrandMark>
            <FaShieldAlt />
          </BrandMark>
          <Title>SINMED</Title>
        </Header>

        <Field>
          <Label>Usuario</Label>
          <InputShell>
            <FieldIcon>
              <FaUser />
            </FieldIcon>
            <Input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              placeholder="Tu usuario"
            />
          </InputShell>
        </Field>

        <Field>
          <Label>Contraseña</Label>
          <InputShell>
            <FieldIcon>
              <FaLock />
            </FieldIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={contrasena}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tu contraseña"
              $hasReveal
            />
            <RevealButton
              type="button"
              aria-label="Mantener presionado para revelar contraseña"
              title="Mantener presionado para revelar"
              onMouseDown={revealPassword}
              onMouseUp={hidePassword}
              onMouseLeave={hidePassword}
              onTouchStart={revealPassword}
              onTouchEnd={hidePassword}
              onTouchCancel={hidePassword}
            >
              <FaEye />
            </RevealButton>
          </InputShell>
        </Field>

        <Field>
          <Label>PIN</Label>
          <InputShell>
            <FieldIcon>
              <FaShieldAlt />
            </FieldIcon>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              placeholder="1234"
              maxLength={6}
            />
          </InputShell>
        </Field>

        {error && <ErrorText>❌ {error}</ErrorText>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Cargando…' : 'Entrar 🔑'}
        </Button>
      </Form>
    </Container>
  );
}
