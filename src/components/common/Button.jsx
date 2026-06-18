import React from 'react';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <button className="hgn-btn" type="button">
        <span className="hgn-btn__halo" aria-hidden="true" />
        <span className="hgn-btn__text">Launch sequence</span>
        <svg className="hgn-btn__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap");

  .hgn-btn {
    --hgn-accent: #adff2f;
    --hgn-accent-glow: rgba(173, 255, 47, 0.35);
    --hgn-accent-soft: rgba(173, 255, 47, 0.18);
    --hgn-contrast: #0a0c10;
    --hgn-ease-kinetic: cubic-bezier(0.23, 1, 0.32, 1);
    --hgn-ease-snap: cubic-bezier(0.4, 0, 0.2, 1);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 32px;
    font-family:
      "Inter",
      system-ui,
      -apple-system,
      "Segoe UI",
      sans-serif;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1;
    color: var(--hgn-accent);
    background-color: transparent;
    border: 0;
    border-radius: 999px;
    box-shadow: 0 0 0 2px var(--hgn-accent);
    cursor: pointer;
    overflow: hidden;
    isolation: isolate;
    transition:
      color 600ms var(--hgn-ease-kinetic),
      border-radius 600ms var(--hgn-ease-kinetic),
      box-shadow 600ms var(--hgn-ease-kinetic),
      transform 200ms var(--hgn-ease-snap);
  }

  .hgn-btn__halo {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background-color: var(--hgn-accent);
    transform: translate(-50%, -50%) scale(0.1);
    opacity: 0;
    z-index: -1;
    transition:
      transform 800ms var(--hgn-ease-kinetic),
      opacity 800ms var(--hgn-ease-kinetic);
  }

  .hgn-btn__text {
    display: inline-block;
    transition: transform 600ms var(--hgn-ease-kinetic);
  }

  .hgn-btn__icon {
    display: inline-flex;
    width: 20px;
    height: 20px;
    color: currentColor;
    transition: transform 600ms var(--hgn-ease-kinetic);
  }

  .hgn-btn:hover {
    color: var(--hgn-contrast);
    border-radius: 14px;
    box-shadow:
      0 0 0 2px var(--hgn-accent),
      0 0 24px var(--hgn-accent-glow);
  }

  .hgn-btn:hover .hgn-btn__halo {
    transform: translate(-50%, -50%) scale(22);
    opacity: 1;
  }

  .hgn-btn:hover .hgn-btn__icon {
    transform: translateX(4px) rotate(8deg);
  }

  .hgn-btn:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--hgn-accent),
      0 0 0 6px var(--hgn-accent-soft);
  }

  .hgn-btn:active {
    transform: scale(0.96);
  }

  @media (prefers-reduced-motion: reduce) {
    .hgn-btn,
    .hgn-btn__halo,
    .hgn-btn__text,
    .hgn-btn__icon {
      transition-duration: 0.01ms;
    }
  }
`;

export default Button;
