import React, { useState } from 'react';
import { VOLVE_TELEMETRY_SAMPLE } from '../data/telemetryData';
import { Activity, Gauge, Flame, Compass, RefreshCw, ArrowUpDown } from 'lucide-react';

interface TelemetryViewerProps {
  unit?: 'metric' | 'oilfield';
  onToggleUnit?: () => void;
}

export const TelemetryViewer: React.FC<TelemetryViewerProps> = ({
  unit = 'metric',
  onToggleUnit,
}) => {
  const isOilfield = unit === 'oilfield';
  const depthFactor = isOilfield ? 3.28084 : 1.0;
  const depthUnit = isOilfield ? 'ft' : 'm';
  const ropFactor = isOilfield ? 3.28084 : 1.0;
  const ropUnit = isOilfield ? 'ft/hr' : 'm/hr';
  const wobFactor = isOilfield ? 2.20462 : 1.0;
  const wobUnit = isOilfield ? 'klbf' : 'tonnes';
  const trqFactor = isOilfield ? 0.73756 : 1.0;
  const trqUnit = isOilfield ? 'kft-lbs' : 'kNm';

  const [selectedDepth, setSelectedDepth] = useState<number>(VOLVE_TELEMETRY_SAMPLE[5].md);

  const activePoint =
    VOLVE_TELEMETRY_SAMPLE.find(p => p.md === selectedDepth) || VOLVE_TELEMETRY_SAMPLE[0];

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <span>Real-Time Directional Drilling Telemetry & MWD Mechanics</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Open drilling datasets like <strong>Equinor Volve</strong> and <strong>Utah FORGE</strong> include continuous 1Hz MWD rig telemetry.
              Directional control requires alternating between <strong>Sliding mode</strong> (mud motor bent sub oriented at a fixed toolface angle, RPM=0) to build inclination/turn azimuth, and <strong>Rotating mode</strong> to drill ahead with higher ROP.
            </p>
          </div>

          {onToggleUnit && (
            <button
              onClick={onToggleUnit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-950 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-slate-200 rounded-lg transition-colors shadow-sm shrink-0 self-start"
              title="Toggle between Metric and Oilfield units across logs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px]">Unit:</span>
              <span className="font-bold text-amber-300">
                {isOilfield ? 'Oilfield (ft, psi)' : 'Metric (m, bar)'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Synchronized Multi-Track Log Viewer */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" />
              <span>Volve Well 15/9-F-12 Kickoff & Build Telemetry Track</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Depth Interval: {(1200 * depthFactor).toFixed(0)}{depthUnit} – {(3450 * depthFactor).toFixed(0)}{depthUnit} MD
            </span>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Active Station:</span>
            <span className="text-amber-300 font-bold">{(activePoint.md * depthFactor).toFixed(0)}{depthUnit} MD</span>
            <span className="text-slate-600">|</span>
            <span className={activePoint.mode.includes('Sliding') ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {activePoint.mode}
            </span>
          </div>
        </div>

        {/* Live Gauges for Active Depth */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">ROP ({ropUnit})</span>
            <span className="text-lg font-bold font-mono text-sky-300">{(activePoint.rop * ropFactor).toFixed(1)}</span>
            <div className="text-[10px] text-slate-500 mt-1">Rate of Penetration</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">WOB ({wobUnit})</span>
            <span className="text-lg font-bold font-mono text-amber-300">{(activePoint.wob * wobFactor).toFixed(1)}</span>
            <div className="text-[10px] text-slate-500 mt-1">Weight on Bit</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">Torque ({trqUnit})</span>
            <span className="text-lg font-bold font-mono text-emerald-300">{(activePoint.torque * trqFactor).toFixed(1)}</span>
            <div className="text-[10px] text-slate-500 mt-1">Rotary Torque</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">Rig RPM</span>
            <span className="text-lg font-bold font-mono text-violet-300">{activePoint.rpm}</span>
            <div className="text-[10px] text-slate-500 mt-1">Surface Rotation</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">Inclination (°)</span>
            <span className="text-lg font-bold font-mono text-red-300">{activePoint.inc.toFixed(1)}°</span>
            <div className="text-[10px] text-slate-500 mt-1">Hole Angle</div>
          </div>
        </div>

        {/* Visual Well Log Tracks Table / Strip Chart */}
        <div className="overflow-x-auto rounded border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">MD ({depthUnit})</th>
                <th className="p-2.5">Steering Mode</th>
                <th className="p-2.5">ROP Strip ({ropUnit})</th>
                <th className="p-2.5">WOB ({wobUnit})</th>
                <th className="p-2.5">Torque ({trqUnit})</th>
                <th className="p-2.5">RPM</th>
                <th className="p-2.5">Inc (°)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {VOLVE_TELEMETRY_SAMPLE.map((p, idx) => {
                const isSelected = p.md === selectedDepth;
                const isSliding = p.mode.includes('Sliding');
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedDepth(p.md)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/20 text-white font-semibold'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <td className="p-2.5 font-bold">{(p.md * depthFactor).toFixed(0)}</td>
                    <td className="p-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                          isSliding
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {p.mode}
                      </span>
                    </td>
                    <td className="p-2.5 min-w-[140px]">
                      <div className="w-full bg-slate-950 rounded h-2 overflow-hidden flex items-center">
                        <div
                          className="bg-sky-400 h-full rounded"
                          style={{ width: `${Math.min(100, (p.rop / 35) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{(p.rop * ropFactor).toFixed(1)} {ropUnit}</span>
                    </td>
                    <td className="p-2.5 min-w-[110px]">
                      <div className="w-full bg-slate-950 rounded h-2 overflow-hidden flex items-center">
                        <div
                          className="bg-amber-400 h-full rounded"
                          style={{ width: `${Math.min(100, (p.wob / 25) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{(p.wob * wobFactor).toFixed(1)} {wobUnit}</span>
                    </td>
                    <td className="p-2.5 min-w-[110px]">
                      <div className="w-full bg-slate-950 rounded h-2 overflow-hidden flex items-center">
                        <div
                          className="bg-emerald-400 h-full rounded"
                          style={{ width: `${Math.min(100, (p.torque / 20) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{(p.torque * trqFactor).toFixed(1)} {trqUnit}</span>
                    </td>
                    <td className="p-2.5">{p.rpm}</td>
                    <td className="p-2.5 text-red-300 font-bold">{p.inc.toFixed(1)}°</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Directional Drilling Engineering Insight */}
        <div className="mt-5 p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="font-semibold text-amber-300 font-mono text-[11px] uppercase tracking-wider">
            Engineering Observation: Sliding vs. Rotating Dynamics
          </div>
          <p>
            When entering <strong>Sliding mode</strong> to build inclination (e.g. from 1,300m to 1,350m MD), notice that:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>
              <strong>Surface RPM is set to 0:</strong> The drill string is static to maintain bit orientation. The bit only turns via the mud motor powered by fluid flow.
            </li>
            <li>
              <strong>ROP drops significantly (from ~20 m/h down to ~8 m/h):</strong> Static string friction along the wellbore wall creates drag, making weight transfer difficult.
            </li>
            <li>
              <strong>Torque and Standpipe Pressure increase:</strong> Higher mud motor reactive torque and motor differential pressure occur during sliding steering.
            </li>
            <li>
              <strong>Rotating sections:</strong> Once target inclination and azimuth are achieved, rotary drilling is resumed, restoring full penetration rate.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
