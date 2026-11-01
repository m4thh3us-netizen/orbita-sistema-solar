import type { StoreApi } from 'zustand';
import type { OrbitaState, Velocidade } from './store';

export const CHAVE_PREFERENCIAS = 'orbita:preferencias';

export interface Preferencias {
  mostrarOrbitas: boolean;
  mostrarNomes: boolean;
  velocidade: Velocidade;
}

const VELOCIDADES_VALIDAS: readonly number[] = [0.25, 1, 4, 16];

function obterStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function lerPreferencias(storage: Storage | null = obterStorage()): Partial<Preferencias> {
  if (!storage) return {};
  try {
    const bruto = storage.getItem(CHAVE_PREFERENCIAS);
    if (!bruto) return {};
    const dados: unknown = JSON.parse(bruto);
    if (typeof dados !== 'object' || dados === null) return {};
    const registro = dados as Record<string, unknown>;
    const resultado: Partial<Preferencias> = {};
    if (typeof registro.mostrarOrbitas === 'boolean') {
      resultado.mostrarOrbitas = registro.mostrarOrbitas;
    }
    if (typeof registro.mostrarNomes === 'boolean') resultado.mostrarNomes = registro.mostrarNomes;
    if (
      typeof registro.velocidade === 'number' &&
      VELOCIDADES_VALIDAS.includes(registro.velocidade)
    ) {
      resultado.velocidade = registro.velocidade as Velocidade;
    }
    return resultado;
  } catch {
    return {};
  }
}

export function salvarPreferencias(
  preferencias: Preferencias,
  storage: Storage | null = obterStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias));
  } catch {
    return;
  }
}

export function iniciarPersistencia(
  store: StoreApi<OrbitaState>,
  storage: Storage | null = obterStorage(),
): () => void {
  return store.subscribe((s, anterior) => {
    if (
      s.mostrarOrbitas === anterior.mostrarOrbitas &&
      s.mostrarNomes === anterior.mostrarNomes &&
      s.velocidade === anterior.velocidade
    ) {
      return;
    }
    salvarPreferencias(
      { mostrarOrbitas: s.mostrarOrbitas, mostrarNomes: s.mostrarNomes, velocidade: s.velocidade },
      storage,
    );
  });
}
