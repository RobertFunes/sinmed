// src/pages/Profile.styles.jsx
import styled from 'styled-components';
import { Palette } from '../helpers/theme';

const black = '#222831';
const paper = 'rgba(255,255,255,0.94)';

export const Container = styled.div`
  font-family: 'Nunito', sans-serif;
  background-image: url('/bg.png');
  background-repeat: repeat;
  background-position: top left;
  background-size: 320px 320px;
  margin: 0 auto;
  padding: 48px 48px 64px;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h2`
  color: ${paper};
  font-size: clamp(2.2rem, 2.6vw, 3rem);
  font-weight: 800;
  text-align: center;
  letter-spacing: 0.5px;
  background-color: ${black};
  margin: 0;
  border-radius: 14px 14px 0 0;
  padding: 24px 0;
`;

export const SwitchRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 12px 0 20px;

  label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    color: ${Palette.text};
    background: ${Palette.background};
    padding: 4px 8px;
    border-radius: 8px;
  }

  input[type='radio'] {
    accent-color: ${Palette.primary};
    transform: scale(1.2);
  }
`;
