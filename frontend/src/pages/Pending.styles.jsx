// src/pages/Pending.styles.jsx
import styled from 'styled-components';

/* Paleta base */
const cyan      = '#00adb5';
const darkGray  = '#393e46';
const black     = '#222831';
const lightGray = '#eeeeee';

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
  color: ${cyan};
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
    background: ${cyan};
    border-radius: 4px;
  }
`;

