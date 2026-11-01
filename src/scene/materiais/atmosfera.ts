/**
 * Atmosfera por fresnel aditivo, em duas cascas:
 * - halo: casca maior renderizada pelo lado de trás; brilha logo fora do limbo e some na
 *   borda da casca (o "anel" azul da Terra visto de longe);
 * - véu: casca rente à superfície; borda brilhante e, com densidade alta (Vênus, Titã),
 *   uma névoa que cobre o disco.
 * Ambas só brilham no lado iluminado.
 */
import { AdditiveBlending, BackSide, Color, FrontSide, ShaderMaterial, Vector3 } from 'three';
import { GLSL_VERTICE_MUNDO } from './glsl';

const FRAGMENTO_HALO = /* glsl */ `
uniform vec3 uCor;
uniform float uIntensidade;
uniform vec3 uSolPos;
uniform float uRazaoRaios;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vPosObj;
varying vec2 vUv;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uSolPos - vPosW);
  // Face de trás: N aponta para longe da câmera. mu = 0 na borda da casca.
  float mu = clamp(-dot(N, V), 0.0, 1.0);
  float muLimbo = sqrt(max(1.0 - uRazaoRaios * uRazaoRaios, 1e-4));
  float brilho = pow(clamp(mu / muLimbo, 0.0, 1.0), 3.0);
  float dia = smoothstep(-0.35, 0.4, dot(N, L));
  gl_FragColor = vec4(uCor * brilho * dia * uIntensidade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const FRAGMENTO_VEU = /* glsl */ `
uniform vec3 uCor;
uniform float uIntensidade;
uniform float uDensidade;
uniform vec3 uSolPos;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vPosObj;
varying vec2 vUv;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uSolPos - vPosW);
  float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  float dia = smoothstep(-0.25, 0.45, dot(N, L));
  float nevoa = uDensidade * (0.25 + 0.75 * max(dot(N, L), 0.0));
  gl_FragColor = vec4(uCor * (fresnel * 0.9 + nevoa * 0.35) * dia * uIntensidade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const SOL_NA_ORIGEM = new Vector3(0, 0, 0);

/** Densidade do véu sobre o disco: só atmosferas espessas (Vênus, Titã) cobrem o disco. */
export function densidadeVeu(intensidade: number): number {
  return Math.pow(Math.min(Math.max((intensidade - 0.6) / 0.4, 0), 1), 1.5);
}

/** Espessura da casca do halo em raios do planeta, a partir da intensidade (0–1). */
export function espessuraHalo(intensidade: number): number {
  return 1.04 + 0.08 * Math.min(Math.max(intensidade, 0), 1);
}

export function criarMaterialHalo(cor: string, intensidade: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uCor: { value: new Color(cor) },
      uIntensidade: { value: 0.35 + intensidade * 0.75 },
      uSolPos: { value: SOL_NA_ORIGEM },
      uRazaoRaios: { value: 1 / espessuraHalo(intensidade) },
    },
    vertexShader: GLSL_VERTICE_MUNDO,
    fragmentShader: FRAGMENTO_HALO,
    side: BackSide,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

/** `densidade` (0–1): 0 = só a borda; 1 = névoa opaca sobre o disco (Vênus). */
export function criarMaterialVeu(cor: string, intensidade: number, densidade: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uCor: { value: new Color(cor) },
      uIntensidade: { value: 0.25 + intensidade * 0.6 },
      uDensidade: { value: densidade },
      uSolPos: { value: SOL_NA_ORIGEM },
    },
    vertexShader: GLSL_VERTICE_MUNDO,
    fragmentShader: FRAGMENTO_VEU,
    side: FrontSide,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}
