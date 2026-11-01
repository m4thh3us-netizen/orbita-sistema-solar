/**
 * Anéis planetários. A geometria é um RingGeometry com UV radial (u = 0 na borda interna,
 * 1 na externa), então uma textura de faixa 1D (como as de anéis de Saturno com alfa) cai
 * no lugar certo. O shader ilumina os dois lados (o lado oposto ao Sol recebe só a luz que
 * atravessa) e, na qualidade alta, calcula a sombra do planeta de forma analítica:
 * o raio do fragmento em direção ao Sol intercepta a esfera do planeta?
 */
import { Color, DoubleSide, RingGeometry, ShaderMaterial, Vector3, type Texture } from 'three';
import { LUZ_AMBIENTE, LUZ_SOL } from './constantes';
import { GLSL_LUZ } from './glsl';

export function criarGeometriaAneis(interno: number, externo: number, segmentos = 192): RingGeometry {
  const g = new RingGeometry(interno, externo, segmentos, 1);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - interno) / (externo - interno), 0.5);
  }
  uv.needsUpdate = true;
  // RingGeometry nasce no plano XY; os anéis ficam no plano equatorial (XZ).
  g.rotateX(-Math.PI / 2);
  return g;
}

const VERTICE = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosW;
varying vec3 vNormalW;
void main() {
  vUv = uv;
  vec4 mundo = modelMatrix * vec4(position, 1.0);
  vPosW = mundo.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
`;

const FRAGMENTO = /* glsl */ `
uniform sampler2D uTextura;
uniform float uTexturaSemAlfa;
uniform vec3 uTinta;
uniform vec3 uSolPos;
uniform vec3 uCentroPlaneta;
uniform float uRaioPlaneta;
uniform float uSombra;
uniform float uOpacidade;
varying vec2 vUv;
varying vec3 vPosW;
varying vec3 vNormalW;

void main() {
  vec4 amostra = texture2D(uTextura, vec2(vUv.x, 0.5));
  float alfa = uTexturaSemAlfa > 0.5 ? dot(amostra.rgb, vec3(0.3333)) : amostra.a;
  if (alfa < 0.004) discard;
  vec3 cor = amostra.rgb * uTinta;

  vec3 N = normalize(vNormalW);
  vec3 L = normalize(uSolPos - vPosW);
  vec3 V = normalize(cameraPosition - vPosW);
  float ladoLuz = dot(N, L);
  bool mesmoLado = ladoLuz * dot(N, V) > 0.0;
  // Partículas de gelo espalham bem mesmo com o Sol rasante.
  float incidencia = 0.3 + 0.7 * sqrt(abs(ladoLuz));
  float transmitida = 0.18 * (1.0 - alfa) + 0.05;
  float luz = incidencia * (mesmoLado ? 1.0 : transmitida);

  float sombra = 1.0;
  if (uSombra > 0.5) {
    vec3 oc = vPosW - uCentroPlaneta;
    float b = dot(oc, L);
    if (b < 0.0) {
      float distanciaEixo = sqrt(max(dot(oc, oc) - b * b, 0.0));
      sombra = mix(0.04, 1.0, smoothstep(uRaioPlaneta * 0.97, uRaioPlaneta * 1.04, distanciaEixo));
    }
  }

  cor *= (luz * sombra * uLuzSol + uAmbiente) / ORB_PI;
  gl_FragColor = vec4(cor, alfa * uOpacidade);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export interface OpcoesAneis {
  textura: Texture;
  texturaSemAlfa: boolean;
  tinta?: string;
}

export function criarMaterialAneis(op: OpcoesAneis): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uTextura: { value: op.textura },
      uTexturaSemAlfa: { value: op.texturaSemAlfa ? 1 : 0 },
      uTinta: { value: new Color(op.tinta ?? '#ffffff') },
      uSolPos: { value: new Vector3(0, 0, 0) },
      uCentroPlaneta: { value: new Vector3() },
      uRaioPlaneta: { value: 1 },
      uSombra: { value: 1 },
      uOpacidade: { value: 1 },
      uLuzSol: { value: LUZ_SOL },
      uAmbiente: { value: LUZ_AMBIENTE },
    },
    vertexShader: VERTICE,
    fragmentShader: GLSL_LUZ + FRAGMENTO,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
  });
}
