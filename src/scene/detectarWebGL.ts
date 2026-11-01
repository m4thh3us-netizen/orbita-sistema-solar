/** O three.js atual exige WebGL 2; sem ele a interface mostra o fallback. */
export function detectarWebGL(): boolean {
  try {
    if (typeof window === 'undefined' || !('WebGL2RenderingContext' in window)) return false;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
