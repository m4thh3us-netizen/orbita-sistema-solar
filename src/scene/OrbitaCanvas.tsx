/**
 * Canvas em tela cheia (preenche o contêiner pai). Escondido da tecnologia assistiva:
 * o conteúdo acessível está na interface HTML. Trata perda de contexto WebGL: espera a
 * restauração do navegador; se ela não vier, recria o canvas (até 2 vezes) e, em último
 * caso, mostra uma mensagem curta.
 */
import { Canvas, type RootState } from '@react-three/fiber';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AgXToneMapping } from 'three';
import { configurarRenderer } from '@/assets/texturas';
import { Cena } from './Cena';
import { eventosOrbita } from './eventos';
import { COR_FUNDO } from './materiais/constantes';

const ESPERA_RESTAURACAO_MS = 2500;
const MAX_RECRIACOES = 2;

type Contexto = 'ok' | 'recuperando' | 'falhou';

class LimiteErroCena extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false };
  static getDerivedStateFromError() {
    return { erro: true };
  }
  componentDidCatch(erro: unknown) {
    console.error('[órbita] erro na cena 3D', erro);
  }
  render() {
    return this.state.erro ? null : this.props.children;
  }
}

export function OrbitaCanvas() {
  const [chave, setChave] = useState(0);
  const [contexto, setContexto] = useState<Contexto>('ok');
  const recriacoes = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limparEventos = useRef<(() => void) | null>(null);

  const limparTemporizador = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
  };

  const aoCriar = useCallback((estado: RootState) => {
    const { gl } = estado;
    configurarRenderer(gl);
    gl.toneMapping = AgXToneMapping;
    gl.toneMappingExposure = 1.05;

    const canvas = gl.domElement;
    const perdeu = (e: Event) => {
      e.preventDefault();
      setContexto('recuperando');
      limparTemporizador();
      temporizador.current = setTimeout(() => {
        if (recriacoes.current < MAX_RECRIACOES) {
          recriacoes.current++;
          setChave((k) => k + 1);
        } else {
          setContexto('falhou');
        }
      }, ESPERA_RESTAURACAO_MS);
    };
    const restaurou = () => {
      limparTemporizador();
      setContexto('ok');
    };
    limparEventos.current?.();
    canvas.addEventListener('webglcontextlost', perdeu);
    canvas.addEventListener('webglcontextrestored', restaurou);
    limparEventos.current = () => {
      canvas.removeEventListener('webglcontextlost', perdeu);
      canvas.removeEventListener('webglcontextrestored', restaurou);
    };
    setContexto('ok');
  }, []);

  useEffect(
    () => () => {
      limparTemporizador();
      limparEventos.current?.();
    },
    [],
  );

  return (
    <>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: COR_FUNDO }}>
        <Canvas
          key={chave}
          dpr={[1, 2]}
          camera={{ fov: 45, near: 0.05, far: 8000, position: [0, 120, 260] }}
          gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' }}
          events={eventosOrbita}
          onCreated={aoCriar}
          style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
        >
          <LimiteErroCena>
            <Cena />
          </LimiteErroCena>
        </Canvas>
      </div>
      {contexto !== 'ok' && (
        <p
          role="status"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '2rem',
            transform: 'translateX(-50%)',
            margin: 0,
            padding: '0.5rem 0.875rem',
            font: '0.8125rem/1.4 var(--fonte-mono, monospace)',
            color: 'var(--cor-texto, #E8E6E1)',
            background: 'rgba(5, 6, 10, 0.8)',
            border: 'var(--linha, 1px solid rgba(232, 230, 225, 0.16))',
            borderRadius: 'var(--raio, 4px)',
            pointerEvents: 'none',
          }}
        >
          {contexto === 'recuperando'
            ? 'A placa de vídeo reiniciou a cena 3D. Recuperando…'
            : 'Não foi possível recuperar a cena 3D. Recarregue a página para tentar de novo.'}
        </p>
      )}
    </>
  );
}
