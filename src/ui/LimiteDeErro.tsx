import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  alternativa: ReactNode;
  children: ReactNode;
}

export class LimiteDeErro extends Component<Props, { erro: boolean }> {
  state = { erro: false };

  static getDerivedStateFromError() {
    return { erro: true };
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.error('[Órbita] A cena 3D falhou; usando o modo catálogo.', erro, info.componentStack);
  }

  render() {
    return this.state.erro ? this.props.alternativa : this.props.children;
  }
}
