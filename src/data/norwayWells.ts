import { NorwayWellbore } from '../types/drilling';

export const NORWAY_WELLBORES: NorwayWellbore[] = [
  {
    id: 'volve-15-9-f-12',
    wellName: '15/9-F-12',
    npdid: 5547,
    field: 'Volve',
    block: '15/9',
    sector: 'North Sea',
    operator: 'Equinor Energy AS (Statoil)',
    license: 'PL 046',
    lat: 58.4419,
    lng: 1.8897,
    utmZone: 'ED50 / UTM Zone 31N (X: 435132, Y: 6478521)',
    waterDepth: 82,
    rkbElevation: 25,
    spudDate: '12-May-2007',
    completionDate: '28-Jun-2007',
    rigDays: 47,
    drillingFacility: 'Mærsk Inspirer',
    facilityType: 'Jack-up',
    wellType: 'Development Producer',
    wellStatus: 'Plugged & Abandoned',
    totalDepthMD: 3450,
    totalDepthTVD: 3173,
    maxInclination: 28.5,
    kickoffPointMD: 1200,
    steeringSystem: 'Schlumberger PowerDrive 900 RSS & 1.5° PDM Mud Motor',
    geologicalFormationAtTD: 'Hugin Formation (Middle Jurassic Sandstone)',
    officialFactPageUrl: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/5547',
    sections: [
      {
        holeSize: '36"',
        casingSize: '30" Conductor',
        fromDepth: 82,
        toDepth: 165,
        mudType: 'Seawater & High-Viscosity Bentonite sweeps',
        mudWeight: 1.05,
        bitType: '36" Hole Opener with 26" Tricone pilot'
      },
      {
        holeSize: '26"',
        casingSize: '20" Surface Casing',
        fromDepth: 165,
        toDepth: 620,
        mudType: 'Seawater / Guar Gum Polymer',
        mudWeight: 1.15,
        shoeTestLOT: 1.45,
        bitType: '26" Smith PDC 5-blade'
      },
      {
        holeSize: '17 1/2"',
        casingSize: '13 3/8" Intermediate Casing',
        fromDepth: 620,
        toDepth: 1420,
        mudType: 'Water-Based PAC / Gypsum mud',
        mudWeight: 1.25,
        shoeTestLOT: 1.62,
        bitType: '17 1/2" Baker Hughes Kymera hybrid'
      },
      {
        holeSize: '12 1/4"',
        casingSize: '9 5/8" Production Casing',
        fromDepth: 1420,
        toDepth: 3120,
        mudType: 'Versaclean Low Toxicity OBM',
        mudWeight: 1.48,
        shoeTestLOT: 1.82,
        bitType: '12 1/4" Halliburton FX75M PDC (7-blade 16mm)'
      },
      {
        holeSize: '8 1/2"',
        casingSize: '7" Production Liner',
        fromDepth: 3120,
        toDepth: 3450,
        mudType: 'Versaclean Low Solids OBM',
        mudWeight: 1.35,
        shoeTestLOT: 1.86,
        bitType: '8 1/2" SLB AxeBlade PDC with diamond elements'
      }
    ],
    issues: [
      {
        id: 'iss-5547-1',
        category: 'Wellbore Instability / Pack-off',
        depthMD: 1380,
        holeSection: '17 1/2" section',
        severity: 'Medium',
        nptHours: 14.5,
        title: 'Shale swelling and tight hole during tripping in Hordaland Group',
        description:
          'High overpull of 65 tonnes observed when pulling out of hole with 17-1/2" BHA across reactive tertiary green claystones. Cuttings bed accumulation led to partial pack-off.',
        remedialAction:
          'Pumped 25 m³ tandem sweeps (high-density + high-viscosity pill). Performed controlled backreaming at 80 RPM with maximum flow rate (3,600 L/min) to clean the borehole before running 13-3/8" casing.'
      },
      {
        id: 'iss-5547-2',
        category: 'Lost Circulation',
        depthMD: 2420,
        holeSection: '12 1/4" section',
        severity: 'High',
        nptHours: 28.0,
        title: 'Dynamic losses into fractured Ekofisk/Tor chalk formation',
        description:
          'Sudden loss of 45 m³ of Versaclean OBM at 2,420m MD while drilling through micro-fractured chalk stringers. Pit level alarms triggered with loss rate of 18 m³/hr.',
        remedialAction:
          'Reduced pump rate immediately and spaced out string. Spotted a 15 m³ coarse LCM pill containing blended calcium carbonate (25 ppb) and nut plug fiber. Waited 4 hours for filter cake maturation; full returns restored.'
      },
      {
        id: 'iss-5547-3',
        category: 'BHA / Tool Failure',
        depthMD: 2750,
        holeSection: '12 1/4" section',
        severity: 'Low',
        nptHours: 18.0,
        title: 'MWD pulser telemetry loss due to torsional stick-slip vibration',
        description:
          'Loss of continuous mud pulse MWD directional transmission while drilling interbedded limestone/sandstone layers. Downhole sensors recorded peak torsional vibrations exceeding 140 rad/s².',
        remedialAction:
          'Tripped out of hole (POOH) to surface. Found damaged pulser solenoid valve. Swapped out directional MWD collar package, re-configured BHA stabilizer gauge, and engaged Soft Torque Rotary System on rig console.'
      }
    ],
    surveyStations: [
      { md: 0, inc: 0.0, azi: 0.0, comment: 'Wellhead RKB' },
      { md: 250, inc: 0.2, azi: 45.0, comment: 'Surface Casing 20"' },
      { md: 600, inc: 0.5, azi: 55.0 },
      { md: 950, inc: 0.8, azi: 70.0 },
      { md: 1200, inc: 1.0, azi: 85.0, comment: 'Kickoff Point (KOP)' },
      { md: 1350, inc: 5.2, azi: 308.0, comment: 'Build Section Start' },
      { md: 1500, inc: 11.4, azi: 310.5 },
      { md: 1650, inc: 17.6, azi: 311.8 },
      { md: 1800, inc: 23.5, azi: 312.2 },
      { md: 1950, inc: 28.2, azi: 312.0, comment: 'End of Build (EOB)' },
      { md: 2100, inc: 28.5, azi: 312.0, comment: '13-3/8" Intermediate Shoe' },
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
    id: 'volve-15-9-f-14',
    wellName: '15/9-F-14',
    npdid: 5814,
    field: 'Volve',
    block: '15/9',
    sector: 'North Sea',
    operator: 'Equinor Energy AS (Statoil)',
    license: 'PL 046',
    lat: 58.4431,
    lng: 1.8872,
    utmZone: 'ED50 / UTM Zone 31N',
    waterDepth: 82,
    rkbElevation: 25,
    spudDate: '10-Aug-2008',
    completionDate: '04-Oct-2008',
    rigDays: 55,
    drillingFacility: 'Mærsk Inspirer',
    facilityType: 'Jack-up',
    wellType: 'Development Producer',
    wellStatus: 'Plugged & Abandoned',
    totalDepthMD: 4120,
    totalDepthTVD: 2980,
    maxInclination: 89.2,
    kickoffPointMD: 1450,
    steeringSystem: 'Baker Hughes AutoTrak Rotary Steerable System (RSS)',
    geologicalFormationAtTD: 'Hugin Sandstone (Extended Horizontal Drainhole)',
    officialFactPageUrl: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/5814',
    sections: [
      {
        holeSize: '36"',
        casingSize: '30" Conductor',
        fromDepth: 82,
        toDepth: 170,
        mudType: 'Seawater / Bentonite',
        mudWeight: 1.05
      },
      {
        holeSize: '26"',
        casingSize: '20" Surface Casing',
        fromDepth: 170,
        toDepth: 650,
        mudType: 'Seawater / Polymer',
        mudWeight: 1.16,
        shoeTestLOT: 1.48
      },
      {
        holeSize: '17 1/2"',
        casingSize: '13 3/8" Intermediate Casing',
        fromDepth: 650,
        toDepth: 1550,
        mudType: 'Gypsum/PAC Water Mud',
        mudWeight: 1.28,
        shoeTestLOT: 1.64
      },
      {
        holeSize: '12 1/4"',
        casingSize: '9 5/8" Casing',
        fromDepth: 1550,
        toDepth: 3100,
        mudType: 'Synthetic Oil-Based Mud (SBM)',
        mudWeight: 1.46,
        shoeTestLOT: 1.84
      },
      {
        holeSize: '8 1/2"',
        casingSize: '7" Production Liner (Pre-drilled screen)',
        fromDepth: 3100,
        toDepth: 4120,
        mudType: 'SBM with lubricity additives',
        mudWeight: 1.32,
        shoeTestLOT: 1.88
      }
    ],
    issues: [
      {
        id: 'iss-5814-1',
        category: 'BHA / Tool Failure',
        depthMD: 3650,
        holeSection: '8 1/2" lateral section',
        severity: 'High',
        nptHours: 52.0,
        title: 'BHA connection fatigue twist-off in 6.2°/30m dogleg curve',
        description:
          'Twist-off of drill collar connection occurred at 3,650m MD while steering in horizontal lateral section. String parted, leaving 8-1/2" bit, RSS motor, and LWD tools in hole.',
        remedialAction:
          'Mobilized fishing assembly with spiral grapple overshot and bumper sub. Successfully engaged and recovered fish on first run. Ran caliper log to inspect dogleg severity before resuming drilling.'
      },
      {
        id: 'iss-5814-2',
        category: 'Stuck Pipe',
        depthMD: 3920,
        holeSection: '8 1/2" lateral section',
        severity: 'Medium',
        nptHours: 19.0,
        title: 'Differential sticking across high-permeability depleted sand zone',
        description:
          'Drill string became differentially stuck against filter cake while performing 10-minute directional survey at 3,920m. Mud overbalance exceeded 45 bar.',
        remedialAction:
          'Spotted 12 m³ organic lubricant soaking pill (Pipe-Lax). Worked string with 90 tonnes maximum allowable overpull and downward jarring. String freed after 7 hours of soaking.'
      }
    ],
    surveyStations: [
      { md: 0, inc: 0.0, azi: 0.0 },
      { md: 500, inc: 0.4, azi: 110.0 },
      { md: 1000, inc: 0.9, azi: 125.0 },
      { md: 1450, inc: 1.2, azi: 130.0, comment: 'Kickoff Point (KOP)' },
      { md: 1750, inc: 22.0, azi: 135.0, comment: 'Aggressive Curve Build' },
      { md: 2150, inc: 48.0, azi: 136.0 },
      { md: 2550, inc: 72.0, azi: 135.5 },
      { md: 2950, inc: 88.5, azi: 135.0, comment: 'Reservoir Landing' },
      { md: 3350, inc: 89.2, azi: 135.2, comment: 'Horizontal Drain 1' },
      { md: 3750, inc: 89.0, azi: 135.0, comment: 'Horizontal Drain 2' },
      { md: 4120, inc: 88.8, azi: 134.8, comment: 'TD at 4,120m MD' }
    ]
  },
  {
    id: 'sverdrup-16-2-d-1',
    wellName: '16/2-D-1',
    npdid: 8645,
    field: 'Johan Sverdrup',
    block: '16/2',
    sector: 'North Sea',
    operator: 'Equinor Energy AS',
    license: 'PL 501',
    lat: 58.8350,
    lng: 2.5410,
    utmZone: 'ED50 / UTM Zone 31N',
    waterDepth: 115,
    rkbElevation: 32,
    spudDate: '02-Jan-2019',
    completionDate: '18-Feb-2019',
    rigDays: 47,
    drillingFacility: 'Johan Sverdrup DP Platform',
    facilityType: 'Fixed Platform DP',
    wellType: 'Development Producer',
    wellStatus: 'Producing',
    totalDepthMD: 4820,
    totalDepthTVD: 1912,
    maxInclination: 90.1,
    kickoffPointMD: 950,
    steeringSystem: 'Schlumberger GeoPilot Rotary Steerable System (RSS)',
    geologicalFormationAtTD: 'Statfjord / Draupne Formation (2.5 km Long Lateral)',
    officialFactPageUrl: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/8645',
    sections: [
      {
        holeSize: '42"',
        casingSize: '36" Structural Conductor',
        fromDepth: 115,
        toDepth: 220,
        mudType: 'Seawater / Bentonite',
        mudWeight: 1.05
      },
      {
        holeSize: '24"',
        casingSize: '18 5/8" Surface Casing',
        fromDepth: 220,
        toDepth: 750,
        mudType: 'Water-Based Polymer',
        mudWeight: 1.18,
        shoeTestLOT: 1.52
      },
      {
        holeSize: '16"',
        casingSize: '13 3/8" Intermediate Casing',
        fromDepth: 750,
        toDepth: 1650,
        mudType: 'Low-ECD Oil Based Mud',
        mudWeight: 1.30,
        shoeTestLOT: 1.68
      },
      {
        holeSize: '12 1/4"',
        casingSize: '9 5/8" Production Casing',
        fromDepth: 1650,
        toDepth: 2320,
        mudType: 'Low-ECD OBM',
        mudWeight: 1.38,
        shoeTestLOT: 1.78
      },
      {
        holeSize: '8 1/2"',
        casingSize: '7" Production Liner with Inflow Control Devices (ICD)',
        fromDepth: 2320,
        toDepth: 4820,
        mudType: 'Synthetic low viscosity OBM',
        mudWeight: 1.26,
        shoeTestLOT: 1.82
      }
    ],
    issues: [
      {
        id: 'iss-8645-1',
        category: 'Lost Circulation',
        depthMD: 3120,
        holeSection: '8 1/2" 2.5km lateral',
        severity: 'Medium',
        nptHours: 12.0,
        title: 'Narrow drilling margin and seepage losses in highly permeable sand',
        description:
          'Seepage losses of 6–8 m³/hr observed due to narrow margin between reservoir pore pressure (1.18 SG eq) and fracture gradient. Equivalent Circulating Density (ECD) spikes caused micro-fracturing.',
        remedialAction:
          'Optimized rheology by reducing plastic viscosity. Replaced bit nozzles to reduce pump pressure and blended ultra-fine graphite / calcium carbonate (15 ppb) to seal pore throats.'
      }
    ],
    surveyStations: [
      { md: 0, inc: 0.0, azi: 0.0 },
      { md: 450, inc: 0.3, azi: 80.0 },
      { md: 950, inc: 1.0, azi: 95.0, comment: 'Kickoff Point (KOP)' },
      { md: 1350, inc: 24.5, azi: 94.0 },
      { md: 1750, inc: 54.0, azi: 94.2 },
      { md: 2150, inc: 82.0, azi: 94.5 },
      { md: 2320, inc: 89.8, azi: 94.0, comment: 'Landing Point - Heel' },
      { md: 2950, inc: 90.1, azi: 94.1, comment: 'Horizontal Lateral Track 1' },
      { md: 3600, inc: 89.9, azi: 93.9, comment: 'Horizontal Lateral Track 2' },
      { md: 4200, inc: 90.0, azi: 94.2, comment: 'Horizontal Lateral Track 3' },
      { md: 4820, inc: 90.1, azi: 94.0, comment: 'Toe / TD (4,820m MD)' }
    ]
  },
  {
    id: 'troll-31-2-1',
    wellName: '31/2-1 (Troll Discovery)',
    npdid: 102,
    field: 'Troll',
    block: '31/2',
    sector: 'North Sea',
    operator: 'A/S Norske Shell / Equinor',
    license: 'PL 054',
    lat: 60.5401,
    lng: 3.4218,
    utmZone: 'ED50 / UTM Zone 31N',
    waterDepth: 338,
    rkbElevation: 25,
    spudDate: '18-Apr-1979',
    completionDate: '12-Jul-1979',
    rigDays: 85,
    drillingFacility: 'Borgny Dolphin',
    facilityType: 'Semi-submersible',
    wellType: 'Exploration Wildcat',
    wellStatus: 'Plugged & Abandoned',
    totalDepthMD: 2550,
    totalDepthTVD: 2550,
    maxInclination: 2.1,
    kickoffPointMD: 0,
    steeringSystem: 'Rotary Vertical BHA with Pendulum Assembly',
    geologicalFormationAtTD: 'Sognefjord Formation (Supergiant Gas Discovery)',
    officialFactPageUrl: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/102',
    sections: [
      {
        holeSize: '36"',
        casingSize: '30" Conductor',
        fromDepth: 338,
        toDepth: 410,
        mudType: 'Seawater / Gel sweeps',
        mudWeight: 1.03
      },
      {
        holeSize: '26"',
        casingSize: '20" Surface Casing',
        fromDepth: 410,
        toDepth: 890,
        mudType: 'Seawater / CMC Polymer',
        mudWeight: 1.12,
        shoeTestLOT: 1.38
      },
      {
        holeSize: '17 1/2"',
        casingSize: '13 3/8" Intermediate',
        fromDepth: 890,
        toDepth: 1680,
        mudType: 'Lignosulfonate Water Mud',
        mudWeight: 1.24,
        shoeTestLOT: 1.58
      },
      {
        holeSize: '12 1/4"',
        casingSize: '9 5/8" Casing',
        fromDepth: 1680,
        toDepth: 2550,
        mudType: 'Dispersed freshwater mud',
        mudWeight: 1.28,
        shoeTestLOT: 1.68
      }
    ],
    issues: [
      {
        id: 'iss-102-1',
        category: 'Gas Kick / Well Control',
        depthMD: 420,
        holeSection: '26" top hole section',
        severity: 'High',
        nptHours: 36.0,
        title: 'Shallow biogenic gas pocket encountered without riser',
        description:
          'Shallow gas kick encountered at 420m MD while drilling 26" hole riserless. Bubble flow and bubbling observed on subsea ROV camera at wellhead.',
        remedialAction:
          'Displaced hole immediately with 1.20 SG heavy dynamic kill mud at 4,000 L/min pump rate. Successfully suppressed gas flow before running 20" casing with diverter system.'
      }
    ],
    surveyStations: [
      { md: 0, inc: 0.0, azi: 0.0 },
      { md: 500, inc: 0.3, azi: 15.0 },
      { md: 1000, inc: 0.7, azi: 25.0 },
      { md: 1500, inc: 1.2, azi: 30.0 },
      { md: 2000, inc: 1.8, azi: 28.0 },
      { md: 2550, inc: 2.1, azi: 32.0, comment: 'TD at 2,550m MD' }
    ]
  },
  {
    id: 'gullfaks-34-10-c-03',
    wellName: '34/10-C-03',
    npdid: 1542,
    field: 'Gullfaks',
    block: '34/10',
    sector: 'North Sea',
    operator: 'Equinor Energy AS',
    license: 'PL 050',
    lat: 61.2180,
    lng: 2.2610,
    utmZone: 'ED50 / UTM Zone 31N',
    waterDepth: 135,
    rkbElevation: 30,
    spudDate: '05-Sep-1991',
    completionDate: '14-Nov-1991',
    rigDays: 70,
    drillingFacility: 'Gullfaks C Platform',
    facilityType: 'Fixed Platform DP',
    wellType: 'Extended Reach ERD',
    wellStatus: 'Producing',
    totalDepthMD: 5620,
    totalDepthTVD: 1980,
    maxInclination: 82.5,
    kickoffPointMD: 550,
    steeringSystem: 'Anadrill PowerPak Steerable Motor & Continuous Gyro',
    geologicalFormationAtTD: 'Brent Group (4.8 km Horizontal Reach)',
    officialFactPageUrl: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/1542',
    sections: [
      {
        holeSize: '36"',
        casingSize: '30" Conductor',
        fromDepth: 135,
        toDepth: 250,
        mudType: 'Seawater / Bentonite',
        mudWeight: 1.05
      },
      {
        holeSize: '26"',
        casingSize: '20" Surface Casing',
        fromDepth: 250,
        toDepth: 950,
        mudType: 'Water-Based Gel',
        mudWeight: 1.18,
        shoeTestLOT: 1.48
      },
      {
        holeSize: '17 1/2"',
        casingSize: '13 3/8" Intermediate',
        fromDepth: 950,
        toDepth: 2450,
        mudType: 'Low-toxicity Mineral Oil Mud',
        mudWeight: 1.34,
        shoeTestLOT: 1.70
      },
      {
        holeSize: '12 1/4"',
        casingSize: '9 5/8" Casing',
        fromDepth: 2450,
        toDepth: 4650,
        mudType: 'Synthetic Oil Mud (1.42 SG)',
        mudWeight: 1.42,
        shoeTestLOT: 1.82
      },
      {
        holeSize: '8 1/2"',
        casingSize: '7" Production Liner',
        fromDepth: 4650,
        toDepth: 5620,
        mudType: 'Synthetic OBM with lubricant',
        mudWeight: 1.30,
        shoeTestLOT: 1.85
      }
    ],
    issues: [
      {
        id: 'iss-1542-1',
        category: 'Stuck Pipe',
        depthMD: 4210,
        holeSection: '12 1/4" ERD section',
        severity: 'High',
        nptHours: 38.0,
        title: 'Cuttings bed avalanche and mechanical pack-off in 68° angle hole',
        description:
          'While drilling extended reach interval at 4,210m, rotation stalled at 32 kNm torque. Drill string packed off due to accumulation and avalanche of cuttings dunes in the critical 55°–65° inclination window.',
        remedialAction:
          'Worked string axially with 75 tonnes jarring down. Regained circulation at low rate. Circulated high-viscosity pill with 4% glass beads lubricant; rotated string slowly until torque normalized.'
      }
    ],
    surveyStations: [
      { md: 0, inc: 0.0, azi: 0.0 },
      { md: 550, inc: 1.0, azi: 220.0, comment: 'Kickoff Point' },
      { md: 1200, inc: 32.0, azi: 222.0 },
      { md: 2000, inc: 65.0, azi: 221.0 },
      { md: 2900, inc: 81.5, azi: 220.5, comment: 'Long Tangent ERD Reach' },
      { md: 3800, inc: 82.5, azi: 220.8 },
      { md: 4700, inc: 82.0, azi: 221.0 },
      { md: 5620, inc: 81.8, azi: 220.5, comment: 'Total Depth 5,620m MD' }
    ]
  },
  {
    id: 'ekofisk-2-4-x-14',
    wellName: '2/4-X-14',
    npdid: 3201,
    field: 'Ekofisk',
    block: '2/4',
    sector: 'North Sea',
    operator: 'ConocoPhillips Skandinavia AS',
    license: 'PL 018',
    lat: 56.5460,
    lng: 3.2140,
    utmZone: 'ED50 / UTM Zone 31N',
    waterDepth: 74,
    rkbElevation: 28,
    spudDate: '22-Feb-1998',
    completionDate: '15-Apr-1998',
    rigDays: 52,
    drillingFacility: 'Ekofisk 2/4-X',
    facilityType: 'Fixed Platform DP',
    wellType: 'Development Producer',
    wellStatus: 'Producing',
    totalDepthMD: 3980,
    totalDepthTVD: 3020,
    maxInclination: 48.0,
    kickoffPointMD: 1100,
    steeringSystem: 'Halliburton Sperry-Sun Slick Motor & MWD',
    geologicalFormationAtTD: 'Tor / Ekofisk Chalk Formation',
    officialFactPageUrl: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/3201',
    sections: [
      {
        holeSize: '36"',
        casingSize: '30" Conductor',
        fromDepth: 74,
        toDepth: 180,
        mudType: 'Seawater / Spud Gel',
        mudWeight: 1.05
      },
      {
        holeSize: '26"',
        casingSize: '20" Surface Casing',
        fromDepth: 180,
        toDepth: 720,
        mudType: 'KCl / Polymer Water Mud',
        mudWeight: 1.20,
        shoeTestLOT: 1.48
      },
      {
        holeSize: '17 1/2"',
        casingSize: '13 3/8" Intermediate',
        fromDepth: 720,
        toDepth: 1850,
        mudType: 'Low toxicity Oil Based Mud',
        mudWeight: 1.38,
        shoeTestLOT: 1.72
      },
      {
        holeSize: '12 1/4"',
        casingSize: '9 5/8" Casing',
        fromDepth: 1850,
        toDepth: 3350,
        mudType: 'OBM Versaclean',
        mudWeight: 1.55,
        shoeTestLOT: 1.88
      },
      {
        holeSize: '8 1/2"',
        casingSize: '7" Production Liner',
        fromDepth: 3350,
        toDepth: 3980,
        mudType: 'Filtered OBM',
        mudWeight: 1.42,
        shoeTestLOT: 1.92
      }
    ],
    issues: [
      {
        id: 'iss-3201-1',
        category: 'Lost Circulation',
        depthMD: 3150,
        holeSection: '12 1/4" section',
        severity: 'High',
        nptHours: 32.0,
        title: 'Severe losses in natural fault fissures in chalk reservoir',
        description:
          'Experienced total loss of returns (loss rate >40 m³/hr) while drilling across natural fracture swarm in Tor chalk formation.',
        remedialAction:
          'Pumped 20 m³ high-solids thixotropic cement plug (1.90 SG). Allowed cement to set for 12 hours. Tagged and drilled through cement plug with restored pressure integrity.'
      }
    ],
    surveyStations: [
      { md: 0, inc: 0.0, azi: 0.0 },
      { md: 1100, inc: 1.0, azi: 165.0, comment: 'Kickoff Point' },
      { md: 1700, inc: 26.0, azi: 166.0 },
      { md: 2400, inc: 48.0, azi: 165.5, comment: 'Hold Tangent' },
      { md: 3200, inc: 47.8, azi: 165.8 },
      { md: 3980, inc: 47.5, azi: 165.2, comment: 'TD 3,980m MD' }
    ]
  },
  {
    id: 'kristin-6406-3-1',
    wellName: '6406/3-1 (Kristin HPHT)',
    npdid: 3950,
    field: 'Kristin',
    block: '6406/3',
    sector: 'Norwegian Sea',
    operator: 'Equinor Energy AS',
    license: 'PL 199',
    lat: 65.0120,
    lng: 6.5410,
    utmZone: 'ED50 / UTM Zone 32N',
    waterDepth: 375,
    rkbElevation: 25,
    spudDate: '12-Dec-1999',
    completionDate: '05-May-2000',
    rigDays: 145,
    drillingFacility: 'Scarabeo 5',
    facilityType: 'Semi-submersible',
    wellType: 'HPHT Exploration',
    wellStatus: 'Plugged & Abandoned',
    totalDepthMD: 5010,
    totalDepthTVD: 4950,
    maxInclination: 14.5,
    kickoffPointMD: 2800,
    steeringSystem: 'High-Temperature MWD & PDM Mud Motor (Rated 175°C)',
    geologicalFormationAtTD: 'Garn & Ile Formation (Reservoir Pressure 910 bar, 172°C)',
    officialFactPageUrl: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/3950',
    sections: [
      {
        holeSize: '36"',
        casingSize: '30" Conductor',
        fromDepth: 375,
        toDepth: 460,
        mudType: 'Seawater / Spud sweeps',
        mudWeight: 1.05
      },
      {
        holeSize: '26"',
        casingSize: '20" Surface Casing',
        fromDepth: 460,
        toDepth: 1250,
        mudType: 'Water-Based Polymer',
        mudWeight: 1.22,
        shoeTestLOT: 1.50
      },
      {
        holeSize: '17 1/2"',
        casingSize: '13 3/8" Intermediate',
        fromDepth: 1250,
        toDepth: 2950,
        mudType: 'Heavy Oil-Based Mud',
        mudWeight: 1.55,
        shoeTestLOT: 1.84
      },
      {
        holeSize: '12 1/4"',
        casingSize: '9 5/8" HPHT Heavy Wall Casing',
        fromDepth: 2950,
        toDepth: 4420,
        mudType: 'Cesium/Potassium Formate High-Density Mud',
        mudWeight: 2.12,
        shoeTestLOT: 2.28
      },
      {
        holeSize: '8 1/2"',
        casingSize: '7" Heavy Wall Liner',
        fromDepth: 4420,
        toDepth: 5010,
        mudType: 'Cesium Formate Brine (2.15 SG)',
        mudWeight: 2.15,
        shoeTestLOT: 2.32
      }
    ],
    issues: [
      {
        id: 'iss-3950-1',
        category: 'Gas Kick / Well Control',
        depthMD: 4890,
        holeSection: '8 1/2" HPHT reservoir section',
        severity: 'High',
        nptHours: 48.0,
        title: 'High-pressure gas influx in narrow 0.06 SG drilling window',
        description:
          'Took 2.8 m³ gas kick from Garn formation at 4,890m MD where bottomhole pressure was 905 bar. Surface casing pressure rose rapidly to 85 bar.',
        remedialAction:
          'Shut in on subsea BOP annular preventer. Recorded SIDPP and SICP. Circulated out gas influx using the Engineer\'s Method (Wait & Weight) with 2.18 SG kill formate mud.'
      },
      {
        id: 'iss-3950-2',
        category: 'BHA / Tool Failure',
        depthMD: 4950,
        holeSection: '8 1/2" HPHT section',
        severity: 'Medium',
        nptHours: 24.0,
        title: 'Downhole MWD battery and electronics thermal degradation (>170°C)',
        description:
          'Electronics failure in directional survey package after 18 hours on bottom due to sustained 172°C downhole circulating temperature.',
        remedialAction:
          'Tripped out of hole. Installed vacuum-insulated thermal flask MWD assembly rated to 200°C with ceramic multi-chip electronics before TD logging.'
      }
    ],
    surveyStations: [
      { md: 0, inc: 0.0, azi: 0.0 },
      { md: 1000, inc: 0.5, azi: 50.0 },
      { md: 2000, inc: 1.2, azi: 55.0 },
      { md: 2800, inc: 1.5, azi: 60.0, comment: 'Kickoff Point' },
      { md: 3600, inc: 10.2, azi: 62.0 },
      { md: 4400, inc: 14.5, azi: 63.0 },
      { md: 5010, inc: 14.2, azi: 62.5, comment: 'TD 5,010m MD (HPHT)' }
    ]
  },
  {
    id: 'castberg-7220-8-1',
    wellName: '7220/8-1 (Johan Castberg Discovery)',
    npdid: 6550,
    field: 'Johan Castberg',
    block: '7220/8',
    sector: 'Barents Sea',
    operator: 'Equinor Energy AS',
    license: 'PL 532',
    lat: 72.4820,
    lng: 20.5280,
    utmZone: 'ED50 / UTM Zone 34N',
    waterDepth: 388,
    rkbElevation: 25,
    spudDate: '18-Mar-2011',
    completionDate: '08-May-2011',
    rigDays: 51,
    drillingFacility: 'Polar Pioneer',
    facilityType: 'Semi-submersible',
    wellType: 'Exploration Wildcat',
    wellStatus: 'Plugged & Abandoned',
    totalDepthMD: 2210,
    totalDepthTVD: 2190,
    maxInclination: 8.5,
    kickoffPointMD: 1200,
    steeringSystem: 'Schlumberger SlimPulse MWD & PDM Motor',
    geologicalFormationAtTD: 'Stø Formation (Major Arctic Oil Discovery)',
    officialFactPageUrl: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/6550',
    sections: [
      {
        holeSize: '36"',
        casingSize: '30" Conductor',
        fromDepth: 388,
        toDepth: 480,
        mudType: 'Seawater / Bentonite',
        mudWeight: 1.05
      },
      {
        holeSize: '26"',
        casingSize: '20" Surface Casing',
        fromDepth: 480,
        toDepth: 980,
        mudType: 'Seawater / Polymer Water Mud',
        mudWeight: 1.15,
        shoeTestLOT: 1.45
      },
      {
        holeSize: '17 1/2"',
        casingSize: '13 3/8" Intermediate',
        fromDepth: 980,
        toDepth: 1520,
        mudType: 'KCl / Glycol Water Mud',
        mudWeight: 1.25,
        shoeTestLOT: 1.62
      },
      {
        holeSize: '12 1/4"',
        casingSize: '9 5/8" Casing',
        fromDepth: 1520,
        toDepth: 2210,
        mudType: 'Low toxicity Oil Based Mud',
        mudWeight: 1.32,
        shoeTestLOT: 1.74
      }
    ],
    issues: [
      {
        id: 'iss-6550-1',
        category: 'Severe Weather Suspension',
        depthMD: 1120,
        holeSection: '17 1/2" section',
        severity: 'High',
        nptHours: 42.0,
        title: 'Arctic storm with severe rig heave forced disconnect of marine riser',
        description:
          'Barents Sea winter storm generated significant wave heights exceeding 7.5m and peak rig heave beyond telescopic joint limits. Suspended operations.',
        remedialAction:
          'Hung off drill string in subsea wellhead, sheared string with blind shear rams, and disconnected Lower Marine Riser Package (LMRP). Waited on weather for 38 hours, re-latched riser, and dressed fish.'
      }
    ],
    surveyStations: [
      { md: 0, inc: 0.0, azi: 0.0 },
      { md: 500, inc: 0.4, azi: 300.0 },
      { md: 1200, inc: 1.0, azi: 310.0, comment: 'Kickoff Point' },
      { md: 1700, inc: 6.8, azi: 312.0 },
      { md: 2210, inc: 8.5, azi: 311.5, comment: 'TD at 2,210m MD' }
    ]
  },
  {
    id: 'goliat-7122-7-1',
    wellName: '7122/7-1 (Goliat Oil Field)',
    npdid: 4120,
    field: 'Goliat',
    block: '7122/7',
    sector: 'Barents Sea',
    operator: 'Vår Energi (Eni Norge)',
    license: 'PL 229',
    lat: 71.2850,
    lng: 22.3120,
    utmZone: 'ED50 / UTM Zone 34N',
    waterDepth: 372,
    rkbElevation: 25,
    spudDate: '10-Aug-2000',
    completionDate: '28-Sep-2000',
    rigDays: 49,
    drillingFacility: 'Transocean Arctic',
    facilityType: 'Semi-submersible',
    wellType: 'Exploration Wildcat',
    wellStatus: 'Plugged & Abandoned',
    totalDepthMD: 2750,
    totalDepthTVD: 2420,
    maxInclination: 42.0,
    kickoffPointMD: 900,
    steeringSystem: 'Steerable PDM Motor with 1.25° Bend',
    geologicalFormationAtTD: 'Realgrunnen Subgroup (Triassic Sandstone)',
    officialFactPageUrl: 'https://factpages.sodir.no/en/wellbore/explorer/exploration/all/4120',
    sections: [
      {
        holeSize: '36"',
        casingSize: '30" Conductor',
        fromDepth: 372,
        toDepth: 450,
        mudType: 'Seawater / Bentonite',
        mudWeight: 1.05
      },
      {
        holeSize: '26"',
        casingSize: '20" Surface Casing',
        fromDepth: 450,
        toDepth: 950,
        mudType: 'KCl / Polymer',
        mudWeight: 1.16,
        shoeTestLOT: 1.44
      },
      {
        holeSize: '17 1/2"',
        casingSize: '13 3/8" Intermediate',
        fromDepth: 950,
        toDepth: 1800,
        mudType: 'Water-Based Glycol Inhibited Mud',
        mudWeight: 1.26,
        shoeTestLOT: 1.62
      },
      {
        holeSize: '12 1/4"',
        casingSize: '9 5/8" Casing',
        fromDepth: 1800,
        toDepth: 2750,
        mudType: 'Low-toxicity OBM',
        mudWeight: 1.34,
        shoeTestLOT: 1.76
      }
    ],
    issues: [
      {
        id: 'iss-4120-1',
        category: 'Gas Kick / Well Control',
        depthMD: 1820,
        holeSection: '12 1/4" section',
        severity: 'Medium',
        nptHours: 16.0,
        title: 'Methane hydrate crystallization risk in deepwater choke line',
        description:
          'Encountered low seabed water temperatures (subsea temperature -0.5°C) creating hydrate formation risk during flow check on a 1.2 m³ gas influx.',
        remedialAction:
          'Continuous monoethylene glycol (MEG) injection initiated into the subsea choke manifold before circulating out the kick to prevent blockages.'
      }
    ],
    surveyStations: [
      { md: 0, inc: 0.0, azi: 0.0 },
      { md: 900, inc: 1.0, azi: 240.0, comment: 'Kickoff Point' },
      { md: 1500, inc: 24.0, azi: 242.0 },
      { md: 2100, inc: 42.0, azi: 241.0, comment: 'Hold Tangent' },
      { md: 2750, inc: 41.5, azi: 240.8, comment: 'TD 2,750m MD' }
    ]
  }
];
