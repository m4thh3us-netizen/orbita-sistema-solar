import type { ReactNode, SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

/** Ícones de traço fino (1,5px), sempre decorativos: o rótulo fica no botão. */
function Icone({ children, ...props }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconeAlvo = (p: Props) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="6.5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </Icone>
);

export const IconeRotacao = (p: Props) => (
  <Icone {...p}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M19.5 4.5v3.8h-3.8" />
  </Icone>
);

export const IconePlay = (p: Props) => (
  <Icone {...p}>
    <path d="M8 5.5v13l10.5-6.5z" />
  </Icone>
);

export const IconePausa = (p: Props) => (
  <Icone {...p}>
    <path d="M9 5.5v13M15 5.5v13" />
  </Icone>
);

export const IconeOrbitas = (p: Props) => (
  <Icone {...p}>
    <ellipse cx="12" cy="12" rx="9.5" ry="4.5" transform="rotate(-20 12 12)" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="20" cy="9" r="1.2" fill="currentColor" stroke="none" />
  </Icone>
);

export const IconeNomes = (p: Props) => (
  <Icone {...p}>
    <path d="M4 18 8.5 6 13 18M5.7 14h5.6" />
    <path d="M15.5 10.5a2.8 2.8 0 0 1 5 1.7V18M20.5 14.3c-3.2-.2-5 .5-5 2 0 1 .8 1.7 2 1.7 1.6 0 3-1.2 3-3" />
  </Icone>
);

export const IconeBusca = (p: Props) => (
  <Icone {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15 15 5.5 5.5" />
  </Icone>
);

export const IconeCatalogo = (p: Props) => (
  <Icone {...p}>
    <circle cx="6" cy="6" r="1.6" />
    <circle cx="12" cy="6" r="1.6" />
    <circle cx="18" cy="6" r="1.6" />
    <path d="M4 12h16M4 18h11" />
  </Icone>
);

export const IconeAjuda = (p: Props) => (
  <Icone {...p}>
    <path d="M9.2 9a2.9 2.9 0 1 1 4.3 2.5c-.9.5-1.5 1.1-1.5 2.1v.6" />
    <circle cx="12" cy="17.6" r=".9" fill="currentColor" stroke="none" />
  </Icone>
);

export const IconeFechar = (p: Props) => (
  <Icone {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icone>
);

export const IconeSeta = (p: Props) => (
  <Icone {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icone>
);

export const IconeMais = (p: Props) => (
  <Icone {...p}>
    <circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </Icone>
);

export const IconeExterno = (p: Props) => (
  <Icone {...p}>
    <path d="M8 16 16 8M9.5 8H16v6.5" />
  </Icone>
);

export const IconeLuas = (p: Props) => (
  <Icone {...p}>
    <circle cx="10" cy="13" r="5.5" />
    <circle cx="19" cy="6" r="2" />
    <path d="M3 9.5c4-3.8 10-5.2 14.4-4.6" strokeDasharray="1.5 2.5" />
  </Icone>
);
