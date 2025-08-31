// src/components/Link.styles.jsx
import styled, { keyframes } from "styled-components";

/* ---------- Paleta de colores ---------- */
const COLORS = {
  cyan: "#00ADB5",       // Bright Cyan
  light: "#EEEEEE",      // Light Gray
  black: "#222831",      // Pure Black
  dark: "#393E46",       // Dark Gray
  almostWhite: "#F0F0F0" // Almost White
};

/* ---------- Animaciones ---------- */
const spin = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

/* ---------- Contenedor principal ---------- */
export const Container = styled.section`
  max-width: 75%;
  margin: 4rem auto;
  padding: 2rem;
  background: ${COLORS.light};
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: center;
  gap: 1.5rem;
`;

/* ---------- Box de estado (icono + texto) ---------- */
export const StatusBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  flex-direction: column;
  color: ${({ $success, $error }) =>
    $success ? COLORS.cyan : $error ? "#FF6868" : COLORS.black};
`;

/* ---------- Imagen del QR ---------- */
export const QrImage = styled.img`
  width: 260px;
  height: 260px;
  object-fit: contain;
  border: 4px solid ${COLORS.dark};
  border-radius: 8px;
  background: ${COLORS.almostWhite};
`;

/* ---------- Mensaje simple ---------- */
export const Message = styled.p`
  margin: 0;
  color: ${COLORS.black};
`;

/* ---------- Spinner ---------- */
export const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${COLORS.almostWhite};
  border-top: 4px solid ${COLORS.cyan};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

/* ---------- Botón “Reintentar” ---------- */
export const RetryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border: 2px solid ${COLORS.cyan};
  background: transparent;
  color: ${COLORS.cyan};
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: ${COLORS.cyan};
    color: white;
  }

  &:active {
    transform: scale(0.97);
  }
`;
