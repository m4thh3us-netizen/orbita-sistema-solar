/**
 * Bloom seletivo por luminância: só o que passa de LIMIAR_BLOOM em HDR brilha, e na cena
 * só o Sol e a coroa chegam lá (os planetas, iluminados, ficam abaixo de 1). O tone
 * mapping AgX vem depois do bloom. Na qualidade baixa não há compositor; o renderer
 * aplica o mesmo AgX e a coroa faz o papel do brilho.
 */
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
