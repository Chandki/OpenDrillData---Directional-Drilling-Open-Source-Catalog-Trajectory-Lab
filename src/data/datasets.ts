import { DatasetItem } from '../types/drilling';

export const DRILLING_DATASETS: DatasetItem[] = [
  {
    id: 'equinor-volve',
    title: 'Equinor Volve Field Open Data (North Sea)',
    provider: 'Equinor / Norwegian Offshore Directorate',
    category: 'field-telemetry',
    license: 'CC BY 4.0 (Open Commercial & Academic)',
    fileFormats: ['CSV', 'LAS', 'WITSML', 'DLIS', 'PDF (DDR)'],
    description:
      'The most celebrated open drilling dataset in petroleum engineering history. Covers 15+ complex production and injection wells in Block 15/9 of the North Sea. Includes directional surveys (MD, Inc, Azi, TVD, DLS), high-frequency 1Hz real-time MWD/LWD telemetry (ROP, WOB, RPM, Torque, SPP, Flow Rate, Mud Weight), BHA schematics, and daily drilling reports (DDR).',
    highlightData: [
      'Well 15/9-F-12: Full S-curve production trajectory to 3,450m MD',
      'Well 15/9-F-14 & F-15: Deep horizontal & deviated reservoir penetrations',
      'Continuous MWD gamma, resistivity, and toolface logs',
      'Time-indexed (1-sec) and depth-indexed (0.1m) drilling logs',
      'Complete Daily Drilling Reports (DDR) & bit record wear sheets'
    ],
    keyWells: ['15/9-F-12', '15/9-F-1', '15/9-F-4', '15/9-F-5', '15/9-F-11', '15/9-F-14', '15/9-F-15'],
    accessUrl: 'https://data.equinor.com/dataset/volve',
    accessType: 'Instant Download',
    paperReference: 'Equinor (2018). Volve data village open release. Dataverse & Equinor Open Data.',
    codeSnippet: `# Download and inspect Volve directional surveys in Python
import pandas as pd
import numpy as np

# Load Volve well 15/9-F-12 survey table
url = "https://raw.githubusercontent.com/equinor/volve-machine-learning/master/data/well_15_9-F-12_survey.csv"
df = pd.read_csv("15_9-F-12_directional_survey.csv")
print(df[['MD', 'INCL', 'AZI', 'TVD', 'DLS']].head())`
  },
  {
    id: 'utah-forge-geothermal',
    title: 'Utah FORGE Deep Directional Geothermal Drilling Data',
    provider: 'US Department of Energy (DOE) / University of Utah',
    category: 'geothermal',
    license: 'Public Domain / US Government Open Data',
    fileFormats: ['CSV', 'LAS', 'Pason EDR', 'WITSML', 'JSON'],
    description:
      'Pioneering open dataset for high-temperature deep directional drilling. Well 16A(78)-32 and Well 16B(78)-32 were drilled into granitic basement rock at temperatures exceeding 225°C with a 65° inclination tangent section. Features second-by-second Pason EDR rig telemetry, mud motor sliding vs rotary steerable (RSS) performance, axial and torsional vibration, and bit wear.',
    highlightData: [
      'Well 16A(78)-32: 65° tangent drilled in hard granitic basement (TD: 10,950 ft)',
      '1Hz drilling mechanics (ROP, WOB, Torque, Differential Pressure, Flow)',
      'Drilling vibration & shock data (axial, radial, stick-slip)',
      'Sliding vs rotating directional steering efficiency logs',
      'PDC cutter thermal degradation and dull bit gradings'
    ],
    keyWells: ['16A(78)-32', '16B(78)-32', '58-32', '78-32'],
    accessUrl: 'https://gdr.openei.org/submissions/1344',
    accessType: 'Instant Download',
    paperReference: 'Moore, J. et al. (2022). Drilling the deep directional injection well 16A(78)-32. Geothermal Resources Council.',
    codeSnippet: `# Querying Utah FORGE drilling mechanics on DOE GDR
import urllib.request
import pandas as pd

forge_telemetry = pd.read_csv("forge_16a_78_32_edr_drilling.csv")
# Filter sliding vs rotating drilling intervals
sliding_intervals = forge_telemetry[forge_telemetry['TOOLFACE_MODE'] == 'SLIDING']
print(f"Sliding footage: {sliding_intervals['HOLE_DEPTH'].diff().sum():.1f} ft")`
  },
  {
    id: 'norwegian-nod-factpages',
    title: 'Norwegian Offshore Directorate (NOD) Wellbore FactPages & Diskos',
    provider: 'Norwegian Offshore Directorate (formerly NPD)',
    category: 'regulatory-portal',
    license: 'Norwegian Open Government Licence (NLOD)',
    fileFormats: ['CSV', 'REST API', 'XML', 'Shapefile'],
    description:
      'National open repository of over 7,500 exploration, appraisal, and development wellbores drilled on the Norwegian Continental Shelf. Offers downloadable directional survey tables (MD, Inc, Azi, TVD, North, East, DLS), wellhead coordinates, casing depths, stratigraphy tops, and automated REST endpoints.',
    highlightData: [
      'Comprehensive deviation surveys for 7,500+ North Sea & Barents Sea wells',
      'REST Web API for programmatic query by Wellbore ID or Field name',
      'Official UTM zone 31/32 coordinates and Kelly Bushing (KB) elevations',
      'Free bulk CSV export of all horizontal and multi-lateral well paths'
    ],
    keyWells: ['Ekofisk, Troll, Johan Sverdrup, Oseberg, Snøhvit wellbores'],
    accessUrl: 'https://factpages.sodir.no/en/wellbore',
    accessType: 'Open REST API',
    paperReference: 'Sodir/NPD FactPages Database (2026). Offshore Wellbore Directional Surveys.',
    codeSnippet: `# Fetch directional well surveys via NOD public web table
import requests
import io
import pandas as pd

url = "https://factpages.sodir.no/service/tableview/wellbore_development_survey"
# Direct CSV stream from official NOD endpoint
resp = requests.get(url)
print(f"Status: {resp.status_code}")`
  },
  {
    id: 'uk-nsta-ndr',
    title: 'UK North Sea Transition Authority (NSTA) National Data Repository',
    provider: 'UK North Sea Transition Authority (NSTA)',
    category: 'regulatory-portal',
    license: 'Open Government Licence v3.0 (UK OGL)',
    fileFormats: ['LAS', 'DLIS', 'WITSML', 'CSV', 'ASCII Survey'],
    description:
      'Contains petrophysical and directional drilling records for over 12,000 UKCS offshore wells. Accessible via the National Data Repository (NDR). Includes definitive gyro and MWD deviation surveys, well trajectories, completion schematics, and borehole geometry logs.',
    highlightData: [
      '12,000+ UK Continental Shelf offshore well trajectory survey archives',
      'Definitive MWD, Gyro, and continuous gyroscopic survey records',
      'Clair, Buzzard, Forties, and Brent field extended-reach wells (ERD)',
      'Searchable by Quad / Block (e.g. 211/29, 21/10)'
    ],
    keyWells: ['Brent B-01', 'Clair Ridge Extended Reach', 'Buzzard P-01'],
    accessUrl: 'https://ndr.nstauthority.co.uk',
    accessType: 'Free Registration',
    paperReference: 'NSTA National Data Repository Digital Survey Asset Archive.',
    codeSnippet: `# Querying UK NDR API or reading definitive gyro surveys
# Free user account required for API token authentication
# Provides raw deviation survey files (.DAT, .SVY, .WITSML)`
  },
  {
    id: 'iscwsa-benchmarks',
    title: 'ISCWSA Benchmark Well Trajectories & Error Models',
    provider: 'Industry Steering Committee for Wellbore Survey Accuracy (SPE)',
    category: 'benchmark-standard',
    license: 'SPE Public Educational & Industry Reference',
    fileFormats: ['CSV', 'Excel', 'MATLAB', 'Python'],
    description:
      'The gold-standard reference validation datasets used by all directional drilling software (Landmark COMPASS, Sysdrill, Baker Hughes JewelSuite, SLB Petrel). Includes ISCWSA Well #1 (S-Turn profile), Well #2 (Deep Tangent Horizontal), and standard Wolff & de Wardt and ISCWSA Rev 5 MWD/Gyro survey instrument error model coefficients.',
    highlightData: [
      'Standard benchmark survey stations designed to test Minimum Curvature algorithms',
      'Exact analytical solution tables to verify software against numerical errors',
      'Instrument Performance Models (MWD magnetic declination, SAG, sensor errors)',
      'Separation factor and anticollision ellipse of uncertainty algorithms'
    ],
    keyWells: ['ISCWSA Well #1 (S-Shape)', 'ISCWSA Well #2 (ERD Horizontal)', 'ISCWSA Well #3'],
    accessUrl: 'https://www.iscwsa.net/committee-groups/error-model/',
    accessType: 'Instant Download',
    paperReference: 'Williamson, H. S. (2000). Accuracy Prediction for Directional MWD. SPE Drilling & Completion.',
    codeSnippet: `# Compare calculation against ISCWSA Benchmark Well #1
# Used to audit Minimum Curvature Method (MCM) floating-point fidelity
# Verify TVD, Northing, Easting against official published standard table`
  },
  {
    id: 'texas-rrc-wellbore-surveys',
    title: 'Texas Railroad Commission (RRC) Directional Survey Database',
    provider: 'Railroad Commission of Texas (RRC)',
    category: 'regulatory-portal',
    license: 'Texas Public Information Act (Public Domain)',
    fileFormats: ['CSV', 'Shapefile', 'PDF (Form W-12)', 'GeoJSON'],
    description:
      'The largest public repository of onshore horizontal and directional wells in the world. Encompasses over 50,000 horizontal shale laterals drilled across the Permian Basin (Midland & Delaware basins), Eagle Ford, and Barnett Shale. Contains certified Form W-12 directional surveys, surface/bottom-hole coordinates, and GIS lateral traces.',
    highlightData: [
      'Over 50,000 horizontal lateral trajectories in Permian and Eagle Ford',
      '1-mile, 2-mile, and 3-mile extended horizontal laterals',
      'Certified Form W-12 survey station tables (MD, Inc, Azi, TVD, Displacement)',
      'Public GIS shapefiles with wellbore surface lines and bottomhole locations'
    ],
    keyWells: ['Permian Basin Wolfcamp Laterals', 'Eagle Ford Shale Horizontals'],
    accessUrl: 'https://www.rrc.texas.gov/oil-and-gas/research-and-statistics/well-data/',
    accessType: 'Instant Download',
    paperReference: 'RRC Texas Public GIS & Directional Survey Filing System.',
    codeSnippet: `# Load Texas RRC Directional Lateral Shapefile in GeoPandas
# import geopandas as gpd
# wells = gpd.read_file("rrc_bottomhole_lines.shp")`
  },
  {
    id: 'wellpathpy-toolkit',
    title: 'Wellpathpy - Open Source Python Wellbore Trajectory Engine',
    provider: 'Open Source Community (PyPI / GitHub)',
    category: 'python-tools',
    license: 'LGPL-3.0 / Open Source',
    fileFormats: ['Python Library', 'CSV', 'JSON', 'WITSML'],
    description:
      'Premier open-source Python library for directional survey calculations and wellbore trajectory manipulation. Implements Minimum Curvature Method (MCM), Radius of Curvature, Tangential, survey interpolation at 1m steps, Dogleg Severity calculation, anticollision scanning, and 3D visualization using Matplotlib/Plotly.',
    highlightData: [
      'Clean Pythonic API for computing 3D coordinates from MD, Inc, Azi',
      'Interpolate well trajectory at any custom MD or TVD step',
      'Calculate Dogleg Severity (deg/30m or deg/100ft)',
      'Import/Export Landmark Compass, WITSML, and CSV formats',
      'Anticollision minimum distance and separation factor algorithms'
    ],
    accessUrl: 'https://github.com/Zapa/wellpathpy',
    accessType: 'GitHub / PyPI',
    codeSnippet: `# pip install wellpathpy
import wellpathpy as wp

# Create trajectory from survey points
raw_dev = [[0, 0, 0], [1000, 0, 0], [1500, 30, 45], [2500, 60, 45]]
dev = wp.deviation(raw_dev)
pos = dev.minimum_curvature()
print("Northing, Easting, TVD computed coordinates:")
print(pos.to_dataframe().head())`
  },
  {
    id: 'osdu-subsurface-trajectories',
    title: 'OSDU Forum Trajectory Schemas & Synthetic Well Catalog',
    provider: 'The Open Group OSDU Forum (AWS, GCP, SLB, Halliburton, Shell)',
    category: 'benchmark-standard',
    license: 'Apache 2.0',
    fileFormats: ['JSON-LD', 'WITSML 2.1', 'Parquet', 'CSV'],
    description:
      'The modern open subsurface standard architecture adopted by major supermajors. Provides official JSON schemas for WellboreTrajectory:1.1.0, WellboreSurvey:1.0.0, definitive station records, azimuth reference types (Grid/True/Magnetic), and synthetic cross-basin test trajectories.',
    highlightData: [
      'Official industry standard WellboreTrajectory JSON schema',
      'Definitive trajectory & survey error ellipse specifications',
      'Synthetic benchmark well models across complex geological environments',
      'Open REST API specs for cloud-native subsurface data ingestion'
    ],
    accessUrl: 'https://community.opengroup.org/osdu/data/data-definitions',
    accessType: 'GitHub / PyPI',
    paperReference: 'The Open Group (2025). OSDU Wellbore Trajectory and Survey Standard Spec.',
    codeSnippet: `# Validating trajectory station records against OSDU JSON Schema
# schema: work-product-component--WellboreTrajectory:1.1.0
trajectory_point = {
  "MeasuredDepth": 3200.0,
  "Inclination": 88.5,
  "Azimuth": 172.0,
  "TrueVerticalDepth": 2450.2,
  "DoglegSeverity": 1.8
}`
  },
  {
    id: 'lasio-witsml-parsers',
    title: 'lasio & witsml-parser (MWD / LWD & Continuous Survey Parsers)',
    provider: 'Kinverarity / Open Source Geophysics Community',
    category: 'python-tools',
    license: 'MIT License',
    fileFormats: ['Python Library', 'LAS 2.0/3.0', 'WITSML 1.4/2.0'],
    description:
      'Industry-standard open-source parsers for reading continuous directional surveys, MWD toolface curves (MTF, GTF), continuous inclination/azimuth curves, gamma ray, and petrophysical logs from rig files.',
    highlightData: [
      'Read and write CWLS LAS 1.2, 2.0, and 3.0 drilling files',
      'Extract continuous MWD inclination and azimuth vs time or depth',
      'Built-in pandas DataFrame conversion for immediate visualization',
      'Robust handling of malformed oilfield header metadata'
    ],
    accessUrl: 'https://github.com/kinverarity1/lasio',
    accessType: 'GitHub / PyPI',
    codeSnippet: `# pip install lasio
import lasio

las = lasio.read("mwd_directional_continuous_log.las")
df = las.df() # Converts curves directly to Pandas
print("Available MWD Curves:", list(df.columns))
# Columns typically: ['DEPT', 'INCL_CONT', 'AZI_CONT', 'GR_MWD', 'ROP']`
  },
  {
    id: 'netherlands-nlog',
    title: 'Netherlands NLOG TNO Open Well Database',
    provider: 'TNO Geological Survey of the Netherlands',
    category: 'regulatory-portal',
    license: 'Dutch Open Government Data',
    fileFormats: ['CSV', 'ASCII', 'LAS', 'PDF'],
    description:
      'Complete public borehole database for the Netherlands onshore and offshore North Sea sectors. Provides over 5,000 complete well deviation survey files, drilling end-of-well reports, and geothermal deviated well profiles.',
    highlightData: [
      '5,000+ well trajectories covering onshore and offshore Dutch sector',
      'Downloadable well deviation tables and composite drilling logs',
      'Detailed geothermal doublet trajectory files in the West Netherlands Basin',
      'Open GIS map server with web feature services (WFS/WMS)'
    ],
    keyWells: ['Groningen Gas Field production wells', 'West Netherlands Geothermal doublets'],
    accessUrl: 'https://www.nlog.nl/en/data',
    accessType: 'Instant Download',
    paperReference: 'TNO Geological Survey. NLOG Oil and Gas Portal in the Netherlands.',
    codeSnippet: `# Explore Dutch well deviation records via NLOG open portal
# Download CSV tables with Rijksdriehoek (RD) / UTM coordinates`
  }
];
