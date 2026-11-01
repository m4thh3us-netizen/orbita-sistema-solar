import { createContext, useContext } from 'react';
import type { RelogioSimulacao } from './relogio';

export const ContextoRelogio = createContext<RelogioSimulacao | null>(null);

export function useRelogio(): RelogioSimulacao {
  const r = useContext(ContextoRelogio);
  if (!r) throw new Error('useRelogio fora de <ProvedorRelogio>');
  return r;
}
