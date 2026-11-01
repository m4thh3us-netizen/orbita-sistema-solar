import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3, type PerspectiveCamera } from 'three';
import { useOrbita } from '@/state/store';
import { PRIORIDADE } from '@/scene/prioridades';
import { registro } from '@/scene/registro';
import { cortina } from './cortina';
import { CAIXA_VISAO_GERAL, calcularDestino, destinoVisaoGeral, type ContextoEnquadramento, type Destino, type Limites } from './destinos';
import { deslocamentoCentro } from './enquadramento';
import {
  amplitudeAfastamento,
  anguloMaisProximo,
  diferencaAngular,
  duracaoVoo,
  elevacaoExtra,
  hermite,
  lombada,
} from './trajetoria';

const { ACTION } = CameraControlsImpl;

const DURACAO_ENTRADA = 2;
const FADE_SAIDA = 0.11;
const FADE_ENTRADA = 0.16;
const OCIOSO_PARA_GIRAR_MS = 7000;
const GIRO_AUTOMATICO = 0.025;
const POLAR_MIN_ABSOLUTO = 0.02;

interface Medida {
  valido: boolean;
  alvo: Vector3;
  vAlvo: Vector3;
  az: number;
  vAz: number;
  polar: number;
  vPolar: number;
  logDist: number;
  vLogDist: number;
}

type Estado =
  | { tipo: 'parado' }
  | {
      tipo: 'voo';
      inicio: number;
      duracao: number;
      de: Medida;
      destino: Destino;
      azDestino: number;
      afastamento: number;
      elevacao: number;
      contorno: Vector3;
    }
  | { tipo: 'fade'; inicio: number; fase: 'saindo' | 'entrando'; destino: Destino }
  | { tipo: 'seguindo'; destino: Destino }
  | { tipo: 'livre'; destino: Destino };

type Pedido = { motivo: 'entrada' | 'navegacao' | 'reset'; tentativas: number };

function novaMedida(): Medida {
  return { valido: false, alvo: new Vector3(), vAlvo: new Vector3(), az: 0, vAz: 0, polar: 0, vPolar: 0, logDist: 0, vLogDist: 0 };
}

function copiarMedida(m: Medida): Medida {
  return { ...m, alvo: m.alvo.clone(), vAlvo: m.vAlvo.clone() };
}

const v1 = new Vector3();
const v2 = new Vector3();
const posicao = new Vector3();
const alvoVoo = new Vector3();
const centroObstaculo = new Vector3();
const posFinalVoo = new Vector3();

const FOLGA_OBSTACULO = 2;
const FOLGA_OBSTACULO_LARGA = 3;
const AFASTAMENTO_POR_CAMINHO = 1.2;

function desviarDeObstaculos(p: Vector3, excetoId: string | null, peso: number, posFinal: Vector3): void {
  if (peso <= 0) return;
  for (const e of registro.todos()) {
    if (e.id === excetoId) continue;
    e.objeto.getWorldPosition(centroObstaculo);
    const longeDaChegada = centroObstaculo.distanceTo(posFinal) > e.raio * FOLGA_OBSTACULO_LARGA * 2.4;
    const folga = e.raio * (longeDaChegada ? FOLGA_OBSTACULO_LARGA : FOLGA_OBSTACULO);
    const limite = 2 * folga;
    const delta = p.sub(centroObstaculo);
    const d = delta.length();
    if (d < limite) {
      const novo = d + ((limite - d) * (limite - d)) / (2 * limite);
      const alvoD = d + (novo - d) * peso;
      if (d > 1e-6) delta.multiplyScalar(alvoD / d);
      else delta.set(0, alvoD, 0);
    }
    p.add(centroObstaculo);
  }
}

const RAIO_CONTORNO = 3.5;

function desvioDoCaminho(t0: Vector3, t1: Vector3, excetoId: string | null, out: Vector3): Vector3 {
  out.set(0, 0, 0);
  const seg = v2.subVectors(t1, t0);
  const comprimento2 = seg.lengthSq();
  if (comprimento2 < 1e-8) return out;
  for (const e of registro.todos()) {
    if (e.id === excetoId) continue;
    const r = e.raio * RAIO_CONTORNO;
    e.objeto.getWorldPosition(centroObstaculo);
    if (centroObstaculo.distanceTo(t0) < r || centroObstaculo.distanceTo(t1) < r) continue;
    const k = Math.min(1, Math.max(0, posicao.subVectors(centroObstaculo, t0).dot(seg) / comprimento2));
    const maisPerto = posicao.copy(t0).addScaledVector(seg, k);
    const afastamento = maisPerto.sub(centroObstaculo);
    const d = afastamento.length();
    if (d >= r) continue;
    if (d < 1e-4) afastamento.set(0, 1, 0);
    else afastamento.divideScalar(d);
    out.addScaledVector(afastamento, r - d);
  }
  return out;
}

function aplicarPose(
  c: CameraControlsImpl,
  alvo: Vector3,
  az: number,
  polar: number,
  distancia: number,
  desvio?: { exceto: string | null; peso: number; posFinal: Vector3 },
): void {
  const p = Math.min(Math.max(polar, POLAR_MIN_ABSOLUTO), Math.PI - POLAR_MIN_ABSOLUTO);
  posicao.set(
    alvo.x + distancia * Math.sin(p) * Math.sin(az),
    alvo.y + distancia * Math.cos(p),
    alvo.z + distancia * Math.sin(p) * Math.cos(az),
  );
  if (desvio) desviarDeObstaculos(posicao, desvio.exceto, desvio.peso, desvio.posFinal);
  void c.setLookAt(posicao.x, posicao.y, posicao.z, alvo.x, alvo.y, alvo.z, false);
}

function aplicarLimites(c: CameraControlsImpl, l: Limites): void {
  c.minDistance = l.minDistancia;
  c.maxDistance = l.maxDistancia;
  c.minPolarAngle = l.minPolar;
  c.maxPolarAngle = l.maxPolar;
  c.dollyToCursor = l.livre;
  c.mouseButtons.left = ACTION.ROTATE;
  c.mouseButtons.middle = ACTION.DOLLY;
  c.mouseButtons.right = l.livre ? ACTION.TRUCK : ACTION.NONE;
  c.mouseButtons.wheel = ACTION.DOLLY;
  c.touches.one = ACTION.TOUCH_ROTATE;
  c.touches.two = l.livre ? ACTION.TOUCH_DOLLY_TRUCK : ACTION.TOUCH_DOLLY;
  c.touches.three = l.livre ? ACTION.TOUCH_TRUCK : ACTION.NONE;
  c.setBoundary(l.livre ? CAIXA_VISAO_GERAL : undefined);
}

function liberarLimites(c: CameraControlsImpl): void {
  c.minDistance = 1e-5;
  c.maxDistance = Infinity;
  c.minPolarAngle = 0;
  c.maxPolarAngle = Math.PI;
  c.setBoundary(undefined);
}

function posicaoDoDestino(d: Destino, out: Vector3): boolean {
  if (!d.alvoId) {
    out.copy(d.alvoFixo);
    return true;
  }
  const e = registro.obter(d.alvoId);
  if (!e) return false;
  e.objeto.getWorldPosition(out);
  return true;
}

export function ControleCamera() {
  const ref = useRef<CameraControlsImpl>(null);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);

  const estado = useRef<Estado>({ tipo: 'parado' });
  const pedido = useRef<Pedido | null>({ motivo: 'entrada', tentativas: 0 });
  const medida = useRef<Medida>(novaMedida());
  const residuo = useRef(new Vector3());
  const ultimaInteracao = useRef(0);
  const reenquadrar = useRef(false);
  const distanciaPadrao = useRef(0);
  const deslocamento = useRef({ dx: 0, dy: 0, largura: 0, altura: 0 });
  const rastro = useRef({ id: null as string | null, pos: new Vector3(), vel: new Vector3(), valido: false });

  useEffect(
    () =>
      useOrbita.subscribe((s, p) => {
        if (s.selecionado !== p.selecionado || s.modo !== p.modo) {
          pedido.current = { motivo: 'navegacao', tentativas: 0 };
        } else if (s.resetCameraToken !== p.resetCameraToken) {
          pedido.current = { motivo: 'reset', tentativas: 0 };
        }
        if (s.ocupacaoInterface !== p.ocupacaoInterface) reenquadrar.current = true;
      }),
    [],
  );

  useEffect(() => {
    reenquadrar.current = true;
  }, [size.width, size.height]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const aoComecar = () => {
      ultimaInteracao.current = performance.now();
      const e = estado.current;
      if (e.tipo !== 'voo') return;
      if (e.destino.alvoId && posicaoDoDestino(e.destino, v1)) residuo.current.copy(medida.current.alvo).sub(v1);
      estado.current = e.destino.alvoId ? { tipo: 'seguindo', destino: e.destino } : { tipo: 'livre', destino: e.destino };
      aplicarLimites(c, e.destino.limites);
      distanciaPadrao.current = e.destino.distancia;
      useOrbita.getState().setTransicao(false);
    };
    const aoControlar = () => {
      ultimaInteracao.current = performance.now();
    };
    c.addEventListener('controlstart', aoComecar);
    c.addEventListener('control', aoControlar);
    return () => {
      c.removeEventListener('controlstart', aoComecar);
      c.removeEventListener('control', aoControlar);
      cortina.opacidade = 0;
      useOrbita.getState().setTransicao(false);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __orbitaCamera?: unknown };
    w.__orbitaCamera = { controles: ref.current, camera, estado, medida, registro };
    return () => {
      delete w.__orbitaCamera;
    };
  }, [camera]);

  useFrame((estadoR3F, dtBruto) => {
    const c = ref.current;
    if (!c) return;
    const dt = Math.min(Math.max(dtBruto, 0), 0.1);
    const agora = estadoR3F.clock.elapsedTime;
    const s = useOrbita.getState();
    const ctx: ContextoEnquadramento = {
      fov: camera.fov,
      largura: size.width,
      altura: size.height,
      ocupacao: s.ocupacaoInterface,
      azimuteAtual: c.azimuthAngle,
    };

    medir(c, dt);
    rastrear(dt);
    atualizarDeslocamento(dt, s.movimentoReduzido);

    if (pedido.current) atenderPedido(c, ctx, agora, s.movimentoReduzido);

    const e = estado.current;
    switch (e.tipo) {
      case 'voo':
        atualizarVoo(c, e, agora);
        break;
      case 'fade':
        atualizarFade(c, e, agora, ctx);
        break;
      case 'seguindo':
        seguir(c, e.destino, dt);
        break;
      case 'livre':
        if (!s.movimentoReduzido && s.modo === 'visao-geral' && performance.now() - ultimaInteracao.current > OCIOSO_PARA_GIRAR_MS) {
          void c.rotate(GIRO_AUTOMATICO * dt, 0, false);
        }
        break;
    }

    if (reenquadrar.current && (e.tipo === 'seguindo' || e.tipo === 'livre')) {
      reenquadrar.current = false;
      reenquadrarDestino(c, e, ctx);
    }

    ajustarPlanoProximo(c);
  }, PRIORIDADE.camera);

  function medir(c: CameraControlsImpl, dt: number) {
    const m = medida.current;
    c.getTarget(v1, false);
    const az = c.azimuthAngle;
    const polar = c.polarAngle;
    const logDist = Math.log(Math.max(c.distance, 1e-6));
    if (m.valido && dt > 1e-4) {
      const k = 0.5;
      m.vAlvo.lerp(v2.subVectors(v1, m.alvo).divideScalar(dt), k);
      m.vAz += (diferencaAngular(az, m.az) / dt - m.vAz) * k;
      m.vPolar += ((polar - m.polar) / dt - m.vPolar) * k;
      m.vLogDist += ((logDist - m.logDist) / dt - m.vLogDist) * k;
    } else {
      m.vAlvo.set(0, 0, 0);
      m.vAz = m.vPolar = m.vLogDist = 0;
    }
    m.alvo.copy(v1);
    m.az = az;
    m.polar = polar;
    m.logDist = logDist;
    m.valido = true;
  }

  function rastrear(dt: number) {
    const e = estado.current;
    const id = e.tipo === 'parado' ? null : e.destino.alvoId;
    const r = rastro.current;
    const entrada = registro.obter(id);
    if (!entrada) {
      r.valido = false;
      r.vel.set(0, 0, 0);
      r.id = id;
      return;
    }
    entrada.objeto.getWorldPosition(v1);
    if (r.valido && r.id === id && dt > 1e-4) r.vel.subVectors(v1, r.pos).divideScalar(dt);
    else r.vel.set(0, 0, 0);
    r.pos.copy(v1);
    r.id = id;
    r.valido = true;
  }

  function atualizarDeslocamento(dt: number, reduzido: boolean) {
    const d = deslocamento.current;
    const { width: largura, height: altura } = size;
    const alvo = deslocamentoCentro(useOrbita.getState().ocupacaoInterface, largura, altura);
    const k = reduzido ? 1 : 1 - Math.exp(-dt * 5);
    const dx = d.dx + (alvo.dx - d.dx) * k;
    const dy = d.dy + (alvo.dy - d.dy) * k;
    const mudou = Math.abs(dx - d.dx) > 0.01 || Math.abs(dy - d.dy) > 0.01 || largura !== d.largura || altura !== d.altura;
    if (!mudou) return;
    Object.assign(d, { dx, dy, largura, altura });
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && alvo.dx === 0 && alvo.dy === 0) {
      if (camera.view?.enabled) camera.clearViewOffset();
    } else {
      camera.setViewOffset(largura, altura, -dx, -dy, largura, altura);
    }
  }

  function atenderPedido(c: CameraControlsImpl, ctx: ContextoEnquadramento, agora: number, reduzido: boolean) {
    const p = pedido.current!;
    const s = useOrbita.getState();
    let destino = calcularDestino(s, ctx);
    if (!destino) {
      if (++p.tentativas < 90) return;
      destino = destinoVisaoGeral(ctx);
    }
    pedido.current = null;

    if (p.motivo === 'entrada') {
      const geral = destinoVisaoGeral(ctx);
      aplicarPose(c, geral.alvoFixo, geral.azimute - 1.1, 0.42, geral.distancia * 3.2);
      medida.current.valido = false;
      medir(c, 0);
      if (reduzido) {
        if (posicaoDoDestino(destino, v1)) aplicarPose(c, v1, destino.azimute, destino.polar, destino.distancia);
        concluir(c, destino);
      } else {
        iniciarVoo(c, destino, agora, DURACAO_ENTRADA);
      }
      return;
    }
    if (reduzido) iniciarFade(c, destino, agora);
    else iniciarVoo(c, destino, agora);
  }

  function iniciarVoo(c: CameraControlsImpl, destino: Destino, agora: number, duracaoFixa?: number) {
    const m = medida.current;
    if (!posicaoDoDestino(destino, v1)) return;
    const deslocamentoAlvo = m.alvo.distanceTo(v1);
    const d0 = Math.exp(m.logDist);
    const d1 = destino.distancia;
    estado.current = {
      tipo: 'voo',
      inicio: agora,
      duracao: duracaoFixa ?? duracaoVoo(deslocamentoAlvo, d0, d1),
      de: copiarMedida(m),
      destino,
      azDestino: anguloMaisProximo(destino.azimute, m.az),
      afastamento: amplitudeAfastamento(deslocamentoAlvo, d0, d1),
      elevacao: elevacaoExtra(deslocamentoAlvo, d0, d1),
      contorno: desvioDoCaminho(m.alvo, v1, destino.alvoId, new Vector3()),
    };
    residuo.current.set(0, 0, 0);
    cortina.opacidade = 0;
    liberarLimites(c);
    useOrbita.getState().setTransicao(true);
  }

  function atualizarVoo(c: CameraControlsImpl, e: Extract<Estado, { tipo: 'voo' }>, agora: number) {
    if (!posicaoDoDestino(e.destino, v1)) {
      pedido.current = { motivo: 'navegacao', tentativas: 0 };
      return;
    }
    const u = Math.min(1, Math.max(0, (agora - e.inicio) / e.duracao));
    const D = e.duracao;
    const de = e.de;
    const vFim = e.destino.alvoId && rastro.current.id === e.destino.alvoId ? rastro.current.vel : v2.set(0, 0, 0);
    alvoVoo.set(
      hermite(de.alvo.x, de.vAlvo.x * D, v1.x, vFim.x * D, u),
      hermite(de.alvo.y, de.vAlvo.y * D, v1.y, vFim.y * D, u),
      hermite(de.alvo.z, de.vAlvo.z * D, v1.z, vFim.z * D, u),
    );
    const b = lombada(u);
    alvoVoo.addScaledVector(e.contorno, b);
    const az = hermite(de.az, de.vAz * D, e.azDestino, 0, u);
    const polar = hermite(de.polar, de.vPolar * D, e.destino.polar, 0, u) - e.elevacao * b;
    const logDist = hermite(de.logDist, de.vLogDist * D, Math.log(e.destino.distancia), 0, u) + e.afastamento * b;
    const entrada = Math.min(1, u / 0.3);
    const pesoCaminho = entrada * entrada * (3 - 2 * entrada);
    const distancia = Math.exp(logDist) + AFASTAMENTO_POR_CAMINHO * alvoVoo.distanceTo(v1) * pesoCaminho;
    const pesoDesvio = 1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)) ** 2;
    const d = e.destino;
    const pf = posFinalVoo.set(
      v1.x + d.distancia * Math.sin(d.polar) * Math.sin(d.azimute),
      v1.y + d.distancia * Math.cos(d.polar),
      v1.z + d.distancia * Math.sin(d.polar) * Math.cos(d.azimute),
    );
    aplicarPose(c, alvoVoo, az, polar, distancia, { exceto: d.alvoId, peso: pesoDesvio, posFinal: pf });
    if (u >= 1) concluir(c, e.destino);
  }

  function iniciarFade(c: CameraControlsImpl, destino: Destino, agora: number) {
    estado.current = { tipo: 'fade', inicio: agora, fase: 'saindo', destino };
    c.enabled = false;
    useOrbita.getState().setTransicao(true);
  }

  function atualizarFade(c: CameraControlsImpl, e: Extract<Estado, { tipo: 'fade' }>, agora: number, ctx: ContextoEnquadramento) {
    const t = agora - e.inicio;
    if (e.fase === 'saindo') {
      cortina.opacidade = Math.min(1, t / FADE_SAIDA);
      if (t < FADE_SAIDA) return;
      const destino = calcularDestino(useOrbita.getState(), ctx) ?? e.destino;
      if (posicaoDoDestino(destino, v1)) aplicarPose(c, v1, destino.azimute, destino.polar, destino.distancia);
      aplicarLimites(c, destino.limites);
      estado.current = { tipo: 'fade', inicio: agora, fase: 'entrando', destino };
      return;
    }
    cortina.opacidade = Math.max(0, 1 - t / FADE_ENTRADA);
    seguir(c, e.destino, 0);
    if (t >= FADE_ENTRADA) concluir(c, e.destino);
  }

  function concluir(c: CameraControlsImpl, destino: Destino) {
    estado.current = destino.alvoId ? { tipo: 'seguindo', destino } : { tipo: 'livre', destino };
    residuo.current.set(0, 0, 0);
    cortina.opacidade = 0;
    c.enabled = true;
    aplicarLimites(c, destino.limites);
    distanciaPadrao.current = destino.distancia;
    ultimaInteracao.current = performance.now();
    useOrbita.getState().setTransicao(false);
  }

  function seguir(c: CameraControlsImpl, destino: Destino, dt: number) {
    if (!destino.alvoId) return;
    if (!posicaoDoDestino(destino, v1)) {
      pedido.current = { motivo: 'navegacao', tentativas: 0 };
      return;
    }
    const r = residuo.current;
    if (dt > 0) r.multiplyScalar(Math.exp(-dt * 3));
    void c.moveTo(v1.x + r.x, v1.y + r.y, v1.z + r.z, false);
  }

  function reenquadrarDestino(c: CameraControlsImpl, e: Extract<Estado, { tipo: 'seguindo' | 'livre' }>, ctx: ContextoEnquadramento) {
    const novo = calcularDestino(useOrbita.getState(), ctx);
    if (!novo || novo.alvoId !== e.destino.alvoId) return;
    const anterior = distanciaPadrao.current;
    if (anterior > 0 && Math.abs(c.distance - anterior) / anterior < 0.08) {
      aplicarLimites(c, novo.limites);
      void c.dollyTo(novo.distancia, !useOrbita.getState().movimentoReduzido);
    } else {
      aplicarLimites(c, novo.limites);
    }
    distanciaPadrao.current = novo.distancia;
    e.destino = { ...e.destino, distancia: novo.distancia, limites: novo.limites };
  }

  function ajustarPlanoProximo(c: CameraControlsImpl) {
    const e = estado.current;
    const alvo = e.tipo === 'parado' ? undefined : registro.obter(e.destino.alvoId);
    const dist = c.distance;
    const superficie = Math.max(dist - (alvo?.raio ?? 0), dist * 0.02);
    const near = Math.min(Math.max(Math.min(superficie * 0.35, dist * 0.02), 0.0005), 1);
    if (Math.abs(camera.near - near) / near > 0.1) {
      camera.near = near;
      camera.updateProjectionMatrix();
    }
  }

  return <CameraControls ref={ref} makeDefault smoothTime={0.3} draggingSmoothTime={0.12} />;
}
