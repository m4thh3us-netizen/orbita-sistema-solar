import { ControleCamera } from '@/camera/ControleCamera';
import { CampoEstrelas } from './CampoEstrelas';
import { Cinturoes } from './Cinturoes';
import { ControleQualidade } from './ControleQualidade';
import { Cortina } from './Cortina';
import { Destaque } from './Destaque';
import { COR_FUNDO, LUZ_AMBIENTE } from './materiais/constantes';
import { PosProcessamento } from './PosProcessamento';
import { ProvedorRelogio } from './relogioCena';
import { Rotulos } from './Rotulos';
import { SistemaSolar } from './SistemaSolar';

/** Tudo o que vive dentro do canvas. A luz do Sol fica no próprio Sol (Sol.tsx). */
export function Cena() {
  return (
    <ProvedorRelogio>
      <color attach="background" args={[COR_FUNDO]} />
      <ambientLight intensity={LUZ_AMBIENTE} />
      <CampoEstrelas />
      <SistemaSolar />
      <Cinturoes />
      <Destaque />
      <Rotulos />
      <ControleCamera />
      <Cortina />
      <ControleQualidade />
      <PosProcessamento />
    </ProvedorRelogio>
  );
}
