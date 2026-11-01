import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useOrbita } from '@/state/store';
import { LIMIAR_BLOOM } from './materiais/constantes';
import { PERFIS } from './qualidade';

export function PosProcessamento() {
  const qualidade = useOrbita((s) => s.qualidade);
  const perfil = PERFIS[qualidade];
  if (!perfil.bloom) return null;
  return (
    <EffectComposer multisampling={perfil.multisampling} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        luminanceThreshold={LIMIAR_BLOOM}
        luminanceSmoothing={0.3}
        intensity={qualidade === 'alta' ? 1.1 : 0.85}
        radius={0.72}
        levels={qualidade === 'alta' ? 7 : 5}
      />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
