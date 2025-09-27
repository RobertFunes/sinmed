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
  padding: 0.5rem 1rem;
  border: 2px solid ${Palette.border};
  border-radius: 10px;
  background: ${Palette.background};
  color: ${Palette.text};
  font-size: 1.5rem;
  &:focus {
    outline: 2px solid ${Palette.primary};
    border-color: transparent;
  }
`;

export const Input = styled.input`
  padding: 0.5rem 1rem;
  border: 2px solid ${Palette.border};
  border-radius: 10px;
  flex: 1;
  background: ${Palette.background};
  color: ${Palette.text};
  font-size: 1.5rem;
  max-width: 60vw;
  &:focus {
    outline: 2px solid ${Palette.primary};
    border-color: ${Palette.primary};
  }
`;

export const Results = styled.div`
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

