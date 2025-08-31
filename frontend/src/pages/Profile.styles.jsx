// src/pages/Profile.styles.jsx
import styled from 'styled-components';

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
