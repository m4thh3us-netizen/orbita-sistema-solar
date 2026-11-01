import { useFrame } from '@react-three/fiber';
import { useMemo, type ReactNode } from 'react';
import { useOrbita } from '@/state/store';
import { PRIORIDADE } from './prioridades';
import { RelogioSimulacao } from './relogio';
import { ContextoRelogio } from './relogioContexto';

export function ProvedorRelogio({ children }: { children: ReactNode }) {
  const relogio = useMemo(() => new RelogioSimulacao(), []);
  useFrame((_, dt) => {
    const s = useOrbita.getState();
    relogio.avancar(dt, {
      velocidade: s.velocidade,
      pausada: s.simulacaoPausada,
      rotacaoPausada: s.rotacaoAstroPausada,
      suavizar: !s.movimentoReduzido,
    });
  }, PRIORIDADE.relogio);
  return <ContextoRelogio.Provider value={relogio}>{children}</ContextoRelogio.Provider>;
}
