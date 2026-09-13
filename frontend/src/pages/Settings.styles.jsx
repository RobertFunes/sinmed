import styled from 'styled-components';
import { Palette } from '../helpers/theme';

export const Page = styled.main`
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 2.5rem);
  box-sizing: border-box;
  background-image: url('/bg-settings-gray.png');
  background-repeat: repeat;
`;

export const Title = styled.h1`
  margin: 0 auto 1.5rem;
  max-width: 1180px;
  color: white;
  font-size: clamp(2.25rem, 3.1vw, 3.3rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-align: center;
  font-family: 'Nunito', sans-serif;
  text-shadow:
    0 2px 18px ${Palette.dark}55,
    0 0 30px ${Palette.accent}33;
  background: transparent;
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
    transform-origin: center;
    animation: settingsGearSpin 5s linear infinite;
  }

  @keyframes settingsGearSpin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .titleIcon {
      animation: none;
    }
  }
`;

export const Card = styled.section`
  max-width: 920px;
  margin: 0 auto 1rem;
  padding: 1.5rem;
  box-sizing: border-box;
  border-radius: 12px;
  background: rgba(240, 240, 240, 0.9);
  box-shadow: 0 4px 18px rgba(34, 40, 49, 0.16);
`;

export const AiCard = styled(Card)`
  position: relative;
  max-width: 1180px;
  overflow: hidden;
  padding: clamp(1.25rem, 4vw, 3rem);
  border: 1px solid rgba(79, 149, 157, 0.15);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(238, 248, 251, 0.94) 100%);
  box-shadow: 0 14px 36px rgba(32, 87, 129, 0.12);
`;

export const SectionTitle = styled.h2`
  margin: 0 0 0.75rem;
  color: ${Palette.secondary};
  font-size: 1.3rem;
`;

export const TelegramSection = styled.section`
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

export const SectionHeaderTitle = styled(SectionTitle)`
  flex: 1;
  margin: 0;
`;

export const AiHero = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1.25rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const AiHeroIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 1.7rem;
  background: linear-gradient(145deg, #e4fbfc 0%, #cceff2 100%);
  color: ${Palette.secondary};
  font-size: 3rem;
  box-shadow: 0 8px 18px rgba(79, 149, 157, 0.12);

  @media (max-width: 520px) {
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 1.35rem;
    font-size: 2.5rem;
  }
`;

export const AiHeroContent = styled.div`
  min-width: 0;
`;

export const AiHeader = styled(SectionHeader)`
  align-items: flex-start;
  margin-bottom: 0.35rem;

  ${SectionHeaderTitle} {
    color: ${Palette.dark};
    font-size: clamp(1.4rem, 3vw, 2.05rem);
    line-height: 1.1;
  }
`;

export const AiUsagePanel = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin: 2rem 0 1.5rem;
  padding: 1rem 1.35rem;
  border: 1px solid rgba(79, 149, 157, 0.1);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 24px rgba(32, 87, 129, 0.07);

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const AiUsageStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
`;

export const AiUsageIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 3.35rem;
  height: 3.35rem;
  border-radius: 50%;
  background: #e2f8fa;
  color: ${Palette.secondary};
  font-size: 1.45rem;
`;

export const AiUsageCopy = styled.span`
  display: grid;
  gap: 0.1rem;
  min-width: 0;
`;

export const AiUsageLabel = styled.span`
  color: #6b829a;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const AiUsageValue = styled.strong`
  color: ${Palette.dark};
  font-size: clamp(1.55rem, 3vw, 2.2rem);
  line-height: 1.1;
`;

export const InfoButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${Palette.secondary};
  font-size: 1.35rem;
  cursor: pointer;

  &:hover {
    color: ${Palette.primary};
    background: rgba(255, 255, 255, 0.7);
  }

  &:focus-visible {
    outline: 3px solid ${Palette.primary};
    outline-offset: 2px;
  }
`;

export const Intro = styled.p`
  margin-top: 0;
  color: ${Palette.secondary};
`;

export const AiIntro = styled(Intro)`
  max-width: 64rem;
  margin-bottom: 0;
  color: #6a829a;
  font-size: clamp(0.82rem, 1.2vw, 0.98rem);
  line-height: 1.5;
`;

export const Label = styled.label`
  display: grid;
  gap: 0.4rem;
  color: ${Palette.secondary};
  font-weight: 600;
`;

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.7rem 0.8rem;
  border: 1px solid ${Palette.border};
  border-radius: 7px;
  background: #fff;
  color: ${Palette.text};
  font: inherit;

  &:focus {
    outline: 3px solid ${Palette.primary};
    border-color: transparent;
  }
`;

export const Help = styled.small`
  color: ${Palette.secondary};
  font-weight: 400;
`;

export const Status = styled.div`
  display: grid;
  gap: 0.35rem;
  margin: 1rem 0;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.75);
  color: ${Palette.secondary};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1rem 0;
`;

export const Button = styled.button`
  border: 0;
  border-radius: 7px;
  padding: 0.65rem 0.9rem;
  background: ${({ $secondary }) => ($secondary ? Palette.background : Palette.dark)};
  color: ${({ $secondary }) => ($secondary ? Palette.secondary : Palette.background)};
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 3px solid ${Palette.primary};
  }
`;

export const Fieldset = styled.fieldset`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin: 1.3rem 0;
  padding: 1rem;
  border: 1px solid ${Palette.border};
  border-radius: 8px;

  & > legend,
  & > small {
    grid-column: 1 / -1;
  }

  &:disabled {
    opacity: 0.62;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const Legend = styled.legend`
  padding: 0 0.35rem;
  color: ${Palette.secondary};
  font-weight: 700;
`;

export const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: ${Palette.secondary};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

export const ModeSwitch = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
  margin: 2rem 0 0.6rem;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const ModeOption = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 9.5rem;
  padding: 1.35rem;
  box-sizing: border-box;
  border: 2px solid ${({ $selected }) => ($selected ? Palette.accent : '#d5e2ec')};
  border-radius: 1.15rem;
  background: ${({ $selected }) => ($selected
    ? 'linear-gradient(135deg, rgba(240, 253, 253, 0.98) 0%, rgba(226, 248, 250, 0.94) 100%)'
    : 'rgba(255, 255, 255, 0.78)')};
  color: ${Palette.secondary};
  cursor: pointer;
  box-shadow: ${({ $selected }) => ($selected ? '0 12px 28px rgba(79, 183, 179, 0.16)' : '0 5px 16px rgba(32, 87, 129, 0.04)')};
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;

  &:hover {
    border-color: ${Palette.accent};
    transform: translateY(-2px);
  }

  &:focus-within {
    outline: 3px solid ${Palette.primary};
    outline-offset: 2px;
  }
`;

export const ModeRadio = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  clip-path: inset(50%);
`;

export const ModeIndicator = styled.span`
  flex: 0 0 auto;
  width: 1.5rem;
  height: 1.5rem;
  box-sizing: border-box;
  border: 3px solid ${({ $selected }) => ($selected ? Palette.accent : '#9bb1c7')};
  border-radius: 50%;
  background: ${({ $selected }) => ($selected ? Palette.accent : '#fff')};
  box-shadow: ${({ $selected }) => ($selected ? 'inset 0 0 0 4px #fff' : 'none')};
`;

export const ModeVisual = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 4.7rem;
  height: 4.7rem;
  border-radius: 50%;
  background: ${({ $selected }) => ($selected ? '#d5f5f6' : '#e9f0f6')};
  color: ${({ $selected }) => ($selected ? '#0a91a7' : '#587089')};
  font-size: 2.15rem;
`;

export const ModeContent = styled.span`
  flex: 1 1 10rem;
  min-width: 0;
  display: grid;
  gap: 0.25rem;
`;

export const ModeLabel = styled.span`
  color: ${Palette.dark};
  font-size: 1.2rem;
  font-weight: 700;
`;

export const ModeUsage = styled.small`
  color: ${Palette.secondary};
  font-size: 1rem;
  font-weight: 400;
`;

export const ModeDescription = styled.span`
  margin-top: 0.25rem;
  color: #6a829a;
  font-size: 0.92rem;
  line-height: 1.45;
`;

export const ModeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: flex-start;
  flex: 0 0 auto;
  margin-left: auto;
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  background: #d5f5f6;
  color: #0a91a7;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const LinkBox = styled.div`
  overflow-wrap: anywhere;
  margin: 0.75rem 0;
  padding: 0.8rem;
  border-radius: 7px;
  background: #fff;
  color: ${Palette.secondary};
`;

export const Message = styled.p`
  margin: 0.75rem 0 0;
  color: ${({ $error }) => ($error ? '#a21d1d' : '#176b37')};
  font-weight: 600;
`;

export const Toast = styled.div`
  position: fixed;
  right: clamp(1rem, 3vw, 2rem);
  bottom: clamp(1rem, 3vw, 2rem);
  z-index: 1200;
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  width: min(26rem, calc(100vw - 2rem));
  box-sizing: border-box;
  padding: 0.9rem 1rem;
  border: 1px solid ${({ $error }) => ($error ? 'rgba(162, 29, 29, 0.2)' : 'rgba(10, 145, 167, 0.2)')};
  border-radius: 1rem;
  background: ${({ $error }) => ($error ? 'rgba(255, 246, 246, 0.98)' : 'rgba(240, 253, 253, 0.98)')};
  color: ${({ $error }) => ($error ? '#8f2323' : Palette.dark)};
  box-shadow: 0 14px 32px rgba(32, 87, 129, 0.18);
  animation: settingsToastIn 0.2s ease-out;

  @keyframes settingsToastIn {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ToastIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 50%;
  background: ${({ $error }) => ($error ? '#f9dede' : '#d5f5f6')};
  color: ${({ $error }) => ($error ? '#a21d1d' : '#0a91a7')};
  font-size: 0.9rem;
  font-weight: 700;
`;

export const ToastText = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  padding-top: 0.1rem;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.4;
`;

export const ToastClose = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: currentColor;
  font: inherit;
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.75);
  }

  &:focus-visible {
    outline: 3px solid ${Palette.primary};
    outline-offset: 2px;
  }
`;

export const TelegramCard = styled(Card)`
  position: relative;
  max-width: 1180px;
  padding: clamp(1.25rem, 4vw, 3rem);
  border: 1px solid rgba(79, 149, 157, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(241, 249, 252, 0.94) 100%);
  box-shadow: 0 14px 36px rgba(32, 87, 129, 0.12);
`;

export const TelegramHero = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.75rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const TelegramHeroIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 1.7rem;
  background: linear-gradient(145deg, #e0f8ff 0%, #c7edf8 100%);
  color: #229dcc;
  font-size: 3rem;
  box-shadow: 0 8px 18px rgba(34, 157, 204, 0.14);

  @media (max-width: 520px) {
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 1.35rem;
    font-size: 2.5rem;
  }
`;

export const TelegramHeroContent = styled.div`
  min-width: 0;
`;

export const TelegramHeader = styled(SectionHeader)`
  align-items: flex-start;
  margin-bottom: 0.35rem;

  ${SectionHeaderTitle} {
    color: ${Palette.dark};
    font-size: clamp(1.75rem, 4vw, 2.65rem);
    line-height: 1.1;
  }
`;

export const TelegramIntro = styled(Intro)`
  max-width: 64rem;
  margin-bottom: 0;
  color: #6a829a;
  font-size: clamp(0.95rem, 1.6vw, 1.18rem);
  line-height: 1.5;
`;

export const TelegramTokenPanel = styled.section`
  display: grid;
  gap: 0.9rem;
  margin-top: 1.5rem;
  padding: 1.25rem 1.35rem;
  border: 1px solid rgba(79, 149, 157, 0.12);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 24px rgba(32, 87, 129, 0.06);
`;

export const TelegramSectionHeading = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  color: ${Palette.dark};
  font-size: 0.95rem;

  svg {
    color: #229dcc;
  }
`;

export const TelegramInput = styled(Input)`
  padding: 0.85rem 1rem;
  border-color: rgba(79, 149, 157, 0.35);
  border-radius: 0.8rem;

  &:focus {
    outline: 3px solid rgba(79, 183, 179, 0.3);
    border-color: ${Palette.accent};
  }
`;

export const TelegramLockCopy = styled.div`
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: 0.65rem;
  color: #6a829a;
`;

export const TelegramLockIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  background: ${({ $unlocked }) => ($unlocked ? '#d5f5f6' : '#e9f0f6')};
  color: ${({ $unlocked }) => ($unlocked ? '#0a91a7' : '#7890a5')};
  font-size: 0.85rem;
`;

export const TelegramLockToggle = styled.button`
  position: relative;
  width: 3.15rem;
  height: 1.75rem;
  padding: 0.2rem;
  border: 0;
  border-radius: 999px;
  background: ${({ $unlocked }) => ($unlocked ? '#bfecef' : '#d9e3eb')};
  box-shadow: inset 0 0 0 1px ${({ $unlocked }) => ($unlocked ? 'rgba(10, 145, 167, 0.18)' : 'rgba(120, 144, 165, 0.18)')};
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;

  &:focus-visible {
    outline: 3px solid rgba(79, 183, 179, 0.35);
    outline-offset: 2px;
  }
`;

export const TelegramLockToggleThumb = styled.span`
  position: absolute;
  top: 0.2rem;
  left: ${({ $unlocked }) => ($unlocked ? '1.6rem' : '0.2rem')};
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 5px rgba(32, 87, 129, 0.2);
  transition: left 0.15s ease;
`;

export const TelegramLockHelp = styled.span`
  min-width: 0;
  font-size: 0.68rem;
  line-height: 1.35;
`;

export const TelegramLockStatus = styled.strong`
  display: block;
  margin-bottom: 0.08rem;
  color: ${Palette.dark};
  font-size: 0.72rem;
`;

export const TelegramStatusPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 1.25rem 0 1.5rem;
  padding: 1.1rem 1.35rem;
  border: 1px solid rgba(79, 149, 157, 0.1);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 24px rgba(32, 87, 129, 0.07);

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const TelegramStatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(79, 183, 179, 0.22)' : 'rgba(155, 177, 199, 0.2)')};
  border-radius: 0.9rem;
  background: ${({ $active }) => ($active ? 'rgba(226, 248, 250, 0.7)' : 'rgba(247, 250, 252, 0.8)')};
`;

export const TelegramStatusIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? '#d5f5f6' : '#e9f0f6')};
  color: ${({ $active }) => ($active ? '#0a91a7' : '#7890a5')};
  font-size: 1.3rem;
`;

export const TelegramStatusCopy = styled.span`
  display: grid;
  gap: 0.15rem;
  min-width: 0;
`;

export const TelegramStatusLabel = styled.span`
  color: #6b829a;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const TelegramStatusValue = styled.span`
  overflow-wrap: anywhere;
  color: ${({ $active }) => ($active ? Palette.dark : '#7890a5')};
  font-size: 0.82rem;
  font-weight: 600;
`;

export const TelegramActions = styled(Actions)`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.7rem;
  margin: 1.25rem 0;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 430px) {
    grid-template-columns: 1fr;
  }
`;

export const TelegramButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  gap: 0.5rem;
  min-height: 2.8rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $secondary, $danger }) => ($danger ? 'rgba(162, 29, 29, 0.2)' : ($secondary ? 'rgba(79, 149, 157, 0.16)' : 'transparent'))};
  border-radius: 0.85rem;
  background: ${({ $secondary, $danger }) => ($danger ? 'rgba(255, 242, 242, 0.9)' : ($secondary ? 'rgba(255, 255, 255, 0.86)' : Palette.dark))};
  color: ${({ $secondary, $danger }) => ($danger ? '#a21d1d' : ($secondary ? Palette.secondary : Palette.background))};
  box-shadow: 0 5px 14px rgba(32, 87, 129, 0.06);
  font-size: 0.76rem;
  line-height: 1.25;

  &:hover:not(:disabled) {
    border-color: ${Palette.accent};
    transform: translateY(-1px);
  }

  svg {
    flex: 0 0 auto;
  }
`;

export const TelegramLinkBox = styled(LinkBox)`
  margin: 1rem 0;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(79, 183, 179, 0.18);
  border-radius: 0.9rem;
  background: rgba(226, 248, 250, 0.62);
  line-height: 1.55;

  a {
    display: inline-block;
    margin: 0.35rem 0;
    color: #0a91a7;
    font-weight: 600;
  }
`;

export const TelegramLinkTitle = styled.strong`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.2rem;
  color: ${Palette.dark};
`;

export const TelegramLinkUrl = styled.code`
  display: block;
  overflow-wrap: anywhere;
  margin-top: 0.4rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(79, 149, 157, 0.16);
  border-radius: 0.65rem;
  background: rgba(255, 255, 255, 0.82);
  color: #0a91a7;
  font: inherit;
  font-size: 0.78rem;
  line-height: 1.45;
  user-select: text;
`;

export const TelegramFieldset = styled(Fieldset)`
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin: 1.5rem 0 0.75rem;
  padding: 1.25rem;
  border: 1px solid rgba(79, 149, 157, 0.14);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.62);

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const TelegramLegend = styled(Legend)`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;

  svg {
    color: #229dcc;
  }
`;

export const TelegramCheckLabel = styled(CheckLabel)`
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: 0.7rem;
  min-height: 4rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid ${({ $disabled }) => ($disabled ? 'rgba(155, 177, 199, 0.18)' : 'rgba(79, 149, 157, 0.16)')};
  border-radius: 0.95rem;
  background: ${({ $disabled }) => ($disabled ? 'rgba(247, 250, 252, 0.55)' : 'rgba(255, 255, 255, 0.78)')};
  color: ${Palette.dark};
  font-size: 0.76rem;
  font-weight: 600;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;

  input {
    width: 1.1rem;
    height: 1.1rem;
    margin: 0;
    accent-color: ${Palette.accent};
  }

  &:hover {
    border-color: ${({ $disabled }) => ($disabled ? 'rgba(155, 177, 199, 0.18)' : Palette.accent)};
    box-shadow: ${({ $disabled }) => ($disabled ? 'none' : '0 5px 14px rgba(79, 183, 179, 0.1)')};
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'translateY(-1px)')};
  }
`;

export const TelegramCheckIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 50%;
  background: ${({ $disabled }) => ($disabled ? '#e9f0f6' : '#e2f8fa')};
  color: ${({ $disabled }) => ($disabled ? '#91a4b5' : '#0a91a7')};
  font-size: 1rem;
`;

export const TelegramCheckText = styled.span`
  min-width: 0;
  line-height: 1.35;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  background: rgba(20, 25, 30, 0.58);
`;

export const InfoModal = styled.div`
  width: min(680px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(240, 240, 240, 0.98);
  box-shadow: 0 8px 30px rgba(34, 40, 49, 0.3);
  color: ${Palette.secondary};
  font-family: 'Fira Code', monospace;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    color: ${Palette.secondary};
    font-size: 1.25rem;
  }
`;

export const ModalClose = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${Palette.secondary};
  font: inherit;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.75);
  }

  &:focus-visible {
    outline: 3px solid ${Palette.primary};
    outline-offset: 2px;
  }
`;

export const Instructions = styled.ol`
  display: grid;
  gap: 0.7rem;
  margin: 0;
  padding-left: 1.6rem;
  line-height: 1.5;
`;
