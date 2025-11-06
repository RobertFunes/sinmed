import styled from 'styled-components';

export const PendingTitle = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin: 0;
  font-family: 'Nunito', sans-serif;
  background-image: url('/bg5.png');
  background-repeat: repeat;
  background-position: top left;
  padding-top: 60px;
  padding-bottom: 40px;
`;

export const ContactListContainer = styled.section`
  /* Quitamos el bloque de gradiente y dejamos el fondo de la página hacer el trabajo.
     Si quieres conservar el gradiente sutil, úsalo como background de la PÁGINA, no del grid 😉 */
  background-image: url('/bg5.png');
  background-repeat: repeat;
  background-position: top left;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 100%;
  margin: 0 ;

  /* Un poquito de respiración alrededor */
  padding: 20px 2rem;
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #2d72d9;
    color: white;
    cursor: pointer;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

