import styled from 'styled-components';
import { Palette } from '../helpers/theme';

export const PendingTitle = styled.h1`
  color: white;
  font-size: clamp(2.25rem, 3.1vw, 3.3rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-align: center;
  margin: 0;
  font-family: 'Nunito', sans-serif;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.28);
  background-image: url('/bg5.png');
  background-repeat: repeat;
  background-position: top left;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 60px;
  padding-bottom: 40px;

  &::after {
    content: '';
    display: block;
    height: 4px;
    width: min(420px, 90%);
    margin: 14px auto 0;
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

  .titleGlass {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 1.05rem;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06));
    box-shadow:
      0 14px 40px rgba(0, 0, 0, 0.22),
      0 1px 0 rgba(255, 255, 255, 0.12) inset;
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
  }

  .titleIcon {
    margin-left: 0.7rem;
    font-size: 1.05em;
    opacity: 0.95;
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25));
  }
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

