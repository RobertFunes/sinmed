import styled from 'styled-components';
import { Palette } from '../helpers/theme';

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
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem 0;

  button {
    padding: 0.5rem 0.75rem;
    min-width: 2.25rem;
    border: none;
    border-radius: 4px;
    background-color: ${Palette.primary};
    color: ${Palette.background};
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    transition: filter 0.15s ease, background-color 0.15s ease, color 0.15s ease;

    &:hover:not([disabled]) {
      filter: brightness(0.92);
    }

    &:focus-visible {
      outline: 2px solid ${Palette.accent};
      outline-offset: 2px;
    }
  }

  button[data-active='true'] {
    background-color: ${Palette.secondary};
    color: ${Palette.background};
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button[data-active='true'][disabled] {
    opacity: 1;
  }

  .pages {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .ellipsis {
    padding: 0 0.25rem;
    color: ${Palette.background};
    opacity: 0.85;
  }

  .meta {
    color: ${Palette.background};
    opacity: 0.9;
    font-family: 'Nunito', sans-serif;
    margin-left: 0.5rem;
  }
`;

