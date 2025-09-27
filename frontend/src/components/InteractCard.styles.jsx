// src/components/InteractCard.styles.jsx
import styled, { keyframes, css } from 'styled-components';
import { Palette } from '../helpers/theme';

/* Animación de rebote para cumpleaños de hoy */
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
`;

/* 📋  PALETA DELVALLE
   Bright Cyan  #00adb5
   Pure Black   #222831
   Dark Gray    #393e46
   Light Gray   #eeeeee
   White        #ffffff
*/



/* Contenedor principal de la tarjeta */
export const Card = styled.div`
  background: ${({ $birthday }) => ($birthday ? Palette.dark : Palette.background)};
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(34, 40, 49, 0.08); /* sombra con Pure Black */
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 220px;
  justify-content: space-around;
  font-family: 'Nunito', sans-serif;
`;

/* Nombre del cliente */
export const Name = styled.h2`
  margin: 0;
  color: ${Palette.text};
  font-size: 1.25rem;
  font-weight: 700;
`;

/* Sección que agrupa filas de información */
export const InfoSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* Cada fila (icono + texto) */
export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ $birthday }) => ($birthday ? Palette.background : Palette.muted)};
  font-size: 0.95rem;

  span {
    ${({ $birthday }) =>
      $birthday &&
      css`
        animation: ${bounce} 1s infinite;
        font-weight: 700;
      `}
  }

  svg {
    color: ${Palette.dark};
    font-size: 1.1rem;
    margin-right:15px;
  }
`;

/* Fila que agrupa los botones */
export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

/* Botón de acción genérico */
export const ActionButton = styled.button`
  background: ${Palette.background};
  color: ${Palette.text};
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, transform 0.1s;

  &:hover {
    background: ${Palette.primary};
    color: #ffffff;
    transform: translateY(-1px);
  }

  /* Variante para el botón “Eliminar” */
  &.delete {
    background: ${Palette.background};
    color: ${Palette.primary};
    box-shadow: 0 0 0 2px ${Palette.primary} inset;

    &:hover {
      background: ${Palette.primary};
      color: #ffffff;
    }
  }
`;
