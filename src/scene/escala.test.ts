import { describe, expect, it } from 'vitest';
import {
  KM_POR_UA,
  RAIO_MINIMO_CENA,
  RAIO_TERRA_CENA,
  SEGUNDOS_ORBITA_TERRA,
  distanciaCena,
  periodoCena,
  raioCena,
  sentidoOrbital,
  sentidoRotacao,
  velocidadeAngular,
  velocidadeRotacao,
} from './escala';

const RAIO = {
  sol: 695_700,
  mercurio: 2_439.7,
  venus: 6_051.8,
  terra: 6_371,
  marte: 3_389.5,
  jupiter: 69_911,
  saturno: 58_232,
  urano: 25_362,
  netuno: 24_622,
  ceres: 469.7,
  fobos: 11.08,
  deimos: 6.2,
};
const UA = {
  mercurio: 0.387,
  venus: 0.723,
  terra: 1,
  marte: 1.524,
  ceres: 2.767,
  jupiter: 5.203,
  saturno: 9.537,
  urano: 19.19,
  netuno: 30.07,
  plutao: 39.48,
  eris: 67.86,
};
const ANEL_F_SATURNO_KM = 140_220;

const PERIODO_DIAS = {
  mercurio: 87.969,
  venus: 224.701,
  terra: 365.256,
  marte: 686.98,
  jupiter: 4_332.59,
  netuno: 60_195,
  eris: 203_830,
  fobos: 0.31891,
  lua: 27.3217,
};

describe('raioCena', () => {
  it('usa a Terra como régua', () => {
    expect(raioCena(RAIO.terra)).toBeCloseTo(RAIO_TERRA_CENA, 2);
  });

  it('é estritamente crescente', () => {
    const amostras = [1, 10, 100, 469, 2_439, 6_371, 25_000, 69_911, 80_000, 80_001, 200_000, 695_700];
    for (let i = 1; i < amostras.length; i++) {
      expect(raioCena(amostras[i])).toBeGreaterThan(raioCena(amostras[i - 1]));
    }
  });

  it('é contínua no limiar entre as duas curvas', () => {
    expect(raioCena(80_000 * 1.0001) - raioCena(80_000)).toBeLessThan(1e-3);
  });

  it('mantém Mercúrio visível: mais da metade do raio da Terra', () => {
    expect(raioCena(RAIO.mercurio) / raioCena(RAIO.terra)).toBeGreaterThan(0.5);
  });

  it('não deixa o Sol dominar: maior que Júpiter, mas menos de 7 Terras', () => {
    const sol = raioCena(RAIO.sol);
    expect(sol).toBeGreaterThan(raioCena(RAIO.jupiter));
    expect(sol / raioCena(RAIO.terra)).toBeLessThan(7);
  });

  it('preserva a ordem dos gigantes', () => {
    expect(raioCena(RAIO.jupiter)).toBeGreaterThan(raioCena(RAIO.saturno));
    expect(raioCena(RAIO.saturno)).toBeGreaterThan(raioCena(RAIO.urano));
    expect(raioCena(RAIO.urano)).toBeGreaterThan(raioCena(RAIO.netuno));
  });

  it('tem piso para luas minúsculas e trata entradas inválidas', () => {
    expect(raioCena(RAIO.deimos)).toBeGreaterThanOrEqual(RAIO_MINIMO_CENA);
    expect(raioCena(RAIO.fobos)).toBeGreaterThan(raioCena(RAIO.deimos));
    expect(raioCena(0)).toBe(RAIO_MINIMO_CENA);
    expect(raioCena(-5)).toBe(RAIO_MINIMO_CENA);
    expect(raioCena(Number.NaN)).toBe(RAIO_MINIMO_CENA);
  });
});

describe('distanciaCena (heliocêntrica)', () => {
  const d = (ua: number) => distanciaCena(ua * KM_POR_UA, 'planeta');

  it('preserva a ordem a partir do Sol', () => {
    const ordem = Object.values(UA).map(d);
    for (let i = 1; i < ordem.length; i++) expect(ordem[i]).toBeGreaterThan(ordem[i - 1]);
  });

  it('não depende do tipo para corpos que orbitam o Sol', () => {
    expect(distanciaCena(UA.ceres * KM_POR_UA, 'planeta-anao')).toBe(d(UA.ceres));
  });

  it('põe o periélio de Mercúrio bem fora do Sol', () => {
    const perielio = d(UA.mercurio * (1 - 0.2056));
    expect(perielio).toBeGreaterThan(raioCena(RAIO.sol) * 1.8);
  });

  it('deixa espaço entre vizinhos maior que a soma dos raios', () => {
    expect(d(UA.terra) - d(UA.venus)).toBeGreaterThan(raioCena(RAIO.terra) + raioCena(RAIO.venus) + 1);
    const aneisSaturno = raioCena(RAIO.saturno) * (ANEL_F_SATURNO_KM / RAIO.saturno);
    expect(d(UA.saturno) - d(UA.jupiter)).toBeGreaterThan(raioCena(RAIO.jupiter) + aneisSaturno + 2);
  });

  it('mantém a sensação de afastamento: os vãos externos são maiores que os internos', () => {
    expect(d(UA.saturno) - d(UA.jupiter)).toBeGreaterThan(d(UA.terra) - d(UA.venus));
    expect(d(UA.urano) - d(UA.saturno)).toBeGreaterThan(d(UA.marte) - d(UA.terra));
  });

  it('cabe numa cena navegável', () => {
    expect(d(UA.netuno)).toBeLessThan(100);
    expect(d(97.6)).toBeLessThan(130);
  });

  it('põe o Sol na origem', () => {
    expect(distanciaCena(123, 'estrela')).toBe(0);
  });
});

describe('distanciaCena (luas)', () => {
  it('põe Fobos fora de Marte e Deimos além de Fobos', () => {
    const fobos = distanciaCena(9_376, 'lua', RAIO.marte);
    const deimos = distanciaCena(23_463, 'lua', RAIO.marte);
    expect(fobos).toBeGreaterThan(raioCena(RAIO.marte) * 1.8);
    expect(deimos).toBeGreaterThan(fobos);
  });

  it('põe Encélado fora dos anéis de Saturno', () => {
    const encelado = distanciaCena(237_948, 'lua', RAIO.saturno);
    const aneis = raioCena(RAIO.saturno) * (ANEL_F_SATURNO_KM / RAIO.saturno);
    expect(encelado).toBeGreaterThan(aneis);
  });

  it('preserva a ordem das luas galileanas', () => {
    const a = [421_700, 671_034, 1_070_412, 1_882_709].map((km) => distanciaCena(km, 'lua', RAIO.jupiter));
    for (let i = 1; i < a.length; i++) expect(a[i]).toBeGreaterThan(a[i - 1]);
  });

  it('nunca põe uma lua dentro do pai, mesmo com dados estranhos', () => {
    expect(distanciaCena(10, 'lua', RAIO.terra)).toBeGreaterThan(raioCena(RAIO.terra));
    expect(distanciaCena(384_400, 'lua')).toBeGreaterThan(raioCena(RAIO.terra));
  });
});

describe('velocidadeAngular', () => {
  it('faz a Terra dar uma volta em 60 s na velocidade 1×', () => {
    expect(periodoCena(PERIODO_DIAS.terra)).toBeCloseTo(SEGUNDOS_ORBITA_TERRA, 6);
    expect(velocidadeAngular(PERIODO_DIAS.terra)).toBeCloseTo((2 * Math.PI) / 60, 6);
  });

  it('mantém a proporção exata entre os planetas internos', () => {
    const razao = periodoCena(PERIODO_DIAS.marte) / periodoCena(PERIODO_DIAS.mercurio);
    expect(razao).toBeCloseTo(PERIODO_DIAS.marte / PERIODO_DIAS.mercurio, 6);
    expect(periodoCena(PERIODO_DIAS.venus) / periodoCena(PERIODO_DIAS.terra)).toBeCloseTo(
      PERIODO_DIAS.venus / PERIODO_DIAS.terra,
      6,
    );
  });

  it('é estritamente decrescente com o período e contínua nas emendas', () => {
    const periodos = [0.3, 1, 27, 87.968, 87.97, 300, 730.5, 730.52, 4_332, 60_195, 203_830];
    for (let i = 1; i < periodos.length; i++) {
      expect(velocidadeAngular(periodos[i])).toBeLessThan(velocidadeAngular(periodos[i - 1]));
    }
    expect(Math.abs(periodoCena(730.512 + 1e-6) - periodoCena(730.512))).toBeLessThan(1e-3);
    expect(Math.abs(periodoCena(87.969 - 1e-6) - periodoCena(87.969))).toBeLessThan(1e-3);
  });

  it('comprime os corpos externos para que não fiquem parados', () => {
    expect(periodoCena(PERIODO_DIAS.netuno)).toBeLessThan(30 * 60);
    expect(periodoCena(PERIODO_DIAS.eris)).toBeLessThan(60 * 60);
    expect(periodoCena(PERIODO_DIAS.netuno)).toBeGreaterThan(periodoCena(PERIODO_DIAS.jupiter));
  });

  it('comprime luas rápidas para não virarem um borrão', () => {
    expect(periodoCena(PERIODO_DIAS.fobos)).toBeGreaterThan(2);
    expect(periodoCena(PERIODO_DIAS.lua)).toBeLessThan(periodoCena(PERIODO_DIAS.mercurio));
  });

  it('preserva o sinal e trata zero', () => {
    expect(velocidadeAngular(-PERIODO_DIAS.terra)).toBeCloseTo(-velocidadeAngular(PERIODO_DIAS.terra), 9);
    expect(velocidadeAngular(0)).toBe(0);
  });
});

describe('velocidadeRotacao', () => {
  it('respeita o sinal: Vênus e Urano retrógrados', () => {
    expect(velocidadeRotacao(23.934)).toBeGreaterThan(0);
    expect(velocidadeRotacao(-5_832.5)).toBeLessThan(0);
    expect(velocidadeRotacao(-17.24)).toBeLessThan(0);
  });

  it('gira mais rápido quem tem dia mais curto, e Vênus ainda é perceptível', () => {
    expect(velocidadeRotacao(9.925)).toBeGreaterThan(velocidadeRotacao(23.934));
    const voltaVenus = (2 * Math.PI) / Math.abs(velocidadeRotacao(-5_832.5));
    expect(voltaVenus).toBeLessThan(5 * 60);
  });

  it('trata período zero', () => {
    expect(velocidadeRotacao(0)).toBe(0);
  });
});

describe('sentidos', () => {
  it('não aplica a retrogradação duas vezes', () => {
    expect(sentidoRotacao(177.36, -5_832.5)).toBe(1);
    expect(sentidoRotacao(97.77, -17.24)).toBe(1);
    expect(sentidoRotacao(2.64, -5_832.5)).toBe(-1);
    expect(sentidoRotacao(23.44, 23.93)).toBe(1);
  });

  it('usa a inclinação orbital > 90° como sentido e o flag só como reserva', () => {
    expect(sentidoOrbital(156.885, true)).toBe(1);
    expect(sentidoOrbital(23, true)).toBe(-1);
    expect(sentidoOrbital(5.1)).toBe(1);
  });
});
