import type { Fonte } from './types.ts';

const VERIFICADO_EM = '2026-10-31';
const NSSDCA = 'https://nssdc.gsfc.nasa.gov/planetary/factsheet';

function fonte(id: string, titulo: string, url: string, acessadoEm = VERIFICADO_EM): Fonte {
  return { id, titulo, url, acessadoEm };
}

const lista = [
  fonte('nssdca-planetas', 'Planetary Fact Sheet – Metric (NASA NSSDCA)', `${NSSDCA}/`),
  fonte('nssdca-sol', 'Sun Fact Sheet (NASA NSSDCA)', `${NSSDCA}/sunfact.html`),
  fonte('nssdca-mercurio', 'Mercury Fact Sheet (NASA NSSDCA)', `${NSSDCA}/mercuryfact.html`),
  fonte('nssdca-venus', 'Venus Fact Sheet (NASA NSSDCA)', `${NSSDCA}/venusfact.html`),
  fonte('nssdca-terra', 'Earth Fact Sheet (NASA NSSDCA)', `${NSSDCA}/earthfact.html`),
  fonte('nssdca-lua', 'Moon Fact Sheet (NASA NSSDCA)', `${NSSDCA}/moonfact.html`),
  fonte('nssdca-marte', 'Mars Fact Sheet (NASA NSSDCA)', `${NSSDCA}/marsfact.html`),
  fonte('nssdca-jupiter', 'Jupiter Fact Sheet (NASA NSSDCA)', `${NSSDCA}/jupiterfact.html`),
  fonte('nssdca-saturno', 'Saturn Fact Sheet (NASA NSSDCA)', `${NSSDCA}/saturnfact.html`),
  fonte('nssdca-urano', 'Uranus Fact Sheet (NASA NSSDCA)', `${NSSDCA}/uranusfact.html`),
  fonte('nssdca-netuno', 'Neptune Fact Sheet (NASA NSSDCA)', `${NSSDCA}/neptunefact.html`),
  fonte('nssdca-plutao', 'Pluto Fact Sheet (NASA NSSDCA)', `${NSSDCA}/plutofact.html`),
  fonte('nssdca-aneis-jupiter', 'Jovian Rings Fact Sheet (NASA NSSDCA)', `${NSSDCA}/jupringfact.html`),
  fonte('nssdca-aneis-saturno', 'Saturnian Rings Fact Sheet (NASA NSSDCA)', `${NSSDCA}/satringfact.html`),
  fonte('nssdca-aneis-urano', 'Uranian Rings Fact Sheet (NASA NSSDCA)', `${NSSDCA}/uranringfact.html`),
  fonte('nssdca-aneis-netuno', 'Neptunian Rings Fact Sheet (NASA NSSDCA)', `${NSSDCA}/nepringfact.html`),

  fonte('jpl-sats-fisicos', 'Planetary Satellite Physical Parameters (JPL SSD)', 'https://ssd.jpl.nasa.gov/sats/phys_par/'),
  fonte('jpl-sats-orbitais', 'Planetary Satellite Mean Elements (JPL SSD)', 'https://ssd.jpl.nasa.gov/sats/elem/'),
  fonte('jpl-sbdb-ceres', 'Small-Body Database: 1 Ceres (JPL SSD)', 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1'),
  fonte('jpl-sbdb-haumea', 'Small-Body Database: 136108 Haumea (JPL SSD)', 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=136108'),
  fonte('jpl-sbdb-makemake', 'Small-Body Database: 136472 Makemake (JPL SSD)', 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=136472'),
  fonte('jpl-sbdb-eris', 'Small-Body Database: 136199 Eris (JPL SSD)', 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=136199'),

  fonte('nasa-sol', 'Sun: Facts (NASA Science)', 'https://science.nasa.gov/sun/facts/'),
  fonte('nasa-luas', 'Moons (NASA Science)', 'https://science.nasa.gov/solar-system/moons/'),
  fonte('nasa-jupiter-luas', 'Jupiter Moons (NASA Science)', 'https://science.nasa.gov/jupiter/jupiter-moons/'),
  fonte('nasa-saturno-luas', 'Saturn Moons (NASA Science)', 'https://science.nasa.gov/saturn/moons/'),
  fonte('nasa-urano-luas', 'Uranus Moons (NASA Science)', 'https://science.nasa.gov/uranus/moons/'),
  fonte('nasa-netuno-luas', 'Neptune Moons (NASA Science)', 'https://science.nasa.gov/neptune/moons/'),
  fonte('nasa-ceres', 'Ceres: Facts (NASA Science)', 'https://science.nasa.gov/dwarf-planets/ceres/facts/'),
  fonte('nasa-plutao', 'Pluto: Facts (NASA Science)', 'https://science.nasa.gov/dwarf-planets/pluto/facts/'),
  fonte('nasa-caronte', 'Charon (NASA Science)', 'https://science.nasa.gov/dwarf-planets/pluto/moons/charon/'),
  fonte('nasa-haumea', 'Haumea (NASA Science)', 'https://science.nasa.gov/dwarf-planets/haumea/'),
  fonte('nasa-makemake', 'Makemake (NASA Science)', 'https://science.nasa.gov/dwarf-planets/makemake/'),
  fonte('nasa-eris', 'Eris (NASA Science)', 'https://science.nasa.gov/dwarf-planets/eris/'),
  fonte('nasa-io', 'Io: Facts (NASA Science)', 'https://science.nasa.gov/jupiter/jupiter-moons/io/facts/'),
  fonte('nasa-europa', 'Europa (NASA Science)', 'https://science.nasa.gov/jupiter/jupiter-moons/europa/'),
  fonte('nasa-ganimedes', 'Ganymede: Facts (NASA Science)', 'https://science.nasa.gov/jupiter/jupiter-moons/ganymede/facts/'),
  fonte('nasa-calisto', 'Callisto: Facts (NASA Science)', 'https://science.nasa.gov/jupiter/jupiter-moons/callisto/facts/'),
  fonte('nasa-tita', 'Titan: Facts (NASA Science)', 'https://science.nasa.gov/saturn/moons/titan/facts/'),
  fonte('nasa-encelado', 'Enceladus (NASA Science)', 'https://science.nasa.gov/saturn/moons/enceladus/'),
  fonte('nasa-titania', 'Titania (NASA Science)', 'https://science.nasa.gov/uranus/moons/titania/'),
  fonte('nasa-oberon', 'Oberon (NASA Science)', 'https://science.nasa.gov/uranus/moons/oberon/'),
  fonte('nasa-tritao', 'Triton (NASA Science)', 'https://science.nasa.gov/neptune/moons/triton/'),

  fonte('mgs-fobos-1998', 'Mars Global Surveyor: temperaturas de Fobos medidas pelo TES (NASA, 1998)', 'https://nssdc.gsfc.nasa.gov/planetary/text/mgs_pr_19980911.txt', ''),
  fonte('ortiz-2017-haumea', 'Ortiz et al. (2017), The size, shape, density and ring of the dwarf planet Haumea from a stellar occultation, Nature 550', 'https://doi.org/10.1038/nature24051', ''),
  fonte('szakats-2023-eris', 'Szakáts et al. (2023), Tidally locked rotation of the dwarf planet (136199) Eris, A&A 669, L3', 'https://arxiv.org/abs/2211.07987', ''),
  fonte('bernstein-2023-eris', 'Bernstein et al. (2023), Synchronous rotation in the (136199) Eris–Dysnomia system, Planetary Science Journal', 'https://arxiv.org/abs/2303.13445', ''),
  fonte('brown-2007-eris', 'Brown & Schaller (2007), The mass of dwarf planet Eris, Science 316', 'https://doi.org/10.1126/science.1139415', ''),
  fonte('sicardy-2011-eris', 'Sicardy et al. (2011), A Pluto-like radius and a high albedo for the dwarf planet Eris from an occultation, Nature 478', 'https://doi.org/10.1038/nature10550', ''),
  fonte('ragozzine-2009-haumea', 'Ragozzine & Brown (2009), Orbits and masses of the satellites of the dwarf planet Haumea, AJ 137', 'https://doi.org/10.1088/0004-6256/137/6/4766', ''),
] as const satisfies readonly Fonte[];

export type FonteId = (typeof lista)[number]['id'];

export const catalogoFontes: readonly Fonte[] = lista;

const porId = new Map<string, Fonte>(lista.map((f) => [f.id, f]));

export function fontesPor(...ids: FonteId[]): Fonte[] {
  return ids.map((id) => {
    const f = porId.get(id);
    if (!f) throw new Error(`Fonte desconhecida: ${id}`);
    return f;
  });
}
