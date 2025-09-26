// src/pages/Pending.styles.jsx
import styled from 'styled-components';
import { Palette } from '../helpers/theme';

/* Colores vienen desde helpers/theme.js (Palette) */

/* —————————— Wrapper general —————————— */
export const Container = styled.div`
  padding: 24px 4vw;
  display: flex;
  flex-direction: column;
  gap: 48px;
  background-image: url('/bg4.png');
  background-repeat: no-repeat;
  background-size: cover;

  .overdue{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
  }
`;

/* —————————— Título de sección —————————— */
export const SectionTitle = styled.h3`
  color: ${Palette.background};
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  /* Línea decorativa a la izquierda */
  &::before {
    content: '';
    width: 6px;
    height: 100%;
    background: ${Palette.primary};
    border-radius: 4px;
  }
`;

