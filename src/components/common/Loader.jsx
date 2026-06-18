import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="hgn-loader" role="status" aria-label="Loading">
        <span className="hgn-loader__ring" />
        <span className="hgn-loader__ring hgn-loader__ring--alt" />
        <span className="hgn-loader__core" />
        <span className="hgn-loader__label">Compiling</span>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap");

  .hgn-loader {
    --hgn-accent: #adff2f;
    --hgn-accent-soft: rgba(173, 255, 47, 0.25);
    --hgn-accent-ghost: rgba(173, 255, 47, 0.08);
    --hgn-ink-muted: #9aa3b2;

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
  }

  .hgn-loader__ring,
  .hgn-loader__ring--alt {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    border: 2px solid transparent;
    border-top-color: var(--hgn-accent);
    animation: hgn-loader-spin 1.1s linear infinite;
  }

  .hgn-loader__ring--alt {
    inset: 14px;
    border-top-color: transparent;
    border-right-color: var(--hgn-accent);
    animation: hgn-loader-spin 1.6s linear infinite reverse;
    opacity: 0.7;
  }

  .hgn-loader__core {
    position: relative;
    width: 14px;
    height: 14px;
    background-color: var(--hgn-accent);
    border-radius: 999px;
    box-shadow:
      0 0 12px var(--hgn-accent-soft),
      0 0 24px var(--hgn-accent-ghost);
    animation: hgn-loader-pulse 1.4s ease-in-out infinite;
  }

  .hgn-loader__label {
    position: absolute;
    top: calc(100% + 12px);
    left: 50%;
    transform: translateX(-50%);
    font-family: "JetBrains Mono", ui-monospace, "SF Mono", monospace;
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--hgn-ink-muted);
    white-space: nowrap;
  }

  @keyframes hgn-loader-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes hgn-loader-pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow:
        0 0 12px var(--hgn-accent-soft),
        0 0 24px var(--hgn-accent-ghost);
    }
    50% {
      transform: scale(0.7);
      box-shadow:
        0 0 6px var(--hgn-accent-soft),
        0 0 16px var(--hgn-accent-ghost);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hgn-loader__ring,
    .hgn-loader__ring--alt,
    .hgn-loader__core {
      animation-duration: 0.01ms;
      animation-iteration-count: 1;
    }
  }
`;

export default Loader;
