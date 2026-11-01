import { NormalBlending, ShaderMaterial, Vector3, type Texture } from 'three';
import { LUZ_AMBIENTE, LUZ_SOL } from './constantes';
import { GLSL_LUZ, GLSL_RUIDO, GLSL_VERTICE_MUNDO as VERTICE } from './glsl';

const FRAGMENTO_TERRA = /* glsl */ `
uniform sampler2D uDia;
uniform sampler2D uNoite;
uniform sampler2D uEspecular;
uniform float uTemDia;
uniform float uTemNoite;
uniform float uTemEspecular;
uniform vec3 uSolPos;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vPosObj;
varying vec2 vUv;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(uSolPos - vPosW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 p = normalize(vPosObj);
  float ndl = dot(N, L);

  // Procedural: continentes por fBm, deserto na faixa subtropical, gelo nos polos.
  float continente = orb_fbm(p * 1.7 + 3.1, 6) + 0.1 * orb_fbm(p * 7.0, 3);
  float solo = smoothstep(0.02, 0.05, continente);
  float lat = abs(p.y);
  float seco = smoothstep(0.05, 0.35, orb_fbm(p * 3.0 + 7.0, 3)) * (1.0 - smoothstep(0.3, 0.55, lat));
  float gelo = smoothstep(0.86, 0.89, lat + orb_snoise(p * 5.0) * 0.04);

  vec3 dia;
  if (uTemDia > 0.5) {
    dia = texture2D(uDia, vUv).rgb;
  } else {
    vec3 oceano = mix(vec3(0.004, 0.02, 0.07), vec3(0.01, 0.06, 0.13), smoothstep(-0.3, 0.02, continente));
    vec3 terreno = mix(vec3(0.05, 0.11, 0.03), vec3(0.42, 0.3, 0.16), seco);
    terreno = mix(terreno, vec3(0.22, 0.2, 0.16), smoothstep(0.55, 0.75, lat));
    dia = mix(oceano, terreno, solo);
    dia = mix(dia, vec3(0.8, 0.84, 0.88), gelo);
  }

  // Sem mapa especular: oceano é onde o azul domina o mapa diurno (ou o procedural).
  float oceano = uTemEspecular > 0.5
    ? texture2D(uEspecular, vUv).r
    : (uTemDia > 0.5 ? smoothstep(0.01, 0.06, dia.b - dia.r) : (1.0 - solo) * (1.0 - gelo));

  vec3 luzes = vec3(0.0);
  if (uTemNoite > 0.5) {
    luzes = texture2D(uNoite, vUv).rgb;
  } else if (uTemDia < 0.5) {
    // Cidades procedurais só fazem sentido sobre os continentes procedurais.
    float cidades = smoothstep(0.5, 0.85, orb_snoise(p * 55.0)) * smoothstep(0.1, 0.5, orb_snoise(p * 9.0 + 2.0));
    luzes = vec3(1.0, 0.68, 0.32) * cidades * solo * (1.0 - gelo) * (1.0 - seco * 0.8) * 0.9;
  }

  vec3 cor = dia * (max(ndl, 0.0) * uLuzSol + uAmbiente) / ORB_PI;

  // Terminador levemente quente (luz atravessando mais atmosfera).
  float terminador = smoothstep(-0.05, 0.2, ndl) * (1.0 - smoothstep(0.2, 0.55, ndl));
  cor *= mix(vec3(1.0), vec3(1.2, 0.88, 0.7), terminador * 0.35);

  vec3 H = normalize(L + V);
  float brilho = pow(max(dot(N, H), 0.0), 55.0) * oceano * smoothstep(0.0, 0.12, ndl);
  cor += vec3(1.0, 0.93, 0.82) * brilho * 0.22 * uLuzSol / ORB_PI;

  float noite = 1.0 - smoothstep(-0.2, 0.06, ndl);
  cor += luzes * noite;

  gl_FragColor = vec4(cor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const FRAGMENTO_NUVENS = /* glsl */ `
uniform sampler2D uNuvens;
uniform float uTemNuvens;
uniform vec3 uSolPos;
uniform float uOpacidade;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vPosObj;
varying vec2 vUv;

void main() {
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(uSolPos - vPosW);
  vec3 p = normalize(vPosObj);
  float ndl = dot(N, L);
  float a;
  if (uTemNuvens > 0.5) {
    a = texture2D(uNuvens, vUv).r;
  } else {
    vec3 q = p * 2.2 + vec3(orb_fbm(p * 1.5 + 11.0, 3), orb_fbm(p * 1.5 + 23.0, 3), 0.0) * 0.6;
    float n = orb_fbm(q, 5);
    // Menos nuvens nos subtrópicos, faixas na zona de convergência equatorial.
    float clima = 0.85 + 0.25 * cos(p.y * 9.0);
    a = smoothstep(0.05, 0.45, n * clima);
  }
  float luz = max(ndl, 0.0) * uLuzSol + uAmbiente * 0.6;
  vec3 cor = vec3(0.95) * luz / ORB_PI;
  gl_FragColor = vec4(cor, a * uOpacidade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export interface TexturasTerra {
  mapa: Texture | null;
  noite: Texture | null;
  especular: Texture | null;
}

const SOL_NA_ORIGEM = new Vector3(0, 0, 0);

export function criarMaterialTerra(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uDia: { value: null },
      uNoite: { value: null },
      uEspecular: { value: null },
      uTemDia: { value: 0 },
      uTemNoite: { value: 0 },
      uTemEspecular: { value: 0 },
      uSolPos: { value: SOL_NA_ORIGEM },
      uLuzSol: { value: LUZ_SOL },
      uAmbiente: { value: LUZ_AMBIENTE },
    },
    vertexShader: VERTICE,
    fragmentShader: GLSL_LUZ + GLSL_RUIDO + FRAGMENTO_TERRA,
  });
}

export function aplicarTexturasTerra(material: ShaderMaterial, t: TexturasTerra): void {
  const u = material.uniforms;
  u.uDia.value = t.mapa;
  u.uTemDia.value = t.mapa ? 1 : 0;
  u.uNoite.value = t.noite;
  u.uTemNoite.value = t.noite ? 1 : 0;
  u.uEspecular.value = t.especular;
  u.uTemEspecular.value = t.especular ? 1 : 0;
}

export function criarMaterialNuvens(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uNuvens: { value: null },
      uTemNuvens: { value: 0 },
      uSolPos: { value: SOL_NA_ORIGEM },
      uLuzSol: { value: LUZ_SOL },
      uAmbiente: { value: LUZ_AMBIENTE },
      uOpacidade: { value: 0.92 },
    },
    vertexShader: VERTICE,
    fragmentShader: GLSL_LUZ + GLSL_RUIDO + FRAGMENTO_NUVENS,
    transparent: true,
    depthWrite: false,
    blending: NormalBlending,
  });
}

export function aplicarTexturaNuvens(material: ShaderMaterial, nuvens: Texture | null): void {
  material.uniforms.uNuvens.value = nuvens;
  material.uniforms.uTemNuvens.value = nuvens ? 1 : 0;
}
