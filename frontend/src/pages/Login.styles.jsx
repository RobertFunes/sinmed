// src/components/Login.styles.jsx
import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
`;

export const Form = styled.form`
  background: #ffffff;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 380px;
  text-align: center;
`;

export const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
`;

export const Field = styled.div`
  margin-bottom: 1rem;
  text-align: left;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: #555;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102,126,234,0.2);
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: #667eea;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover:enabled {
    background: #5563c1;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ErrorText = styled.p`
  color: #e53e3e;
  font-size: 0.9rem;
  margin-top: -0.5rem;
  margin-bottom: 0.75rem;
`;
