import React from 'react';
import styled from 'styled-components';

const Checkbox = () => {
  return (
    <StyledWrapper>
      <label className="hgn-check">
        <input type="checkbox" className="hgn-check__input" defaultChecked />
        <span className="hgn-check__box" aria-hidden="true">
          <svg className="hgn-check__tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span className="hgn-check__text">Auto-sync component tokens</span>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap");

  .hgn-check {
    --hgn-accent: #adff2f;
    --hgn-accent-soft: rgba(173, 255, 47, 0.18);
    --hgn-contrast: #0a0c10;
    --hgn-surface-raised: #1f242d;
    --hgn-hairline: #2a313c;
    --hgn-ink: #f2f5f1;
    --hgn-ease-kinetic: cubic-bezier(0.23, 1, 0.32, 1);

    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-family: "Inter", system-ui, sans-serif;
    font-size: 0.875rem;
    color: var(--hgn-ink);
    cursor: pointer;
    user-select: none;
  }

  .hgn-check__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .hgn-check__box {
    position: relative;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: var(--hgn-contrast);
    background-color: var(--hgn-surface-raised);
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px var(--hgn-hairline);
    overflow: hidden;
    transition:
      border-radius 600ms var(--hgn-ease-kinetic),
      box-shadow 400ms var(--hgn-ease-kinetic);
  }

  .hgn-check__box::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--hgn-accent);
    transform: scale(0);
    border-radius: 999px;
    transition:
      transform 600ms var(--hgn-ease-kinetic),
      border-radius 600ms var(--hgn-ease-kinetic);
  }

  .hgn-check__tick {
    position: relative;
    width: 14px;
    height: 14px;
    transform: scale(0);
    opacity: 0;
    transition:
      transform 400ms var(--hgn-ease-kinetic) 120ms,
      opacity 400ms var(--hgn-ease-kinetic) 120ms;
  }

  .hgn-check:hover .hgn-check__box {
    box-shadow: 0 0 0 1px var(--hgn-accent);
  }

  .hgn-check__input:focus-visible + .hgn-check__box {
    box-shadow:
      0 0 0 2px var(--hgn-accent),
      0 0 0 6px var(--hgn-accent-soft);
  }

  .hgn-check__input:checked + .hgn-check__box {
    border-radius: 10px;
    box-shadow:
      0 0 0 2px var(--hgn-accent),
      0 0 12px var(--hgn-accent-soft);
  }

  .hgn-check__input:checked + .hgn-check__box::before {
    transform: scale(1);
    border-radius: 10px;
  }

  .hgn-check__input:checked + .hgn-check__box .hgn-check__tick {
    transform: scale(1);
    opacity: 1;
  }
`;

export default Checkbox;
