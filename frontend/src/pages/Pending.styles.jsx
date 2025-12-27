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
  font-weight: 800;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0;
  text-align: left;
  text-shadow:
    0 2px 18px ${Palette.dark}55,
    0 0 30px ${Palette.accent}33;

  .titleGlass {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.95rem;
    border-radius: 18px;
    border: 1px solid ${Palette.accent}55;
    background: linear-gradient(135deg, ${Palette.secondary}2b, ${Palette.accent}24);
    box-shadow:
      0 14px 40px rgba(0, 0, 0, 0.22),
      0 1px 0 ${Palette.accent}33 inset;
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
  }

  .titleIcon {
    margin-left: 0.9rem;
    font-size: 1.05em;
    opacity: 0.95;
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25));
  }

  &::after {
    content: '';
    display: block;
    height: 4px;
    width: min(520px, 100%);
    margin: 12px 0 0;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      transparent,
      ${Palette.primary},
      ${Palette.accent},
      ${Palette.secondary},
      transparent
    );
    opacity: 0.95;
  }
`;

