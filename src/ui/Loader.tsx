import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { useInterface } from '@/state/interface';
import './Loader.css';

/** Tempo mínimo na tela: dá tempo de a cena registrar as texturas e evita um piscar. */
const MINIMO_MS = 900;
/** Se algo travar (textura que nunca responde), a interface não fica refém do loader. */
const LIMITE_MS = 15000;

/**
 * Loader inicial com a identidade do Órbita, ligado ao `useProgress` do Drei
 * (DefaultLoadingManager do three). Sai com fade e libera a introdução.
 */
export function Loader() {
  const { active, progress } = useProgress();
  const setCarregado = useInterface((s) => s.setCarregado);
  const [minimoCumprido, setMinimoCumprido] = useState(false);
  const [estourou, setEstourou] = useState(false);
  const [removido, setRemovido] = useState(false);

  useEffect(() => {
    const minimo = window.setTimeout(() => setMinimoCumprido(true), MINIMO_MS);
    const limite = window.setTimeout(() => setEstourou(true), LIMITE_MS);
    return () => {
      window.clearTimeout(minimo);
      window.clearTimeout(limite);
    };
  }, []);

  const saindo = estourou || (minimoCumprido && !active);

  useEffect(() => {
    if (!saindo) return;
    setCarregado();
    // Remove do DOM depois do fade (com folga para --duracao-media).
    const t = window.setTimeout(() => setRemovido(true), 700);
    return () => window.clearTimeout(t);
  }, [saindo, setCarregado]);

  if (removido) return null;

  const porcentagem = Math.round(saindo ? 100 : progress);

  return (
    <div className={`loader${saindo ? ' loader--saindo' : ''}`} aria-hidden={saindo}>
      <div className="loader__centro" role="status" aria-live="polite">
        <svg className="loader__orbita" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
          <circle cx="60" cy="60" r="44" className="loader__trilha" />
          <circle cx="60" cy="60" r="11" className="loader__estrela" />
          <g className="loader__satelite">
            <circle cx="104" cy="60" r="3.5" />
          </g>
        </svg>
        <p className="loader__marca">Órbita</p>
        <p className="loader__texto mono">
          <span>Preparando o Sistema Solar</span>
          <span className="loader__porcentagem">{String(porcentagem).padStart(3, '0')}%</span>
        </p>
        <div
          className="loader__barra"
          role="progressbar"
          aria-label="Carregando"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={porcentagem}
        >
          <span style={{ transform: `scaleX(${porcentagem / 100})` }} />
        </div>
      </div>
    </div>
  );
}
