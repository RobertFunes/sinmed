// src/components/ContactCard.styles.jsx
import styled from 'styled-components';
import { Palette } from '../helpers/theme';


/* Contenedor principal de la tarjeta */
export const Card = styled.div`
  background: ${Palette.background};
  border-radius: 12px;
  padding: 16px 20px 0;
  border: 1px solid rgba(65, 94, 114, 0.18);
  box-shadow: none;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: flex-start;
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

export const NameDivider = styled.hr`
  width: 100%;
  height: 2px;
  border: 0;
  margin: 2px 0 6px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent,
    ${Palette.primary},
    ${Palette.accent},
    ${Palette.secondary},
    transparent
  );
  opacity: 0.75;
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
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  align-self: stretch;
  gap: 0;
  margin: auto -20px 0;
  padding: 10px 20px 5px;
  border-radius: 0 0 12px 12px;
  border: 1px solid ${Palette.accent}55;
  background: linear-gradient(135deg, ${Palette.secondary}2b, ${Palette.accent}24);
  box-shadow:
    0 16px 40px rgba(32, 87, 129, 0.22),
    0 1px 0 ${Palette.accent}33 inset;
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
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

  &:focus-visible {
    outline: 2px solid ${Palette.accent};
    outline-offset: 2px;
  }

  &[disabled] {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &.icon {
    width: 38px;
    height: 38px;
    padding: 0;
    border-radius: 10px;
    justify-content: center;
    line-height: 0;
    background: linear-gradient(135deg, ${Palette.accent}1f, ${Palette.secondary}14);
    border: 1px solid ${Palette.accent}44;
    backdrop-filter: blur(10px) saturate(140%);
    -webkit-backdrop-filter: blur(10px) saturate(140%);
  }

  &:hover {
    background: ${Palette.primary};
    color: #ffffff;
    transform: translateY(-1px);
  }

  &.view {
    color: ${Palette.dark};
    box-shadow: 0 0 0 2px ${Palette.dark} inset;

    &:hover:not([disabled]) {
      background: ${Palette.dark};
      color: ${Palette.background};
    }
  }

  &.edit {
    color: ${Palette.secondary};
    box-shadow: 0 0 0 2px ${Palette.secondary} inset;

    &:hover:not([disabled]) {
      background: ${Palette.secondary};
      color: ${Palette.background};
    }
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
