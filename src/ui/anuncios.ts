import { getBody } from '@/data';
import type { OrbitaState } from '@/state/store';
import { aNome, deNome, formatarVelocidade } from './formatacao';

/** Texto para a região aria-live a partir da mudança de estado (ou null se nada a anunciar). */
export function mensagemDeMudanca(s: OrbitaState, anterior: OrbitaState): string | null {
  if (s.selecionado !== anterior.selecionado || s.modo !== anterior.modo) {
    if (!s.selecionado) return 'Visão geral do Sistema Solar';
    const corpo = getBody(s.selecionado);
    if (!corpo) return null;
    if (s.modo === 'luas') return `Explorando as luas ${deNome(corpo)}`;
    if (anterior.modo === 'luas' && anterior.selecionado === s.selecionado) {
      return `De volta ${aNome(corpo)}`;
    }
    return `Astro selecionado: ${corpo.nome}. ${corpo.conteudo.classificacao}.`;
  }
  if (s.simulacaoPausada !== anterior.simulacaoPausada) {
    return s.simulacaoPausada ? 'Simulação pausada' : 'Simulação retomada';
  }
  if (s.velocidade !== anterior.velocidade) {
    return `Velocidade da simulação: ${formatarVelocidade(s.velocidade)}`;
  }
  if (s.rotacaoAstroPausada !== anterior.rotacaoAstroPausada) {
    return s.rotacaoAstroPausada ? 'Rotação do astro pausada' : 'Rotação do astro retomada';
  }
  if (s.mostrarOrbitas !== anterior.mostrarOrbitas) {
    return s.mostrarOrbitas ? 'Órbitas visíveis' : 'Órbitas ocultas';
  }
  if (s.mostrarNomes !== anterior.mostrarNomes) {
    return s.mostrarNomes ? 'Nomes visíveis' : 'Nomes ocultos';
  }
  if (s.resetCameraToken !== anterior.resetCameraToken) return 'Câmera restaurada';
  return null;
}
