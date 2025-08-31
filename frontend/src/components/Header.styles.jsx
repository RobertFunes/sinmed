// Header.styles.jsx (extiende tu NavButton actual)
import styled from 'styled-components';
import { Link } from 'react-router-dom';
export const NavBar = styled.div`
  display: flex;
  gap: 24px;
  background:  #F0F0F0;
  padding: 30px 24px;
  align-items: center;
  justify-content: center;
`;
export const LogoLink = styled(Link)`
       /* lo empuja a la derecha */
  display: flex;
  align-items: center;

  img {
    height: 44px;            /* ajusta a gusto */
    width: auto;
  }
`;

export const NavButton = styled.button`
  background: #00adb5;
  color: #ffffff;
  font-size: 1.1em;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(34, 40, 49, 0.05);
  transition: background 0.15s, color 0.15s;
  text-decoration: none;

  &:hover {
    background: #00adb5;
    color: #ffffff;
  }

  /* ----- ESTADOS PERSONALIZADOS ----- */
  &.connected {
    background: #28a745; /* verde Bootstrap */
    color: #ffffff;
    &:hover {
      background: #218838;
    }
  }

  &.disconnected {
    background: #dc3545; /* rojo Bootstrap */
    color: #ffffff;
    &:hover {
      background: #c82333;
    }
  }

  /* tus estilos existentes ↓ */
  &.delete {
    color: #222831;
    &:hover {
      background: #222831;
      color: #ffffff;
    }
  }

  &.edit {
    color: #393e46;
    &:hover {
      background: #393e46;
      color: #ffffff;
    }
  }

  &.agenda {
    color: #eeeeee;
    background: #222831;
    &:hover {
      background: #eeeeee;
      color: #222831;
    }
  }
`;
