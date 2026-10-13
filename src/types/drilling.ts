/**
 * Directional Drilling Data Types & Interfaces
 */

export interface SurveyStation {
  md: number;        // Measured Depth (m or ft)
  inc: number;       // Inclination (degrees, 0 = vertical, 90 = horizontal)
  azi: number;       // Azimuth (degrees, 0-360)
  comment?: string;  // e.g. "KOP", "Surface Casing", "Landing Point", "TD"
}

export interface ComputedStation extends SurveyStation {
  tvd: number;       // True Vertical Depth
  north: number;     // Northing displacement (+ North, - South)
  east: number;      // Easting displacement (+ East, - West)
  vs: number;        // Vertical Section along proposal azimuth
  dls: number;       // Dogleg Severity (deg / 30m or deg / 100ft)
  dogleg: number;    // Dogleg angle in radians between stations
  closureDist: number; // Horizontal distance from wellhead
  closureAzi: number;  // Horizontal azimuth from wellhead
}

export type UnitSystem = 'metric' | 'oilfield';

export interface HoleCasingSection {
  holeSize: string;         // e.g. "36\"", "26\"", "17 1/2\"", "12 1/4\"", "8 1/2\""
  casingSize: string;       // e.g. "30\"", "20\"", "13 3/8\"", "9 5/8\"", "7\" Liner"
  fromDepth: number;        // MD (m)
  toDepth: number;          // MD (m)
  mudType: string;          // e.g. "Seawater/Bentonite", "Versaclean OBM"
  mudWeight: number;        // SG (e.g. 1.25, 1.48)
  shoeTestLOT?: number;     // Leak-off test or FIT in SG equivalent (e.g. 1.65 SG)
  bitType?: string;         // e.g. "PDC 6-blade 16mm", "Roller cone milled tooth"
}

export interface OperationalIssue {
  id: string;
  category:
    | 'Stuck Pipe'
    | 'Lost Circulation'
    | 'Gas Kick / Well Control'
    | 'Wellbore Instability / Pack-off'
    | 'BHA / Tool Failure'
    | 'Severe Weather Suspension';
  depthMD: number;          // MD where issue occurred
  holeSection: string;      // e.g. "12 1/4\" section"
  severity: 'High' | 'Medium' | 'Low';
  nptHours: number;         // Non-Productive Time in hours
  title: string;
  description: string;
  remedialAction: string;
}

export interface DepthLogPoint {
  md: number;          // Measured Depth (m)
  tvd: number;         // True Vertical Depth (m)
  rop: number;         // Rate of Penetration (m/hr)
  wob: number;         // Weight on Bit (tonnes)
  torque: number;      // Rotary Torque (kNm)
  rpm: number;         // Surface Rotary Speed (RPM)
  flowRate: number;    // Mud Flow Rate (L/min)
  spp: number;         // Standpipe Pressure (bar)
  ecd: number;         // Equivalent Circulating Density (SG)
  gammaRay: number;    // MWD Gamma Ray (API)
  mode: 'Rotating' | 'Sliding (Motor)' | 'RSS Steering' | 'Reaming';
  operationNote?: string;
}

export interface TimeLogPoint {
  timeStr: string;     // e.g. "14:00"
  elapsedHours: number;// Hours since section start
  bitDepthMD: number;  // Current bit depth (m)
  holeDepthMD: number; // Current bottom of hole depth (m)
  rop: number;         // Instantaneous ROP (m/hr)
  wob: number;         // WOB (tonnes)
  torque: number;      // Torque (kNm)
  rpm: number;         // RPM
  flowRate: number;    // Mud Flow (L/min)
  spp: number;         // SPP (bar)
  hookload: number;    // Hookload (tonnes)
  mode:
    | 'Drilling Ahead'
    | 'Sliding (Steering)'
    | 'Connection / Pipe Add'
    | 'Circulating / Sweeping'
    | 'Reaming / Working Tight Hole';
  statusNote?: string;
}

export interface SectionLogData {
  sectionId: string;
  holeSize: string;
  casingSize: string;
  fromDepth: number;
  toDepth: number;
  mudType: string;
  mudWeight: number;
  drillingHours: number;
  avgROP: number;
  maxWOB: number;
  maxTorque: number;
  depthLogs: DepthLogPoint[];
  timeLogs: TimeLogPoint[];
}

export interface NorwayWellbore {
  id: string;
  wellName: string;          // e.g. "15/9-F-12"
  npdid: number;             // Official Norwegian Offshore Directorate Wellbore ID
  field: string;             // e.g. "Volve"
  block: string;             // e.g. "15/9"
  sector: 'North Sea' | 'Norwegian Sea' | 'Barents Sea';
  operator: string;          // e.g. "Equinor Energy AS"
  license: string;           // e.g. "PL 046"
  lat: number;               // WGS84 Latitude
  lng: number;               // WGS84 Longitude
  utmZone: string;           // e.g. "ED50 / UTM Zone 31N"
  waterDepth: number;        // meters
  rkbElevation: number;      // meters above MSL
  spudDate: string;          // e.g. "12-May-2007"
  completionDate: string;    // e.g. "28-Jun-2007"
  rigDays: number;
  drillingFacility: string;  // e.g. "Mærsk Inspirer"
  facilityType: 'Jack-up' | 'Semi-submersible' | 'Fixed Platform DP' | 'Drillship';
  wellType:
    | 'Development Producer'
    | 'Gas Injector'
    | 'Exploration Wildcat'
    | 'Appraisal'
    | 'HPHT Exploration'
    | 'Extended Reach ERD';
  wellStatus: 'Plugged & Abandoned' | 'Producing' | 'Shut In' | 'Suspended';
  totalDepthMD: number;      // m MD
  totalDepthTVD: number;     // m TVD
  maxInclination: number;    // degrees
  kickoffPointMD: number;    // m MD
  steeringSystem: string;    // e.g. "Rotary Steerable (PowerDrive) & 1.5° PDM Motor"
  geologicalFormationAtTD: string; // e.g. "Hugin Fm (Middle Jurassic)"
  sections: HoleCasingSection[];
  issues: OperationalIssue[];
  surveyStations: SurveyStation[];
  officialFactPageUrl: string;
}

export interface DatasetItem {
  id: string;
  title: string;
  provider: string;
  category: 'field-telemetry' | 'regulatory-portal' | 'geothermal' | 'benchmark-standard' | 'python-tools';
  license: string;
  fileFormats: string[];
  description: string;
  highlightData: string[];
  keyWells?: string[];
  accessUrl: string;
  accessType: 'Instant Download' | 'Open REST API' | 'Free Registration' | 'GitHub / PyPI';
  codeSnippet?: string;
  paperReference?: string;
}

export interface TelemetryPoint {
  md: number;
  rop: number;      // m/hr or ft/hr
  wob: number;      // kN or klbf
  torque: number;   // kNm or kft-lbs
  rpm: number;      // RPM
  flowRate: number; // L/min or gpm
  spp: number;      // bar or psi
  mode: 'Rotating' | 'Sliding (Motor)' | 'RSS Steering';
  inc: number;
}

export interface LWDLogPoint {
  md: number;             // Measured Depth (m)
  tvd: number;            // True Vertical Depth (m)
  gr: number;             // Gamma Ray (API, 0-150)
  cali: number;           // Ultrasonic / Density Caliper (inches)
  bitSize: number;        // Nominal bit size (inches, e.g. 8.5)
  rdep: number;           // Deep Propagation Resistivity (ohm.m, log scale 0.2 to 2000)
  rmed: number;           // Medium Propagation Resistivity (ohm.m)
  rshal: number;          // Shallow Propagation Resistivity (ohm.m)
  rhob: number;           // LWD Bulk Density (g/cm³, 1.95 - 2.95)
  nphi: number;           // LWD Neutron Porosity (v/v, -0.15 to 0.45)
  dtc?: number;           // LWD Compressional Sonic (us/ft, 40 - 140)
  grUp?: number;          // Azimuthal Gamma Ray UP (API)
  grDown?: number;        // Azimuthal Gamma Ray DOWN (API)
  formation: string;      // Formation Name (e.g. "Hugin Sandstone", "Heather Shale")
  fluidType: 'Oil' | 'Gas' | 'Water / Brine' | 'Shale Baseline';
  isHydrocarbonCrossover: boolean; // True when NPHI < RHOB crossover occurs
  comment?: string;       // e.g. "Top Hugin Reservoir", "Oil-Water Contact (OWC) @ 3350m MD"
}

export interface LWDDatasetPackage {
  wellName: string;
  field: string;
  sourceRepository: string; // e.g. "Equinor Volve Village / Diskos"
  toolSuites: string[];    // e.g. "Schlumberger EcoScope", "arcVISION"
  fileFormats: string[];   // "LAS 2.0", "DLIS", "CSV"
  publicUrl: string;
  reservoirIntervalMD: string;
  summary: string;
  points: LWDLogPoint[];
}

