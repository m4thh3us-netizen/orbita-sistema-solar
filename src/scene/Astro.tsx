/**
 * Um astro: segue a própria órbita, gira em torno do eixo inclinado e carrega superfície,
 * anéis, atmosfera, colisor e (como filhos) as luas.
 *
 * Hierarquia:
 *   plano (nodo + inclinação da órbita, fixo)
 *   ├─ linha da órbita
 *   └─ posição (anda na órbita; é o objeto registrado)
 *      ├─ eixo (obliquidade em torno de X)
 *      │  ├─ giro (rotação axial; luas síncronas giram com o ângulo orbital)
 *      │  └─ anéis (plano equatorial, sem girar)
 *      ├─ atmosfera, colisor, luz/coroa do Sol
 *      └─ luas (cada uma no referencial equatorial do planeta ou no da órbita)
 */
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import type { Group } from 'three';
import type { CelestialBody } from '@/data/types';
import { useOrbita } from '@/state/store';
import { Aneis } from './Aneis';
import { Atmosfera } from './Atmosfera';
import { Colisor } from './Colisor';
import { raioCena, sentidoRotacao, velocidadeRotacao } from './escala';
import { aparenciaDe } from './estilos';
import { LinhaOrbita } from './LinhaOrbita';
import { espessuraHalo } from './materiais/atmosfera';
import { aleatorio, elementosDe, hashTexto, posicaoOrbital, type PontoOrbital } from './orbitas';
import { PRIORIDADE } from './prioridades';
import { registro } from './registro';
import { useRelogio } from './relogioContexto';
import { LuzECoroaSolar } from './Sol';
import { Superficie } from './Superficie';

const GRAUS = Math.PI / 180;
const DURACAO_SURGIMENTO = 0.6;

interface Props {
  corpo: CelestialBody;
  /** Corpo em torno do qual orbita (necessário para luas). */
  pai?: CelestialBody;
  /** Luas surgem crescendo, em vez de aparecer de uma vez. */
  surgir?: boolean;
  children?: ReactNode;
}

/**
 * Raio que a câmera precisa enquadrar: anéis, halo da atmosfera ou coroa. Os anéis contam
 * até 2,4 raios (os de Saturno inteiros); os tênues de Júpiter e Netuno vão além disso e
 * podem sair do quadro sem deixar o planeta minúsculo.
 */
function raioVisualDe(corpo: CelestialBody, raio: number): number {
  let r = raio * 1.02;
  if (corpo.tipo === 'estrela') r = raio * 1.5;
  if (corpo.aparencia.atmosfera) r = Math.max(r, raio * espessuraHalo(corpo.aparencia.atmosfera.intensidade));
  if (corpo.aparencia.aneis) {
    const aneis = (raio * corpo.aparencia.aneis.raioExternoKm) / corpo.fisico.raioMedioKm;
    r = Math.max(r, Math.min(aneis, raio * 2.4));
  }
  return r;
}

export function Astro({ corpo, pai, surgir = false, children }: Props) {
  const relogio = useRelogio();
  const posicao = useRef<Group>(null);
  const giro = useRef<Group>(null);
  const surgimento = useRef(surgir ? 0 : 1);

  const raio = raioCena(corpo.fisico.raioMedioKm);
  const aparencia = useMemo(() => aparenciaDe(corpo), [corpo]);
  const elementos = useMemo(() => elementosDe(corpo, pai?.fisico.raioMedioKm), [corpo, pai]);
  const sincrona = !!corpo.fisico.rotacaoSincrona && !!elementos;
  const omegaGiro =
    Math.abs(velocidadeRotacao(corpo.fisico.periodoRotacaoHoras)) *
    sentidoRotacao(corpo.fisico.inclinacaoAxialGraus, corpo.fisico.periodoRotacaoHoras);
  const faseGiro = useMemo(() => aleatorio(hashTexto(corpo.id + ':giro'))() * Math.PI * 2, [corpo.id]);
  const ponto = useMemo<PontoOrbital>(() => ({ x: 0, z: 0, angulo: 0 }), []);

  const detalhado = useOrbita((s) => {
    if (s.modo === 'visao-geral' || !s.selecionado) return false;
    return s.selecionado === corpo.id || (s.modo === 'luas' && s.selecionado === corpo.pai);
  });

  useLayoutEffect(() => {
    const objeto = posicao.current;
    if (!objeto) return;
    return registro.registrar({
      id: corpo.id,
      nome: corpo.nome,
      tipo: corpo.tipo,
      pai: corpo.pai,
      raio,
      raioVisual: raioVisualDe(corpo, raio),
      corAcento: corpo.aparencia.corAcento,
      objeto,
    });
  }, [corpo, raio]);

  useFrame((_, dt) => {
    const p = posicao.current;
    if (!p) return;
    if (elementos) {
      posicaoOrbital(elementos, relogio.tempoOrbital, ponto);
      p.position.set(ponto.x, 0, ponto.z);
    }
    if (surgimento.current < 1) {
      const reduzido = useOrbita.getState().movimentoReduzido;
      surgimento.current = reduzido ? 1 : Math.min(1, surgimento.current + dt / DURACAO_SURGIMENTO);
      const t = surgimento.current;
      p.scale.setScalar(Math.max(1e-3, t * t * (3 - 2 * t)));
    }
    const g = giro.current;
    if (g) {
      // Síncrona: o meridiano 0 (u = 0,5 do mapa) fica sempre voltado para o pai.
      g.rotation.y = sincrona ? ponto.angulo + Math.PI : faseGiro + omegaGiro * relogio.tempoRotacao;
    }
  }, PRIORIDADE.corpos);

  const rotacaoPlano: [number, number, number, 'YXZ'] = elementos
    ? [elementos.inclinacaoRad, elementos.nodoRad, 0, 'YXZ']
    : [0, 0, 0, 'YXZ'];
  const obliquidade = sincrona ? 0 : corpo.fisico.inclinacaoAxialGraus * GRAUS;
  const atmosfera = corpo.aparencia.atmosfera;

  return (
    <group rotation={rotacaoPlano}>
      {elementos && <LinhaOrbita corpo={corpo} elementos={elementos} />}
      <group ref={posicao} scale={surgir ? 0.001 : 1}>
        <group rotation-x={obliquidade}>
          <group ref={giro}>
            <Superficie corpo={corpo} aparencia={aparencia} raio={raio} detalhado={detalhado} />
          </group>
          <Aneis corpo={corpo} raioPlaneta={raio} />
        </group>
        {atmosfera && <Atmosfera raio={raio} cor={atmosfera.cor} intensidade={atmosfera.intensidade} />}
        {corpo.tipo === 'estrela' && <LuzECoroaSolar raio={raio} corBase={corpo.aparencia.corBase} />}
        <Colisor corpoId={corpo.id} raio={raio} />
        {children}
      </group>
    </group>
  );
}
