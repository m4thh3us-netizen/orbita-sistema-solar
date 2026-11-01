/**
 * Sol: superfície emissiva em HDR (acima do limiar do bloom), com granulação animada por
 * ruído simplex, manchas sutis e escurecimento de borda. A coroa é um quad voltado para
 * a câmera com brilho radial aditivo; ela faz o Sol "brilhar" mesmo sem bloom (qualidade baixa).
 */
import { AdditiveBlending, Color, ShaderMaterial } from 'three';
import { GLSL_RUIDO, GLSL_VERTICE_MUNDO } from './glsl';

const FRAGMENTO_SOL = /* glsl */ `
uniform float uTempo;
uniform float uIntensidade;
uniform vec3 uCorQuente;
uniform vec3 uCorFria;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vPosObj;
varying vec2 vUv;

void main() {
  vec3 p = normalize(vPosObj);
  float t = uTempo;
  float celulas = orb_fbm(p * 3.5 + vec3(0.0, t * 0.025, t * 0.015), 4);
  float granulos = orb_snoise(p * 22.0 + vec3(t * 0.12, -t * 0.08, t * 0.1));
  float manchas = smoothstep(0.62, 0.78, orb_snoise(p * 2.2 + vec3(t * 0.004)));
  float mu = clamp(dot(normalize(vNormalW), normalize(cameraPosition - vPosW)), 0.0, 1.0);
  float borda = 0.38 + 0.62 * pow(mu, 0.5);
  float calor = clamp(0.55 + celulas * 0.55 + granulos * 0.12, 0.0, 1.0);
  vec3 cor = mix(uCorFria, uCorQuente, calor);
  cor *= 1.0 - manchas * 0.45;
  cor *= borda * uIntensidade;
  gl_FragColor = vec4(cor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const VERTICE_COROA = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENTO_COROA = /* glsl */ `
uniform float uTempo;
uniform float uRaioRelativo;
uniform float uIntensidade;
uniform vec3 uCor;
varying vec2 vUv;

void main() {
  vec2 c = vUv * 2.0 - 1.0;
  float r = length(c);
  if (r > 1.0) discard;
  float a = atan(c.y, c.x);
  // Distância a partir da borda do disco, normalizada para [0, 1] até o fim do quad.
  float x = clamp((r - uRaioRelativo) / (1.0 - uRaioRelativo), 0.0, 1.0);
  float raios = 0.8 + 0.2 * orb_snoise(vec3(cos(a) * 2.0, sin(a) * 2.0, uTempo * 0.05));
  float brilho = pow(1.0 - x, 5.0) * raios + pow(1.0 - x, 14.0) * 1.5;
  brilho *= smoothstep(1.0, 0.85, r);
  gl_FragColor = vec4(uCor * brilho * uIntensidade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function criarMaterialSol(corBase: string): ShaderMaterial {
  const quente = new Color('#fff1d6');
  const fria = new Color(corBase).lerp(new Color('#ff6a1a'), 0.45);
  return new ShaderMaterial({
    uniforms: {
      uTempo: { value: 0 },
      uIntensidade: { value: 3.2 },
      uCorQuente: { value: quente },
      uCorFria: { value: fria },
    },
    vertexShader: GLSL_VERTICE_MUNDO,
    fragmentShader: GLSL_RUIDO + FRAGMENTO_SOL,
  });
}

/** `raioRelativo`: raio do disco solar dividido pela metade do lado do quad. */
export function criarMaterialCoroa(corBase: string, raioRelativo: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uTempo: { value: 0 },
      uRaioRelativo: { value: raioRelativo },
      uIntensidade: { value: 1.4 },
      uCor: { value: new Color(corBase).lerp(new Color('#ffd9a0'), 0.4) },
    },
    vertexShader: VERTICE_COROA,
    fragmentShader: GLSL_RUIDO + FRAGMENTO_COROA,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}
