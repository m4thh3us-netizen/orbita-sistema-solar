import { PerformanceMonitor } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { definirAnisotropia } from '@/assets/texturas';
import { useOrbita } from '@/state/store';
import { PERFIS, qualidadeAbaixo, qualidadeAcima, qualidadeInicial } from './qualidade';

export function ControleQualidade() {
  const qualidade = useOrbita((s) => s.qualidade);
  const setDpr = useThree((s) => s.setDpr);

  useEffect(() => {
    useOrbita.getState().setQualidade(qualidadeInicial());
  }, []);

  useEffect(() => {
    const perfil = PERFIS[qualidade];
    setDpr(Math.min(Math.max(window.devicePixelRatio || 1, 1), perfil.dprMaximo));
    definirAnisotropia(perfil.anisotropia);
  }, [qualidade, setDpr]);

  const mudar = (f: typeof qualidadeAbaixo) => {
    const s = useOrbita.getState();
    s.setQualidade(f(s.qualidade));
  };

  return (
    <PerformanceMonitor
      ms={250}
      iterations={12}
      threshold={0.75}
      flipflops={4}
      bounds={(taxa) => (taxa > 90 ? [50, 90] : [42, 58])}
      onDecline={() => mudar(qualidadeAbaixo)}
      onIncline={() => mudar(qualidadeAcima)}
      onFallback={() => mudar(qualidadeAbaixo)}
    />
  );
}
