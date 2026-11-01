import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource-variable/jetbrains-mono';
import './ui/tokens.css';
import './ui/base.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { iniciarMovimentoReduzido } from './state/movimento';
import { iniciarPersistencia } from './state/preferencias';
import { useOrbita } from './state/store';
import { iniciarSincronizacaoURL } from './state/url';
import { iniciarAtributosDocumento } from './ui/documento';

// Antes do primeiro render: um link direto (#/saturno/tita) já abre no astro certo.
iniciarSincronizacaoURL(useOrbita);
iniciarPersistencia(useOrbita);
iniciarMovimentoReduzido(useOrbita);
iniciarAtributosDocumento(useOrbita);

const raiz = document.getElementById('root');
if (!raiz) throw new Error('Elemento #root não encontrado.');

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
