// src/components/InteractCard.styles.jsx
import styled, { keyframes, css } from 'styled-components';

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
  background: ${({ $birthday }) => ($birthday ? '#fff8e1' : '#ffffff')};
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(34, 40, 49, 0.08); /* sombra con Pure Black */
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
  justify-content: space-around;
  font-family: 'Nunito', sans-serif;
`;

/* Nombre del cliente */
export const Name = styled.h2`
  margin: 0;
  color: #222831;                      /* Pure Black */
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
  color: ${({ $birthday }) => ($birthday ? '#ff6f00' : '#393e46')};
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
    color: #00adb5; /* Bright Cyan */
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
  background: #eeeeee;                 /* Light Gray */
  color: #222831;                      /* Pure Black */
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
    background: #00adb5;               /* Bright Cyan */
    color: #ffffff;                    /* White */
    transform: translateY(-1px);
  }

  /* Variante para el botón “Eliminar” */
  &.delete {
    background: #ffffff;
    color: #b00020;                    /* Rojo oscuro para delete */
    box-shadow: 0 0 0 2px #b00020 inset;

    &:hover {
      background: #b00020;
      color: #ffffff;
    }
  }
`;
