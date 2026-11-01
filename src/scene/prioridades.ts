/**
 * Ordem dos `useFrame` (prioridades negativas não desligam a renderização automática):
 * relógio → posições dos astros → câmera → CameraControls do Drei (−1) → efeitos que
 * dependem da câmera final (rótulos, colisores, destaque, estrelas).
 */
export const PRIORIDADE = {
  relogio: -5,
  corpos: -4,
  camera: -3,
  aposCamera: 0,
} as const;
