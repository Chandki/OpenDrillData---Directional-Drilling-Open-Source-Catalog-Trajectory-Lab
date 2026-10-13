import React, { useState } from 'react';
import { ComputedStation } from '../types/drilling';

interface Trajectory2DViewsProps {
  stations: ComputedStation[];
  unit: 'metric' | 'oilfield';
  proposalAzi: number;
  selectedStationIdx: number | null;
  onSelectStation: (idx: number) => void;
}

export const Trajectory2DViews: React.FC<Trajectory2DViewsProps> = ({
  stations,
  unit,
  proposalAzi,
  selectedStationIdx,
  onSelectStation,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'plan' | 'section'>('both');

  if (!stations || stations.length === 0) return null;

  // Compute extents for Plan View (Northing vs Easting)
  let minNorth = 0, maxNorth = 0;
  let minEast = 0, maxEast = 0;
  let maxTVD = 0;
  let minVS = 0, maxVS = 0;

  stations.forEach(s => {
    if (s.north < minNorth) minNorth = s.north;
    if (s.north > maxNorth) maxNorth = s.north;
    if (s.east < minEast) minEast = s.east;
    if (s.east > maxEast) maxEast = s.east;
    if (s.tvd > maxTVD) maxTVD = s.tvd;
    if (s.vs < minVS) minVS = s.vs;
    if (s.vs > maxVS) maxVS = s.vs;
  });

  // Add margins
  const padN = Math.max(Math.abs(maxNorth - minNorth) * 0.15, 100);
  const padE = Math.max(Math.abs(maxEast - minEast) * 0.15, 100);
  const planMinX = Math.min(minEast - padE, -100);
  const planMaxX = Math.max(maxEast + padE, 100);
  const planMinY = Math.min(minNorth - padN, -100);
  const planMaxY = Math.max(maxNorth + padN, 100);

  const planWidth = planMaxX - planMinX;
  const planHeight = planMaxY - planMinY;

  // Plan View coordinate mapping: Easting -> SVG X, Northing -> SVG Y (flipped, since SVG 0 is top)
  const mapPlanX = (east: number) => ((east - planMinX) / planWidth) * 360 + 20;
  const mapPlanY = (north: number) => ((planMaxY - north) / planHeight) * 260 + 20;

  // Section View extents: X = Vertical Section, Y = TVD
  const padVS = Math.max(Math.abs(maxVS - minVS) * 0.15, 100);
  const sectMinX = Math.min(minVS - padVS, -50);
  const sectMaxX = Math.max(maxVS + padVS, 100);
  const sectMaxY = maxTVD * 1.08;

  const sectWidth = sectMaxX - sectMinX;
  const sectHeight = sectMaxY;

  const mapSectX = (vs: number) => ((vs - sectMinX) / sectWidth) * 360 + 20;
  const mapSectY = (tvd: number) => (tvd / sectHeight) * 260 + 20;

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>2D Engineering Projections</span>
            <span className="text-xs font-mono text-slate-400 font-normal">
              Plan View & Vertical Section
            </span>
          </h3>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              activeTab === 'both' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dual View
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              activeTab === 'plan' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Plan View (N-E)
          </button>
          <button
            onClick={() => setActiveTab('section')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              activeTab === 'section' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Section View (TVD-VS)
          </button>
        </div>
      </div>

      {/* Grid of Views */}
      <div className={`grid gap-4 ${activeTab === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* PLAN VIEW */}
        {(activeTab === 'both' || activeTab === 'plan') && (
          <div className="bg-slate-950 rounded-lg border border-slate-800/80 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-sky-400">
                PLAN VIEW (HORIZONTAL DISPLACEMENT)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                X: Easting · Y: Northing ({unit})
              </span>
            </div>

            <div className="relative w-full aspect-[4/3] bg-slate-950/80 rounded border border-slate-900 overflow-hidden">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Background Grid Lines */}
                <line x1="20" y1="20" x2="380" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="20" y1="150" x2="380" y2="150" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="20" y1="280" x2="380" y2="280" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="200" y1="20" x2="200" y2="280" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Wellhead Origin Lines (E=0, N=0) */}
                <line
                  x1={mapPlanX(0)}
                  y1="20"
                  x2={mapPlanX(0)}
                  y2="280"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                <line
                  x1="20"
                  y1={mapPlanY(0)}
                  x2="380"
                  y2={mapPlanY(0)}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />

                {/* Proposal Azimuth Line */}
                {(() => {
                  const endStation = stations[stations.length - 1];
                  const lineLength = Math.max(endStation.closureDist * 1.1, 500);
                  const rad = (proposalAzi * Math.PI) / 180;
                  const targetE = lineLength * Math.sin(rad);
                  const targetN = lineLength * Math.cos(rad);
                  return (
                    <line
                      x1={mapPlanX(0)}
                      y1={mapPlanY(0)}
                      x2={mapPlanX(targetE)}
                      y2={mapPlanY(targetN)}
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      strokeDasharray="5 3"
                      opacity="0.6"
                    />
                  );
                })()}

                {/* Trajectory Polyline */}
                <polyline
                  points={stations.map(s => `${mapPlanX(s.east)},${mapPlanY(s.north)}`).join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Target Circle at TD */}
                {(() => {
                  const td = stations[stations.length - 1];
                  return (
                    <circle
                      cx={mapPlanX(td.east)}
                      cy={mapPlanY(td.north)}
                      r="10"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                  );
                })()}

                {/* Station Dots */}
                {stations.map((s, idx) => {
                  const isSelected = selectedStationIdx === idx;
                  return (
                    <circle
                      key={idx}
                      cx={mapPlanX(s.east)}
                      cy={mapPlanY(s.north)}
                      r={isSelected ? 5 : 2.5}
                      fill={isSelected ? '#f59e0b' : '#38bdf8'}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth="1"
                      className="cursor-pointer hover:r-4 transition-all"
                      onClick={() => onSelectStation(idx)}
                    >
                      <title>{`MD: ${s.md}${unit === 'metric' ? 'm' : 'ft'}, Inc: ${s.inc}°, Azi: ${s.azi}°, N: ${s.north.toFixed(1)}, E: ${s.east.toFixed(1)}`}</title>
                    </circle>
                  );
                })}

                {/* Origin Wellhead Marker */}
                <circle cx={mapPlanX(0)} cy={mapPlanY(0)} r="4.5" fill="#ef4444" />
                <text
                  x={mapPlanX(0) + 7}
                  y={mapPlanY(0) + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  Wellhead (0,0)
                </text>

                {/* North Indicator */}
                <g transform="translate(40, 45)">
                  <line x1="0" y1="12" x2="0" y2="-12" stroke="#38bdf8" strokeWidth="1.5" />
                  <polygon points="0,-16 -4,-10 4,-10" fill="#38bdf8" />
                  <text x="7" y="-8" fill="#38bdf8" fontSize="10" fontWeight="bold">N</text>
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* SECTION VIEW */}
        {(activeTab === 'both' || activeTab === 'section') && (
          <div className="bg-slate-950 rounded-lg border border-slate-800/80 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-emerald-400">
                VERTICAL SECTION (TVD PROFILE)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                X: Vert Sect · Y: TVD ({unit})
              </span>
            </div>

            <div className="relative w-full aspect-[4/3] bg-slate-950/80 rounded border border-slate-900 overflow-hidden">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Depth Reference Lines */}
                <line x1="20" y1="20" x2="380" y2="20" stroke="#334155" strokeWidth="1" />
                <line x1="20" y1="90" x2="380" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="20" y1="160" x2="380" y2="160" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="20" y1="230" x2="380" y2="230" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Sea/Ground level text */}
                <text x="25" y="16" fill="#64748b" fontSize="9" fontFamily="monospace">
                  Surface RKB (0 {unit})
                </text>

                {/* Trajectory Polyline in Vertical Section */}
                <polyline
                  points={stations.map(s => `${mapSectX(s.vs)},${mapSectY(s.tvd)}`).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Station Nodes */}
                {stations.map((s, idx) => {
                  const isSelected = selectedStationIdx === idx;
                  return (
                    <circle
                      key={idx}
                      cx={mapSectX(s.vs)}
                      cy={mapSectY(s.tvd)}
                      r={isSelected ? 5 : 2.5}
                      fill={isSelected ? '#f59e0b' : '#10b981'}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth="1"
                      className="cursor-pointer hover:r-4 transition-all"
                      onClick={() => onSelectStation(idx)}
                    >
                      <title>{`MD: ${s.md}${unit === 'metric' ? 'm' : 'ft'}, TVD: ${s.tvd.toFixed(1)}, VS: ${s.vs.toFixed(1)}, Inc: ${s.inc}°`}</title>
                    </circle>
                  );
                })}

                {/* Target Reservoir Zone */}
                {(() => {
                  const td = stations[stations.length - 1];
                  const y = mapSectY(td.tvd);
                  const x = mapSectX(td.vs);
                  return (
                    <g>
                      <rect
                        x={x - 20}
                        y={y - 8}
                        width="40"
                        height="16"
                        fill="rgba(16, 185, 129, 0.15)"
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <text
                        x={x + 24}
                        y={y + 4}
                        fill="#10b981"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        Target TVD
                      </text>
                    </g>
                  );
                })()}

                {/* TD Marker */}
                {(() => {
                  const td = stations[stations.length - 1];
                  return (
                    <text
                      x={mapSectX(td.vs) - 15}
                      y={mapSectY(td.tvd) + 22}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      TD: {td.md}{unit === 'metric' ? 'm' : 'ft'}
                    </text>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
