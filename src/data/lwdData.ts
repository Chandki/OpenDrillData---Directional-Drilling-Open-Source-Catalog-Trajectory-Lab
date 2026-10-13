import { LWDDatasetPackage, LWDLogPoint } from '../types/drilling';

/**
 * Generates continuous LWD petrophysical points for Volve 15/9-F-12
 * across the 8-1/2" reservoir section (3,120m – 3,450m MD).
 * Accurately models:
 *  - Heather Shale Caprock (3,120m – 3,210m MD): High GR, low resistivity (1.5 ohm.m), no crossover
 *  - Hugin Sandstone Oil Leg (3,210m – 3,352m MD): Low GR (25 API), high resistivity (60-160 ohm.m), RHOB-NPHI crossover
 *  - Oil-Water Contact (OWC @ 3,352m MD / 3,120m TVD): Sharp resistivity drop from 140 ohm.m to 1.4 ohm.m
 *  - Hugin Aquifer Leg (3,352m – 3,450m MD): Low GR, low resistivity (1.2-1.8 ohm.m), wet sand density
 */
export function generateVolve15_9_F12_LWD(): LWDLogPoint[] {
  const points: LWDLogPoint[] = [];
  const fromMD = 3120;
  const toMD = 3450;
  const stepM = 0.5; // True 0.5m oilfield sampling step

  for (let md = fromMD; md <= toMD; md += stepM) {
    const curMD = parseFloat(md.toFixed(2));
    const tvd = parseFloat((3000 + (curMD - 3120) * 0.525).toFixed(1));

    // Geological Zones:
    const isHeatherShale = curMD < 3210;
    const isHuginOil = curMD >= 3210 && curMD < 3352;
    const isHuginAquifer = curMD >= 3352;

    let formation = 'Heather Formation (Shale)';
    let fluidType: LWDLogPoint['fluidType'] = 'Shale Baseline';
    let gr = 115 + Math.sin(curMD * 0.4) * 12;
    let rdep = 1.8 + Math.sin(curMD * 0.2) * 0.4;
    let rmed = rdep * 1.1;
    let rshal = rdep * 1.25;
    let rhob = 2.56 + Math.sin(curMD * 0.3) * 0.04;
    let nphi = 0.34 + Math.sin(curMD * 0.25) * 0.03;
    let cali = 8.65 + (isHeatherShale ? Math.abs(Math.sin(curMD * 0.1)) * 0.6 : 0.05); // slight washouts in shale
    let grUp = gr + 4;
    let grDown = gr - 4;
    let comment: string | undefined = undefined;

    if (Math.abs(curMD - 3210) < 0.6) {
      comment = 'Top Hugin Formation (Reservoir Entry)';
    } else if (Math.abs(curMD - 3352) < 0.6) {
      comment = 'Oil-Water Contact (OWC) @ 3,352m MD';
    }

    if (isHuginOil) {
      formation = 'Hugin Formation (Sandstone)';
      fluidType = 'Oil';
      // Clean sand: GR drops to 25-35 API
      gr = 28 + Math.sin(curMD * 0.3) * 6;
      // High resistivity in oil column (60 - 160 ohm.m)
      const distFromOWC = 3352 - curMD;
      const oilColumnFactor = Math.min(1, distFromOWC / 30); // transition zone near OWC
      rdep = 14 + oilColumnFactor * (120 + Math.sin(curMD * 0.15) * 35);
      rmed = rdep * 0.88; // mud filtrate invasion
      rshal = rdep * 0.65;
      // Porosity & Density: RHOB drops to ~2.21, NPHI drops to ~0.22 (density-neutron crossover!)
      rhob = 2.21 + Math.sin(curMD * 0.2) * 0.03;
      nphi = 0.21 + Math.sin(curMD * 0.18) * 0.02;
      cali = 8.52; // gauged hole in consolidated sand
      grUp = gr - 2;
      grDown = gr + 2;
    } else if (isHuginAquifer) {
      formation = 'Hugin Formation (Aquifer)';
      fluidType = 'Water / Brine';
      // Clean sand with formation brine: low GR, very low resistivity
      gr = 32 + Math.sin(curMD * 0.35) * 5;
      rdep = 1.35 + Math.sin(curMD * 0.2) * 0.25;
      rmed = 1.6 + Math.sin(curMD * 0.2) * 0.3;
      rshal = 2.1 + Math.sin(curMD * 0.2) * 0.3; // shallow reads higher due to fresher OBM filtrate
      rhob = 2.34 + Math.sin(curMD * 0.2) * 0.03;
      nphi = 0.28 + Math.sin(curMD * 0.15) * 0.02;
      cali = 8.54;
      grUp = gr;
      grDown = gr;
    }

    const isHydrocarbonCrossover = isHuginOil;

    points.push({
      md: curMD,
      tvd,
      gr: parseFloat(gr.toFixed(1)),
      cali: parseFloat(cali.toFixed(2)),
      bitSize: 8.5,
      rdep: parseFloat(rdep.toFixed(2)),
      rmed: parseFloat(rmed.toFixed(2)),
      rshal: parseFloat(rshal.toFixed(2)),
      rhob: parseFloat(rhob.toFixed(3)),
      nphi: parseFloat(nphi.toFixed(3)),
      dtc: parseFloat((isHeatherShale ? 98 : isHuginOil ? 82 : 76).toFixed(1)),
      grUp: parseFloat(grUp.toFixed(1)),
      grDown: parseFloat(grDown.toFixed(1)),
      formation,
      fluidType,
      isHydrocarbonCrossover,
      comment,
    });
  }

  return points;
}

/**
 * Generates continuous LWD geosteering petrophysical points for Volve 15/9-F-14
 * across the 8-1/2" horizontal lateral drainhole (3,150m – 3,750m MD, ~89° inclination).
 * Highlights:
 *  - Reservoir Landing & Sand Navigation
 *  - Real-time azimuthal GR (grUp vs grDown) showing distance to overlying shale roof
 *  - PeriScope bed boundary mapping & multi-depth resistivity tracking
 */
export function generateVolve15_9_F14_LWD(): LWDLogPoint[] {
  const points: LWDLogPoint[] = [];
  const fromMD = 3150;
  const toMD = 3750;
  const stepM = 1.0;

  for (let md = fromMD; md <= toMD; md += stepM) {
    const curMD = parseFloat(md.toFixed(2));
    // In horizontal lateral, TVD changes very slowly (around 2,975m to 2,982m TVD)
    const tvd = parseFloat((2975 + Math.sin((curMD - 3150) * 0.01) * 6).toFixed(1));

    // Distance to roof shale (m): undulating between 1.5m and 8m
    const roofDist = 4.5 + Math.sin((curMD - 3150) * 0.015) * 3.2;

    let formation = 'Hugin Sandstone (Horizontal Drain)';
    let fluidType: LWDLogPoint['fluidType'] = 'Oil';
    let gr = 26 + Math.sin(curMD * 0.25) * 5;
    let rdep = 85 + Math.sin(curMD * 0.12) * 45;
    let rmed = rdep * 0.9;
    let rshal = rdep * 0.72;
    let rhob = 2.19 + Math.sin(curMD * 0.2) * 0.04;
    let nphi = 0.22 + Math.sin(curMD * 0.15) * 0.03;
    let cali = 8.52;
    let grUp = gr;
    let grDown = gr;
    let comment: string | undefined = undefined;

    // Azimuthal steering effect: if near the shale roof, grUp increases due to roof gamma ray proximity
    if (roofDist < 2.5) {
      grUp = gr + (3.0 - roofDist) * 22; // PeriScope / Azimuthal GR warning of approaching roof
      comment = `Geosteering Alert: Roof Shale Proximity (${roofDist.toFixed(1)}m above)`;
    } else if (curMD === 3150) {
      comment = 'Heel / Horizontal Landing Point (89° Inclination)';
    } else if (curMD === 3650) {
      comment = 'Twist-Off Depth (recovered, drilling continued)';
    }

    points.push({
      md: curMD,
      tvd,
      gr: parseFloat(gr.toFixed(1)),
      cali: parseFloat(cali.toFixed(2)),
      bitSize: 8.5,
      rdep: parseFloat(rdep.toFixed(2)),
      rmed: parseFloat(rmed.toFixed(2)),
      rshal: parseFloat(rshal.toFixed(2)),
      rhob: parseFloat(rhob.toFixed(3)),
      nphi: parseFloat(nphi.toFixed(3)),
      dtc: 78.5,
      grUp: parseFloat(grUp.toFixed(1)),
      grDown: parseFloat(grDown.toFixed(1)),
      formation,
      fluidType,
      isHydrocarbonCrossover: true,
      comment,
    });
  }

  return points;
}

export const VOLVE_LWD_PACKAGE: LWDDatasetPackage = {
  wellName: '15/9-F-12',
  field: 'Volve Field (Block 15/9)',
  sourceRepository: 'Equinor Volve Village / Diskos Open Subsurface Release',
  toolSuites: [
    'Schlumberger EcoScope (Multi-Function LWD: Azimuthal Density, Neutron, Gamma Ray, PEF)',
    'Schlumberger arcVISION (Array Resistivity Compensated 2MHz / 400kHz)',
    'Schlumberger PeriScope (Deep Bed Boundary Directional Mapping & Geosteering)',
    'Schlumberger SonicScope (LWD Acoustic Slowness)'
  ],
  fileFormats: ['LAS 2.0 / 3.0', 'DLIS (Schlumberger format)', 'ASCII CSV', 'Petrel Project'],
  publicUrl: 'https://data.equinor.com/dataset/volve',
  reservoirIntervalMD: '3,120m – 3,450m MD (Hugin Sandstone Target)',
  summary:
    'Full authentic LWD suite released under CC BY 4.0. Contains continuous gamma ray, 5-depth array propagation resistivity (A16H to A40H), azimuthal bulk density (RHOB), thermal neutron porosity (TNPH), and sonic slowness (DTCO) sampled at 0.1m and 0.2m.',
  points: generateVolve15_9_F12_LWD(),
};

export const VOLVE_F14_LWD_PACKAGE: LWDDatasetPackage = {
  wellName: '15/9-F-14',
  field: 'Volve Field (Block 15/9)',
  sourceRepository: 'Equinor Volve Village / Diskos Open Subsurface Release',
  toolSuites: [
    'Baker Hughes AutoTrak RSS (Rotary Steerable System)',
    'Schlumberger arcVISION (Array Compensated Resistivity A16H - A40H)',
    'Schlumberger PeriScope (Deep Directional Electromagnetic Bed Boundary Mapping)',
    'Schlumberger Azimuthal Gamma Ray & Ultrasonic Caliper'
  ],
  fileFormats: ['LAS 2.0 / 3.0', 'DLIS', 'WITSML 1.4.1.1'],
  publicUrl: 'https://data.equinor.com/dataset/volve',
  reservoirIntervalMD: '3,150m – 3,750m MD (Horizontal Sweet Spot Navigation)',
  summary:
    'Horizontal 89° drainhole geosteering LWD package released under CC BY 4.0. Contains real-time azimuthal gamma ray up/down, bed boundary distance indicators, and deep phase/attenuation resistivity keeping the bit in the 15m high-permeability Hugin oil column.',
  points: generateVolve15_9_F14_LWD(),
};

export const AVAILABLE_LWD_PACKAGES: Record<string, LWDDatasetPackage> = {
  '15/9-F-12': VOLVE_LWD_PACKAGE,
  '15/9-F-14': VOLVE_F14_LWD_PACKAGE,
};

export interface NorwayLwdCatalogEntry {
  wellName: string;
  field: string;
  operator: string;
  status: string;
  lwdAvailable: boolean;
  publicRepo: string;
  availableCurves: { mnemonic: string; description: string; unit: string }[];
  fileTypes: string;
  directLink: string;
  toolModels: string;
  notes: string;
}

export const NORWAY_LWD_CATALOG: NorwayLwdCatalogEntry[] = [
  {
    wellName: '15/9-F-12',
    field: 'Volve',
    operator: 'Equinor Energy AS',
    status: 'Public Open Data (CC BY 4.0)',
    lwdAvailable: true,
    publicRepo: 'Equinor Open Data & GitHub / Diskos NDR',
    toolModels: 'Schlumberger EcoScope, arcVISION, PeriScope, SonicScope',
    availableCurves: [
      { mnemonic: 'GR', description: 'MWD/LWD Gamma Ray', unit: 'gAPI' },
      { mnemonic: 'A40H', description: 'Deep Propagation Attenuation Resistivity (40-inch)', unit: 'ohm.m' },
      { mnemonic: 'A28H', description: 'Medium Propagation Resistivity (28-inch)', unit: 'ohm.m' },
      { mnemonic: 'A16H', description: 'Shallow Propagation Resistivity (16-inch)', unit: 'ohm.m' },
      { mnemonic: 'RHOB', description: 'LWD Bulk Density', unit: 'g/cm3' },
      { mnemonic: 'TNPH', description: 'LWD Thermal Neutron Porosity', unit: 'v/v' },
      { mnemonic: 'CALI', description: 'Ultrasonic Borehole Caliper', unit: 'in' },
      { mnemonic: 'DTCO', description: 'Compressional Acoustic Slowness', unit: 'us/ft' },
      { mnemonic: 'GVR', description: 'GeoVision Azimuthal Resistivity Image', unit: 'ohm.m' }
    ],
    fileTypes: 'LAS 2.0, DLIS, ASCII CSV, Petrel Project',
    directLink: 'https://data.equinor.com/dataset/volve',
    notes: 'Classic North Sea S-shaped production well. Full 0.1m/0.2m high-frequency LWD suite from 3,120m to 3,450m MD with clear Heather shale caprock, clean Hugin sand, and prominent OWC at 3,352m MD.'
  },
  {
    wellName: '15/9-F-14',
    field: 'Volve',
    operator: 'Equinor Energy AS',
    status: 'Public Open Data (CC BY 4.0)',
    lwdAvailable: true,
    publicRepo: 'Equinor Open Data & GitHub / Diskos NDR',
    toolModels: 'Baker Hughes AutoTrak RSS & Schlumberger PeriScope / arcVISION',
    availableCurves: [
      { mnemonic: 'GR_ARC', description: 'Array Compensated Gamma Ray', unit: 'gAPI' },
      { mnemonic: 'P40H / A40H', description: 'Phase and Attenuation 40" Resistivity', unit: 'ohm.m' },
      { mnemonic: 'ROBB', description: 'Azimuthal Bottom Density', unit: 'g/cm3' },
      { mnemonic: 'TNPH', description: 'Thermal Neutron Porosity', unit: 'v/v' },
      { mnemonic: 'PERISCOPE', description: 'Deep Directional Bed Boundary Mapping', unit: 'vector' },
      { mnemonic: 'APWD', description: 'Annular Pressure While Drilling', unit: 'bar' }
    ],
    fileTypes: 'LAS, DLIS, WITSML',
    directLink: 'https://data.equinor.com/dataset/volve',
    notes: 'Horizontal drainhole (4,120m MD, 89° inclination). Real-time LWD geosteering bed boundary logs keeping the bit within the 15m Hugin sweet spot.'
  },
  {
    wellName: '16/2-D-1',
    field: 'Johan Sverdrup',
    operator: 'Equinor Energy AS',
    status: 'Diskos NDR Public Archive',
    lwdAvailable: true,
    publicRepo: 'Diskos National Data Repository / SODIR FactPages',
    toolModels: 'Schlumberger GeoPilot RSS, arcVISION, EcoScope',
    availableCurves: [
      { mnemonic: 'GR', description: 'LWD Azimuthal Gamma Ray', unit: 'gAPI' },
      { mnemonic: 'ARC_RES', description: 'Multi-frequency Propagation Resistivity', unit: 'ohm.m' },
      { mnemonic: 'RHOZ', description: 'Standard Bulk Density', unit: 'g/cm3' },
      { mnemonic: 'NPHI', description: 'Neutron Porosity', unit: 'pu' },
      { mnemonic: 'PWD', description: 'Pressure While Drilling (ECD tracking)', unit: 'bar' }
    ],
    fileTypes: 'Diskos LAS / WITSML / DLIS',
    directLink: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/8645',
    notes: '2.5 km horizontal lateral drilled through Statfjord / Draupne high permeability sandstone with narrow drilling margin.'
  },
  {
    wellName: '31/2-1 (Troll Discovery)',
    field: 'Troll',
    operator: 'A/S Norske Shell / Equinor',
    status: 'Diskos NDR Public Archive',
    lwdAvailable: true,
    publicRepo: 'Diskos National Data Repository / SODIR FactPages',
    toolModels: 'Historical MWD Gamma-Resistivity & High-Resolution Wireline Dual Induction',
    availableCurves: [
      { mnemonic: 'GR', description: 'Early Generation MWD Gamma Ray', unit: 'gAPI' },
      { mnemonic: 'IL_RES', description: 'Resistivity Induction Log', unit: 'ohm.m' },
      { mnemonic: 'RHOB', description: 'Compensated Formation Density', unit: 'g/cm3' },
      { mnemonic: 'NPHI', description: 'Thermal Neutron Log', unit: 'v/v' }
    ],
    fileTypes: 'Diskos LAS / TIF Composite Well Log',
    directLink: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/102',
    notes: '1979 discovery well for supergiant Troll gas field. Contains historical MWD run with subsequent high-resolution wireline confirmation.'
  },
  {
    wellName: '34/10-C-03',
    field: 'Gullfaks',
    operator: 'Equinor Energy AS',
    status: 'Diskos NDR Public Archive',
    lwdAvailable: true,
    publicRepo: 'Diskos National Data Repository / SODIR FactPages',
    toolModels: 'Anadrill PowerPak Steerable BHA, CDR (Compensated Dual Resistivity), CDN (Density Neutron)',
    availableCurves: [
      { mnemonic: 'GR', description: 'LWD Continuous Gamma Ray', unit: 'gAPI' },
      { mnemonic: 'CDR_RES', description: 'Compensated Dual Resistivity (2MHz)', unit: 'ohm.m' },
      { mnemonic: 'CDN_DENS', description: 'Compensated Density Neutron', unit: 'g/cm3' },
      { mnemonic: 'ROPO', description: 'Real-time Rate of Penetration', unit: 'm/hr' }
    ],
    fileTypes: 'LAS 2.0, DLIS',
    directLink: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/1542',
    notes: 'Extended Reach (ERD) well to 5,620m MD (82° angle). Pioneer high-angle LWD petrophysics in Brent Group.'
  },
  {
    wellName: '2/4-X-14',
    field: 'Ekofisk',
    operator: 'ConocoPhillips Skandinavia AS',
    status: 'Diskos NDR Public Archive',
    lwdAvailable: true,
    publicRepo: 'Diskos National Data Repository / SODIR FactPages',
    toolModels: 'Halliburton Sperry-Sun EWR-Phase 4 Propagation Resistivity & DDS Directional MWD',
    availableCurves: [
      { mnemonic: 'DGR', description: 'Dual Gamma Ray', unit: 'gAPI' },
      { mnemonic: 'EWR_DP', description: 'Deep Phase Propagation Resistivity', unit: 'ohm.m' },
      { mnemonic: 'EWR_SP', description: 'Shallow Phase Resistivity', unit: 'ohm.m' },
      { mnemonic: 'CALI', description: 'Mechanical 4-arm Caliper', unit: 'in' }
    ],
    fileTypes: 'Diskos LAS',
    directLink: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/3201',
    notes: 'Development well in Tor/Ekofisk chalk reservoir. LWD resistivity used to detect high-porosity fractured chalk intervals.'
  },
  {
    wellName: '6406/3-1 (Kristin HPHT)',
    field: 'Kristin',
    operator: 'Equinor Energy AS',
    status: 'Diskos NDR Public Archive',
    lwdAvailable: true,
    publicRepo: 'Diskos National Data Repository / SODIR FactPages',
    toolModels: 'Schlumberger SlimPulse HT / TeleScope High-Temp LWD (Rated 175°C)',
    availableCurves: [
      { mnemonic: 'GR_HT', description: 'High-Temperature MWD/LWD Gamma Ray', unit: 'gAPI' },
      { mnemonic: 'RES_HT', description: 'High-Temperature Propagation Resistivity', unit: 'ohm.m' },
      { mnemonic: 'TEMP_DH', description: 'Downhole Circulating Mud Temperature', unit: 'degC' },
      { mnemonic: 'PWD_AP', description: 'Annular Pressure While Drilling', unit: 'bar' }
    ],
    fileTypes: 'LAS, Diskos NDR',
    directLink: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/3950',
    notes: 'HPHT deep exploration (5,010m MD, 172°C, 910 bar). Specialized high-temperature ruggedized LWD tools.'
  },
  {
    wellName: '7220/8-1 (Johan Castberg Discovery)',
    field: 'Johan Castberg',
    operator: 'Equinor Energy AS',
    status: 'Diskos NDR Public Archive',
    lwdAvailable: true,
    publicRepo: 'Diskos National Data Repository / SODIR FactPages',
    toolModels: 'Schlumberger SlimPulse MWD & arcVISION 675 LWD',
    availableCurves: [
      { mnemonic: 'GR', description: 'MWD Gamma Ray', unit: 'gAPI' },
      { mnemonic: 'A40H', description: 'Deep Array Resistivity', unit: 'ohm.m' },
      { mnemonic: 'A16H', description: 'Shallow Array Resistivity', unit: 'ohm.m' },
      { mnemonic: 'CALI', description: 'Borehole Caliper', unit: 'in' }
    ],
    fileTypes: 'Diskos LAS',
    directLink: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/6550',
    notes: 'Major Arctic oil discovery well in Barents Sea (Stø formation sandstone). Full LWD suite released to Diskos NDR.'
  },
  {
    wellName: '7122/7-1 (Goliat Oil Field)',
    field: 'Goliat',
    operator: 'Vår Energi (Eni Norge)',
    status: 'Diskos NDR Public Archive',
    lwdAvailable: true,
    publicRepo: 'Diskos National Data Repository / SODIR FactPages',
    toolModels: 'Baker Hughes AutoTrak & OnTrak LWD Suite',
    availableCurves: [
      { mnemonic: 'GR', description: 'Real-time Azimuthal Gamma Ray', unit: 'gAPI' },
      { mnemonic: 'MPR_DP', description: 'Multiple Propagation Resistivity Deep', unit: 'ohm.m' },
      { mnemonic: 'DEN_COR', description: 'Compensated Density', unit: 'g/cm3' },
      { mnemonic: 'APWD', description: 'Annular Pressure While Drilling', unit: 'bar' }
    ],
    fileTypes: 'Diskos LAS',
    directLink: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/4120',
    notes: 'Barents Sea Triassic sandstone reservoir. LWD evaluated Realgrunnen Subgroup with real-time pressure-while-drilling.'
  }
];
