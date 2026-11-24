import type { KeyboardEvent } from 'react';

interface ClickableProps {
  role: 'button';
  tabIndex: 0;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

// Props para que un elemento clickeable tambien se active con Enter o Espacio
export function clickableProps(onActivate: () => void): ClickableProps {
  return {
    role: 'button',
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onActivate();
      }
    },
  };
}
