// src/components/ContactCard.styles.jsx
import styled from 'styled-components';
import { Palette } from '../helpers/theme';

/* 📋  PALETA DELVALLE
   Bright Cyan  #00adb5
   Pure Black   #222831
   Dark Gray    #393e46
   Light Gray   #eeeeee
   White        #ffffff
*/

/* Contenedor principal de la tarjeta */
export const Card = styled.div`
  background: ${Palette.background};
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(34, 40, 49, 0.08); /* sombra con Pure Black */
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content:space-around;
  font-family: 'Nunito', sans-serif;
  min-height: 350px;
  max-width: 500px;
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
  color: ${Palette.muted};
  font-size: 1rem;

  svg {
    color: ${Palette.accent};
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
  font-size: 1.2rem;
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
