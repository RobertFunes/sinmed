// src/components/ContactCard.styles.jsx
import styled from 'styled-components';
import { Palette } from '../helpers/theme';


/* Contenedor principal de la tarjeta */
export const Card = styled.div`
  background: ${Palette.background};
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid rgba(65, 94, 114, 0.18);
  box-shadow: none;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content:space-around;
  font-family: 'Nunito', sans-serif;
  min-height: 350px;
  max-width: 500px;
  transition: transform 0.18s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, ${Palette.primary}, ${Palette.accent}, ${Palette.secondary});
    opacity: 0.95;
  }
`;

/* Nombre del cliente */
export const Name = styled.h2`
  margin: 0;
  color: ${Palette.primary};
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
  color: ${Palette.secondary};
  font-size: 1rem;

  svg {
    color: ${Palette.border};
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
