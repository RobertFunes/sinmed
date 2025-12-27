import styled from 'styled-components';
import { Palette } from '../helpers/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  min-height: 100vh;
  font-family: 'Nunito', sans-serif;
  background-image: url('/bg6.png');
  background-repeat: repeat;
`;

export const Title = styled.h1`
  margin: 0;
  text-align: center;
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${Palette.background};
  text-shadow:
    0 2px 18px ${Palette.dark}55,
    0 0 30px ${Palette.accent}33;
`;

export const Subtitle = styled.p`
  margin: -0.75rem 0 0;
  text-align: center;
  font-size: 1.1rem;
  color: ${Palette.background};
  opacity: 0.9;
`;

export const SwitchRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 600;
    color: ${Palette.text};
    font-size: 1.5rem;
  }

  input[type='radio'] {
    accent-color: ${Palette.primary};
    width: 1.5rem;
    transform: scale(2);
  }
`;

export const SearchForm = styled.form`
  display: flex;
  justify-content: center;
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: stretch;
  width: min(920px, 100%);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid ${Palette.border}66;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.25),
    0 0 0 1px ${Palette.accent}11;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease;

  &:focus-within {
    border-color: ${Palette.accent};
    box-shadow:
      0 12px 34px rgba(0, 0, 0, 0.28),
      0 0 0 3px ${Palette.accent}55,
      0 0 36px ${Palette.accent}44;
    transform: translateY(-1px);
  }
`;

export const SelectorRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  p{
    font-size: 2rem;
    color: ${Palette.background};

  }
`;

export const Select = styled.select`
  padding: 0.85rem 1rem;
  border: none;
  border-right: 1px solid ${Palette.border}33;
  background: transparent;
  color: ${Palette.text};
  font-size: 1.05rem;
  font-weight: 700;
  min-width: 160px;
  line-height: 1.2;
  color-scheme: light;

  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 2.4rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%23415E72' d='M5.6 7.6a1 1 0 0 1 1.4 0L10 10.6l3-3a1 1 0 1 1 1.4 1.4l-3.7 3.7a1 1 0 0 1-1.4 0L5.6 9A1 1 0 0 1 5.6 7.6Z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
  background-size: 1.1rem;

  &::-ms-expand {
    display: none;
  }

  option {
    background: ${Palette.background};
    color: ${Palette.text};
    font-weight: 700;
  }

  &:focus {
    outline: none;
  }
`;

export const Input = styled.input`
  padding: 0.85rem 1rem;
  border: none;
  flex: 1;
  background: transparent;
  color: ${Palette.text};
  font-size: 1.05rem;
  max-width: 60vw;
  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${Palette.muted};
    opacity: 0.9;
  }
`;

export const SearchButton = styled.button`
  border: none;
  padding: 0 1.2rem;
  background: linear-gradient(135deg, ${Palette.primary}, ${Palette.dark});
  color: ${Palette.background};
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: filter 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.05);
    box-shadow: 0 0 18px ${Palette.accent}55;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const Status = styled.p`
  margin: 0;
  text-align: center;
  color: ${Palette.background};
  opacity: 0.92;
  font-size: 1.05rem;
`;

export const Results = styled.div`
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;
