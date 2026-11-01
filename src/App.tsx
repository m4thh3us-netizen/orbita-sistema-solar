import { lazy, Suspense, useState } from 'react';
import { detectarWebGL, OrbitaCanvas } from '@/scene';
import { Interface } from '@/ui/Interface';
import { LimiteDeErro } from '@/ui/LimiteDeErro';
import { Loader } from '@/ui/Loader';

const Fallback = lazy(() => import('@/fallback/Fallback'));

function webglDisponivel(): boolean {
  if (new URLSearchParams(window.location.search).has('sem-3d')) return false;
  try {
    return detectarWebGL();
  } catch {
    return false;
  }
}

function ModoCatalogo() {
  return (
    <Suspense fallback={null}>
      <Fallback />
    </Suspense>
  );
}

export default function App() {
  const [temWebGL] = useState(webglDisponivel);

  if (!temWebGL) return <ModoCatalogo />;

  return (
    <LimiteDeErro alternativa={<ModoCatalogo />}>
      <div className="camada-cena">
        <OrbitaCanvas />
      </div>
      <Interface />
      <Loader />
    </LimiteDeErro>
  );
}
