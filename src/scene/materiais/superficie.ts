import { Color, MeshStandardMaterial, Vector4, type IUniform } from 'three';
import type { CelestialBody } from '@/data/types';
import type { EstiloSuperficie, TipoSuperficie } from '../estilos';
import { hashTexto } from '../orbitas';
import { GLSL_RUIDO } from './glsl';

const INDICE_ESTILO: Record<TipoSuperficie, number> = { rochoso: 0, gasoso: 1, gelo: 2, vulcanico: 3 };
const GRAUS = Math.PI / 180;

const GLSL_DEFORMACAO = /* glsl */ `
uniform float uDeformacao;
uniform float uSemente;
varying vec3 vPosObj;
vec3 orb_deformar(vec3 p) {
  return p * (1.0 + uDeformacao * orb_fbm(p * 1.3 + uSemente, 3));
}
vec3 orb_normalDeformada(vec3 p) {
  vec3 n = normalize(p);
  vec3 t = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 b = cross(n, t);
  vec3 p0 = orb_deformar(p);
  vec3 p1 = orb_deformar(normalize(p + t * 0.02));
  vec3 p2 = orb_deformar(normalize(p + b * 0.02));
  return normalize(cross(p1 - p0, p2 - p0));
}
`;

const GLSL_SUPERFICIE = /* glsl */ `
uniform int uEstilo;
uniform vec3 uCorBase;
uniform vec3 uCor2;
uniform float uContraste;
uniform float uSemente;
uniform float uFaixas;
uniform float uTurbulencia;
uniform float uMares;
uniform float uCalotas;
uniform float uFissuras;
uniform vec4 uMancha;
uniform vec3 uCorMancha;
varying vec3 vPosObj;

float orb_difAngulo(float a, float b) {
  float d = a - b;
  return atan(sin(d), cos(d));
}

vec3 orb_rochoso(vec3 p) {
  float n = orb_fbm(p * 2.4 + uSemente, 5);
  float grande = orb_fbm(p * 0.9 + uSemente * 1.7, 3);
  float crateras = pow(1.0 - abs(orb_snoise(p * 9.0 + uSemente)), 7.0);
  vec3 c = uCorBase * (1.0 + uContraste * (n * 0.9 + crateras * 0.3));
  c = mix(c, uCor2, smoothstep(0.02, 0.32, grande) * uMares * 0.7);
  if (uCalotas > 0.0) {
    float lat = abs(p.y) + n * 0.04;
    c = mix(c, vec3(0.86, 0.87, 0.9), smoothstep(1.0 - uCalotas, 1.0 - uCalotas + 0.03, lat));
  }
  return c;
}

vec3 orb_gasoso(vec3 p) {
  float lat = p.y;
  float desvio = orb_fbm(vec3(p.x * 1.6, p.y * 5.0, p.z * 1.6) + uSemente, 4) * uTurbulencia;
  float faixa = sin((lat + desvio * 0.06) * uFaixas * 3.14159) * 0.5 + 0.5;
  float fino = orb_snoise(vec3(p.x * 2.5, p.y * 45.0, p.z * 2.5) + uSemente);
  float t = smoothstep(0.15, 0.85, faixa + fino * 0.12 * uContraste);
  vec3 c = mix(mix(uCorBase, uCor2, uContraste), uCorBase, t);
  c *= 1.0 + fino * 0.06 * uContraste;
  c *= mix(1.0, 0.72, smoothstep(0.65, 1.0, abs(lat)));
  if (uMancha.z > 0.0) {
    float latR = asin(clamp(p.y, -1.0, 1.0));
    float lonR = atan(p.z, p.x);
    vec2 d = vec2(orb_difAngulo(lonR, uMancha.y) * cos(latR) / uMancha.z, (latR - uMancha.x) / uMancha.w);
    float r = length(d);
    float redemoinho = orb_snoise(vec3(d * 2.5, uSemente)) * 0.12;
    float nucleo = 1.0 - smoothstep(0.55, 1.0, r + redemoinho);
    float borda = smoothstep(0.85, 1.0, r) * (1.0 - smoothstep(1.0, 1.35, r));
    c = mix(c, uCorMancha * (0.8 + 0.35 * (1.0 - r)), nucleo);
    c = mix(c, uCorBase * 1.15, borda * 0.45);
  }
  return c;
}

vec3 orb_gelo(vec3 p) {
  float n = orb_fbm(p * 3.0 + uSemente, 4);
  vec3 c = uCorBase * (1.0 + n * uContraste * 0.6);
  float l1 = pow(1.0 - abs(orb_snoise(p * 4.0 + uSemente * 3.0)), 18.0);
  float l2 = pow(1.0 - abs(orb_snoise(p * 7.5 - uSemente)), 26.0);
  return mix(c, uCor2, clamp((l1 + l2 * 0.7) * uFissuras, 0.0, 1.0));
}

vec3 orb_vulcanico(vec3 p) {
  float n = orb_fbm(p * 2.5 + uSemente, 5);
  vec3 c = mix(uCorBase, uCor2, smoothstep(-0.25, 0.45, n));
  float s = orb_snoise(p * 6.0 + uSemente);
  float halo = smoothstep(0.3, 0.5, s) - smoothstep(0.55, 0.68, s);
  c = mix(c, vec3(0.55, 0.22, 0.07), halo * 0.45);
  return mix(c, vec3(0.06, 0.04, 0.03), smoothstep(0.58, 0.7, s) * 0.85);
}

vec3 orb_superficie(vec3 p) {
  if (uEstilo == 1) return orb_gasoso(p);
  if (uEstilo == 2) return orb_gelo(p);
  if (uEstilo == 3) return orb_vulcanico(p);
  return orb_rochoso(p);
}
`;

export interface MaterialSuperficie extends MeshStandardMaterial {
  userData: { uniforms: Record<string, IUniform> };
}

export function criarMaterialSuperficie(corpo: CelestialBody, estilo: EstiloSuperficie): MaterialSuperficie {
  const base = new Color(corpo.aparencia.corBase);
  const cor2 = estilo.cor2 ? new Color(estilo.cor2) : base.clone().multiplyScalar(0.55);
  const mancha = estilo.mancha;
  const uniforms: Record<string, IUniform> = {
    uEstilo: { value: INDICE_ESTILO[estilo.tipo] },
    uCorBase: { value: base },
    uCor2: { value: cor2 },
    uContraste: { value: estilo.contraste },
    uSemente: { value: (hashTexto(corpo.id) % 1000) / 37 },
    uFaixas: { value: estilo.faixas ?? 8 },
    uTurbulencia: { value: estilo.turbulencia ?? 0.5 },
    uMares: { value: estilo.mares ?? 0 },
    uCalotas: { value: estilo.calotas ?? 0 },
    uFissuras: { value: estilo.fissuras ?? 0 },
    uMancha: {
      value: mancha
        ? new Vector4(mancha.latGraus * GRAUS, mancha.lonGraus * GRAUS, (mancha.larguraGraus / 2) * GRAUS, (mancha.alturaGraus / 2) * GRAUS)
        : new Vector4(0, 0, 0, 0),
    },
    uCorMancha: { value: new Color(mancha?.cor ?? '#000000') },
    uDeformacao: { value: estilo.deformacao ?? 0 },
  };

  const material = new MeshStandardMaterial({
    color: 0xffffff,
    roughness: estilo.rugosidade ?? 0.93,
    metalness: 0,
  }) as MaterialSuperficie;

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      GLSL_RUIDO +
      GLSL_DEFORMACAO +
      shader.vertexShader
        .replace(
          '#include <beginnormal_vertex>',
          `#include <beginnormal_vertex>
          if (uDeformacao > 0.0) objectNormal = orb_normalDeformada(position);`,
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vPosObj = position;
          if (uDeformacao > 0.0) transformed = orb_deformar(position);`,
        );
    shader.fragmentShader =
      GLSL_RUIDO +
      GLSL_SUPERFICIE +
      shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
          diffuseColor *= texture2D(map, vMapUv);
        #else
          diffuseColor.rgb *= orb_superficie(normalize(vPosObj));
        #endif`,
      );
  };
  material.customProgramCacheKey = () => 'orbita-superficie-v1';
  material.userData.uniforms = uniforms;
  return material;
}
