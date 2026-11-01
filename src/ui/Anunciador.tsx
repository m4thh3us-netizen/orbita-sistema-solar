import { useEffect, useState } from 'react';
import { useOrbita } from '@/state/store';
import { mensagemDeMudanca } from './anuncios';

const ESPACO_INSEPARAVEL = String.fromCharCode(0xa0);

export function Anunciador() {
  const [mensagem, setMensagem] = useState('');

  useEffect(
    () =>
      useOrbita.subscribe((s, anterior) => {
        const nova = mensagemDeMudanca(s, anterior);
        if (nova) setMensagem((atual) => (atual === nova ? `${nova}${ESPACO_INSEPARAVEL}` : nova));
      }),
    [],
  );

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {mensagem}
    </div>
  );
}
