import { SurveyStation, ComputedStation } from '../types/drilling';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Computes 3D trajectory from survey stations using the industry standard Minimum Curvature Method (MCM).
 *
 * @param stations Array of survey stations (MD, Inc, Azi)
 * @param proposalAzi Proposal/target azimuth in degrees for calculating vertical section (default: closure azimuth or 0)
 * @param unit Course length standard: 30 for meters (deg/30m), 100 for feet (deg/100ft)
 */
export function calculateMinimumCurvature(
  stations: SurveyStation[],
  proposalAzi: number = 0,
  courseNorm: 30 | 100 = 30
): ComputedStation[] {
  if (!stations || stations.length === 0) return [];

  // Sort by measured depth ascending
  const sorted = [...stations].sort((a, b) => a.md - b.md);

  const results: ComputedStation[] = [];

  // Station 0 (usually surface: MD=0, Inc=0, Azi=0, TVD=0, N=0, E=0)
  const first = sorted[0];
  const initialTVD = 0;
  const initialN = 0;
  const initialE = 0;

  results.push({
    ...first,
    tvd: initialTVD,
    north: initialN,
    east: initialE,
    vs: 0,
    dls: 0,
    dogleg: 0,
    closureDist: 0,
    closureAzi: 0,
  });

  for (let i = 1; i < sorted.length; i++) {
    const prev = results[i - 1];
    const curr = sorted[i];

    const deltaMD = curr.md - prev.md;

    if (deltaMD <= 0) {
      // Duplicate or negative MD step
      results.push({
        ...curr,
        tvd: prev.tvd,
        north: prev.north,
        east: prev.east,
        vs: prev.vs,
        dls: 0,
        dogleg: 0,
        closureDist: prev.closureDist,
        closureAzi: prev.closureAzi,
      });
      continue;
    }

    const inc1 = prev.inc * DEG2RAD;
    const inc2 = curr.inc * DEG2RAD;
    const azi1 = prev.azi * DEG2RAD;
    const azi2 = curr.azi * DEG2RAD;

    // Dogleg angle beta between stations
    // cos(beta) = cos(inc1)*cos(inc2) + sin(inc1)*sin(inc2)*cos(azi2 - azi1)
    let cosBeta =
      Math.cos(inc1) * Math.cos(inc2) +
      Math.sin(inc1) * Math.sin(inc2) * Math.cos(azi2 - azi1);

    // Guard against floating point drift exceeding [-1, 1]
    cosBeta = Math.max(-1, Math.min(1, cosBeta));
    const beta = Math.acos(cosBeta);

    // Ratio Factor RF:
    // When beta is very small (< 1e-5 rad), Taylor expansion RF ~= 1 + (beta^2)/12 + ...
    let rf = 1.0;
    if (beta > 1e-6) {
      rf = (2 / beta) * Math.tan(beta / 2);
    }

    // Coordinate increments
    const deltaTVD = (deltaMD / 2) * (Math.cos(inc1) + Math.cos(inc2)) * rf;
    const deltaNorth =
      (deltaMD / 2) *
      (Math.sin(inc1) * Math.cos(azi1) + Math.sin(inc2) * Math.cos(azi2)) *
      rf;
    const deltaEast =
      (deltaMD / 2) *
      (Math.sin(inc1) * Math.sin(azi1) + Math.sin(inc2) * Math.sin(azi2)) *
      rf;

    const tvd = prev.tvd + deltaTVD;
    const north = prev.north + deltaNorth;
    const east = prev.east + deltaEast;

    // Dogleg Severity (DLS) normalized to course length (e.g. 30m or 100ft)
    const dls = (beta * RAD2DEG / deltaMD) * courseNorm;

    // Closure calculation
    const closureDist = Math.hypot(north, east);
    let closureAzi = (Math.atan2(east, north) * RAD2DEG + 360) % 360;
    if (closureDist < 0.001) closureAzi = 0;

    // Vertical Section along specified proposal azimuth
    const propAziRad = proposalAzi * DEG2RAD;
    const vs = north * Math.cos(propAziRad) + east * Math.sin(propAziRad);

    results.push({
      ...curr,
      tvd,
      north,
      east,
      vs,
      dls,
      dogleg: beta * RAD2DEG,
      closureDist,
      closureAzi,
    });
  }

  return results;
}

/**
 * Generates WITSML 1.4.1.1 trajectory XML string from computed survey stations
 */
export function exportToWitsml(wellName: string, stations: ComputedStation[], unit: 'm' | 'ft' = 'm'): string {
  const dateStr = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<trajectorys xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <trajectory uidWell="${wellName.toLowerCase().replace(/[^a-z0-9]/g, '_')}" uid="traj-1">
    <nameWell>${wellName}</nameWell>
    <name>Directional Survey Run</name>
    <dTimTraj>${dateStr}</dTimTraj>
    <mdMin uom="${unit}">${stations[0]?.md.toFixed(2) || '0.00'}</mdMin>
    <mdMax uom="${unit}">${stations[stations.length - 1]?.md.toFixed(2) || '0.00'}</mdMax>
    <serviceCompany>OpenDrillData Research</serviceCompany>
    <magDeclinationUsed uom="dega">0.0</magDeclinationUsed>
    <gridCorUsed uom="dega">0.0</gridCorUsed>
    <aziRef>true north</aziRef>
    ${stations
      .map(
        (s, idx) => `
    <trajectoryStation uid="st-${idx + 1}">
      <dTimStn>${dateStr}</dTimStn>
      <typeTrajStation>unknown</typeTrajStation>
      <md uom="${unit}">${s.md.toFixed(2)}</md>
      <tvd uom="${unit}">${s.tvd.toFixed(2)}</tvd>
      <incl uom="dega">${s.inc.toFixed(2)}</incl>
      <azi uom="dega">${s.azi.toFixed(2)}</azi>
      <dls uom="dega/${unit === 'm' ? '30m' : '100ft'}">${s.dls.toFixed(2)}</dls>
      <dispNs uom="${unit}">${s.north.toFixed(2)}</dispNs>
      <dispEw uom="${unit}">${s.east.toFixed(2)}</dispEw>
      <vertSect uom="${unit}">${s.vs.toFixed(2)}</vertSect>
    </trajectoryStation>`
      )
      .join('')}
  </trajectory>
</trajectorys>`;
}

/**
 * Generates standard CSV survey export
 */
export function exportToCSV(stations: ComputedStation[], unit: 'm' | 'ft' = 'm'): string {
  const headers = [
    `MD (${unit})`,
    'Inclination (deg)',
    'Azimuth (deg)',
    `TVD (${unit})`,
    `Northing (${unit})`,
    `Easting (${unit})`,
    `Vertical_Section (${unit})`,
    `DLS (deg/${unit === 'm' ? '30m' : '100ft'})`,
    `Closure_Distance (${unit})`,
    'Closure_Azimuth (deg)',
    'Comment'
  ];

  const rows = stations.map(s => [
    s.md.toFixed(2),
    s.inc.toFixed(2),
    s.azi.toFixed(2),
    s.tvd.toFixed(2),
    s.north.toFixed(2),
    s.east.toFixed(2),
    s.vs.toFixed(2),
    s.dls.toFixed(2),
    s.closureDist.toFixed(2),
    s.closureAzi.toFixed(2),
    s.comment || ''
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
