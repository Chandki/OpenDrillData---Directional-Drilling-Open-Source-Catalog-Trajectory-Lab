import { SurveyStation } from '../types/drilling';

export interface BenchmarkWell {
  id: string;
  name: string;
  field: string;
  location: string;
  wellType: 'S-Shape Deviated' | 'Deep Geothermal 65° Tangent' | 'Horizontal Shale Lateral' | 'ISCWSA Standard Validation';
  unit: 'metric' | 'oilfield';
  proposalAzi: number;
  description: string;
  stations: SurveyStation[];
  highlights: {
    kop: number;
    maxInc: number;
    finalMD: number;
    landingMD?: number;
    targetDescription: string;
  };
}

export const BENCHMARK_WELLS: BenchmarkWell[] = [
  {
    id: 'volve-15-9-f12',
    name: 'Equinor Volve 15/9-F-12',
    field: 'Volve Field (Block 15/9)',
    location: 'Norwegian North Sea (Offshore)',
    wellType: 'S-Shape Deviated',
    unit: 'metric',
    proposalAzi: 312.0,
    description:
      'Classic North Sea S-type production well. Vertical surface hole down to 1,200m KOP, build section up to 28.5° inclination, hold tangent through Hugin formation, and drop section back to 11° into the reservoir target.',
    highlights: {
      kop: 1200,
      maxInc: 28.5,
      finalMD: 3450,
      targetDescription: 'Hugin Sandstone Reservoir Target at 3,173m TVD'
    },
    stations: [
      { md: 0, inc: 0.0, azi: 0.0, comment: 'Wellhead RKB (Elevation +25m)' },
      { md: 250, inc: 0.2, azi: 45.0, comment: 'Surface Casing 20"' },
      { md: 600, inc: 0.5, azi: 55.0, comment: 'Vertical Top Hole' },
      { md: 950, inc: 0.8, azi: 70.0 },
      { md: 1200, inc: 1.0, azi: 85.0, comment: 'Kickoff Point (KOP)' },
      { md: 1350, inc: 5.2, azi: 308.0, comment: 'Steering Build Section' },
      { md: 1500, inc: 11.4, azi: 310.5 },
      { md: 1650, inc: 17.6, azi: 311.8 },
      { md: 1800, inc: 23.5, azi: 312.2 },
      { md: 1950, inc: 28.2, azi: 312.0, comment: 'End of Build (EOB) - Tangent' },
      { md: 2100, inc: 28.5, azi: 312.0, comment: '13-3/8" Intermediate Casing' },
      { md: 2250, inc: 28.4, azi: 311.8 },
      { md: 2400, inc: 28.5, azi: 312.1 },
      { md: 2550, inc: 28.0, azi: 312.4 },
      { md: 2700, inc: 25.8, azi: 312.5, comment: 'Start of Drop Section' },
      { md: 2850, inc: 21.4, azi: 313.0 },
      { md: 3000, inc: 16.2, azi: 313.2 },
      { md: 3150, inc: 12.0, azi: 313.5, comment: '9-5/8" Production Casing' },
      { md: 3300, inc: 10.8, azi: 313.8, comment: 'Hugin Reservoir Entry' },
      { md: 3450, inc: 10.5, azi: 314.0, comment: 'Total Depth (TD)' }
    ]
  },
  {
    id: 'utah-forge-16a',
    name: 'Utah FORGE 16A(78)-32',
    field: 'Roosevelt Hot Springs',
    location: 'Milford, Utah (US DOE Geothermal)',
    wellType: 'Deep Geothermal 65° Tangent',
    unit: 'oilfield',
    proposalAzi: 105.0,
    description:
      'Milestone deep directional geothermal well drilled into granitic basement at temperatures >228°C (442°F). KOP at 5,980 ft, continuous build at 5.5°/100ft dogleg to 65° inclination tangent, held steady to 10,950 ft TD.',
    highlights: {
      kop: 5980,
      maxInc: 65.4,
      finalMD: 10950,
      targetDescription: 'Granite Basement EGS Stimulation Target at 8,500 ft TVD'
    },
    stations: [
      { md: 0, inc: 0.0, azi: 0.0, comment: 'Ground Level / Rig RKB' },
      { md: 1000, inc: 0.4, azi: 120.0, comment: 'Surface Casing 20"' },
      { md: 2500, inc: 0.8, azi: 110.0 },
      { md: 4000, inc: 1.1, azi: 108.0 },
      { md: 5500, inc: 1.3, azi: 106.0 },
      { md: 5980, inc: 1.5, azi: 105.0, comment: 'Kickoff Point (KOP) in Alluvium' },
      { md: 6200, inc: 13.5, azi: 105.2, comment: 'Mud Motor Sliding Run' },
      { md: 6500, inc: 29.8, azi: 105.0 },
      { md: 6800, inc: 45.2, azi: 104.8, comment: 'Granite Top Penetration' },
      { md: 7150, inc: 64.5, azi: 105.1, comment: 'End of Build (EOB)' },
      { md: 7500, inc: 65.2, azi: 105.0, comment: '9-5/8" High-Temp Casing Shoe' },
      { md: 8000, inc: 65.4, azi: 104.9, comment: '65° Tangent Section in Granite' },
      { md: 8600, inc: 65.0, azi: 105.2 },
      { md: 9200, inc: 65.1, azi: 105.0 },
      { md: 9800, inc: 64.8, azi: 105.3, comment: 'Zone of High Thermal Gradient' },
      { md: 10400, inc: 65.2, azi: 105.1 },
      { md: 10950, inc: 65.0, azi: 105.0, comment: 'Total Depth (TD) - 10,950 ft' }
    ]
  },
  {
    id: 'permian-horizontal',
    name: 'Permian Wolfcamp Horizontal Lateral',
    field: 'Delaware Basin (Wolfcamp A)',
    location: 'Loving County, Texas (USA)',
    wellType: 'Horizontal Shale Lateral',
    unit: 'oilfield',
    proposalAzi: 179.0,
    description:
      'Standard high-efficiency unconventional horizontal well. Vertical section to 8,800 ft KOP, aggressive curve build at 9°/100ft DLS to 90° horizontal inclination, landing perfectly in the 25 ft Wolfcamp target window, followed by a 7,500 ft lateral.',
    highlights: {
      kop: 8800,
      maxInc: 90.8,
      finalMD: 17500,
      landingMD: 9850,
      targetDescription: 'Wolfcamp A Target Window (9,480 - 9,510 ft TVD)'
    },
    stations: [
      { md: 0, inc: 0.0, azi: 0.0, comment: 'Surface Pad' },
      { md: 1500, inc: 0.3, azi: 220.0, comment: 'Surface Casing 13-3/8"' },
      { md: 4500, inc: 0.6, azi: 190.0, comment: 'Intermediate Casing 9-5/8"' },
      { md: 7500, inc: 0.9, azi: 182.0 },
      { md: 8800, inc: 1.2, azi: 180.0, comment: 'Kickoff Point (KOP)' },
      { md: 9000, inc: 19.5, azi: 179.5, comment: 'Curve Section (Build 9.2°/100ft)' },
      { md: 9200, inc: 37.8, azi: 179.2 },
      { md: 9400, inc: 56.4, azi: 179.0 },
      { md: 9600, inc: 74.5, azi: 178.8 },
      { md: 9850, inc: 90.2, azi: 179.0, comment: 'Landing Point (Heel / 7" Casing)' },
      { md: 10500, inc: 90.5, azi: 179.1, comment: 'Horizontal Lateral (RSS)' },
      { md: 11500, inc: 89.8, azi: 178.9 },
      { md: 12500, inc: 90.2, azi: 179.2 },
      { md: 13500, inc: 90.8, azi: 179.0, comment: 'Geosteering Zone 1' },
      { md: 14500, inc: 89.9, azi: 178.8 },
      { md: 15500, inc: 90.1, azi: 179.1 },
      { md: 16500, inc: 90.4, azi: 179.2 },
      { md: 17500, inc: 90.0, azi: 179.0, comment: 'Toe / Total Depth (TD)' }
    ]
  },
  {
    id: 'iscwsa-well-1',
    name: 'ISCWSA Benchmark Well #1',
    field: 'SPE Standard Reference Model',
    location: 'Standard Validation Benchmark',
    wellType: 'ISCWSA Standard Validation',
    unit: 'metric',
    proposalAzi: 45.0,
    description:
      'The international benchmark well established by the Industry Steering Committee for Wellbore Survey Accuracy (SPE ISCWSA). Used globally to audit and certify directional software calculation engines against numerical precision standards.',
    highlights: {
      kop: 1000,
      maxInc: 40.0,
      finalMD: 3500,
      targetDescription: 'Standard Verification Benchmark Table Point at 3,000m TVD'
    },
    stations: [
      { md: 0, inc: 0.0, azi: 0.0, comment: 'Surface Point' },
      { md: 500, inc: 0.0, azi: 0.0 },
      { md: 1000, inc: 0.0, azi: 0.0, comment: 'Kickoff Point' },
      { md: 1300, inc: 12.0, azi: 30.0, comment: 'Build & Turn Section' },
      { md: 1600, inc: 24.0, azi: 40.0 },
      { md: 1900, inc: 36.0, azi: 44.0 },
      { md: 2200, inc: 40.0, azi: 45.0, comment: 'End of Build - 40° Tangent' },
      { md: 2600, inc: 40.0, azi: 45.0 },
      { md: 2900, inc: 25.0, azi: 50.0, comment: 'Drop Section' },
      { md: 3200, inc: 10.0, azi: 52.0 },
      { md: 3500, inc: 0.0, azi: 0.0, comment: 'Return to Vertical / TD' }
    ]
  }
];
