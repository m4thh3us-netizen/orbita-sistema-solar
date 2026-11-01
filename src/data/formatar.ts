export const ESPACO = '\u00A0';
const MENOS = '\u2212';

export const KM_POR_UA = 149_597_870.7;
export const HORAS_POR_DIA = 24;
export const DIAS_POR_ANO = 365.25;

const SOBRESCRITO: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
};

function comMenosTipografico(texto: string): string {
  return texto.replace(/^-/, MENOS);
}

export function formatarNumero(n: number, casas = 0): string {
  const texto = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(n);
  return comMenosTipografico(texto);
}

export function formatarSignificativos(n: number, digitos = 3): string {
  const texto = new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: digitos }).format(n);
  return comMenosTipografico(texto);
}

export function sobrescrito(n: number): string {
  return String(n).split('').map((c) => SOBRESCRITO[c] ?? c).join('');
}

export function formatarCientifico(n: number, digitos = 3, unidade?: string): string {
  if (n === 0) return unidade ? `0${ESPACO}${unidade}` : '0';
  let expoente = Math.floor(Math.log10(Math.abs(n)));
  let mantissa = Number((n / 10 ** expoente).toPrecision(digitos));
  if (Math.abs(mantissa) >= 10) {
    mantissa /= 10;
    expoente += 1;
  }
  const corpo = expoente === 0
    ? formatarNumero(mantissa, digitos - 1)
    : `${formatarNumero(mantissa, digitos - 1)}${ESPACO}×${ESPACO}10${sobrescrito(expoente)}`;
  return unidade ? `${corpo}${ESPACO}${unidade}` : corpo;
}

export function formatarComparacao(valor: number, referencia: number, nomeReferencia = 'Terra', digitos = 3): string {
  const razao = valor / referencia;
  if (Math.abs(razao) < 1e-3) return `${formatarCientifico(razao, digitos)} da ${nomeReferencia}`;
  return `${formatarSignificativos(razao, digitos)}${ESPACO}×${ESPACO}${nomeReferencia}`;
}

export function formatarPercentual(p: number, casas = 1): string {
  return `${formatarNumero(p, casas)}${ESPACO}%`;
}

export function formatarMesAno(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${iso}T00:00:00Z`));
}

export function formatarGrandeza(n: number, digitos = 3): string {
  const escalas: [number, string, string][] = [
    [1e12, 'trilhão', 'trilhões'],
    [1e9, 'bilhão', 'bilhões'],
    [1e6, 'milhão', 'milhões'],
  ];
  for (const [fator, singular, plural] of escalas) {
    if (Math.abs(n) >= fator) {
      const x = n / fator;
      const nome = Math.abs(x) < 2 ? singular : plural;
      return `${formatarSignificativos(x, digitos)} ${nome}`;
    }
  }
  return formatarSignificativos(n, digitos);
}

export function formatarDuracao(horas: number): string {
  const h = Math.abs(horas);
  if (h < 48) return `${formatarNumero(h, h < 10 ? 2 : 1)}${ESPACO}horas`;
  const dias = h / HORAS_POR_DIA;
  if (dias < 2 * DIAS_POR_ANO) return `${formatarNumero(dias, dias < 10 ? 2 : 1)}${ESPACO}dias`;
  const anos = dias / DIAS_POR_ANO;
  return `${formatarNumero(anos, anos < 100 ? 2 : 1)}${ESPACO}anos terrestres`;
}

export function kelvinParaCelsius(k: number): number {
  return k - 273.15;
}

export function celsiusParaKelvin(c: number): number {
  return c + 273.15;
}

export function formatarTemperatura(celsius: number): string {
  return `${formatarNumero(Math.round(celsius))}${ESPACO}°C`;
}

export function formatarKelvin(kelvin: number): string {
  return `${formatarNumero(Math.round(kelvin))}${ESPACO}K`;
}

export function formatarKm(km: number, casas = 0): string {
  return `${formatarNumero(km, casas)}${ESPACO}km`;
}

export function formatarKmPorExtenso(km: number): string {
  return `${formatarGrandeza(km)} de km`;
}

export function formatarUA(km: number): string {
  const ua = km / KM_POR_UA;
  return `${formatarNumero(ua, ua < 10 ? (ua < 1 ? 3 : 2) : 1)}${ESPACO}UA`;
}

export function formatarPressao(bar: number): string {
  if (bar >= 0.1) return `${formatarSignificativos(bar, 3)}${ESPACO}bar`;
  if (bar >= 1e-3) return `${formatarSignificativos(bar * 1e3, 3)}${ESPACO}mbar`;
  if (bar >= 1e-6) return `${formatarSignificativos(bar * 1e6, 3)}${ESPACO}µbar`;
  return formatarCientifico(bar, 1, 'bar');
}
