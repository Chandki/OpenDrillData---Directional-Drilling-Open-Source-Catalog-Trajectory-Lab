import React, { useState } from 'react';
import { Calculator, ArrowRight, BookOpen, Layers } from 'lucide-react';

export const MathFormulaExplainer: React.FC = () => {
  // Interactive test inputs
  const [md1, setMd1] = useState<number>(1500);
  const [inc1, setInc1] = useState<number>(10.0);
  const [azi1, setAzi1] = useState<number>(45.0);

  const [md2, setMd2] = useState<number>(1530);
  const [inc2, setInc2] = useState<number>(14.5);
  const [azi2, setAzi2] = useState<number>(52.0);

  // Calculations
  const dMD = md2 - md1;
  const d2r = Math.PI / 180;
  const r2d = 180 / Math.PI;

  const i1Rad = inc1 * d2r;
  const i2Rad = inc2 * d2r;
  const a1Rad = azi1 * d2r;
  const a2Rad = azi2 * d2r;

  let cosBeta =
    Math.cos(i1Rad) * Math.cos(i2Rad) +
    Math.sin(i1Rad) * Math.sin(i2Rad) * Math.cos(a2Rad - a1Rad);
  cosBeta = Math.max(-1, Math.min(1, cosBeta));
  const beta = Math.acos(cosBeta);
  const betaDeg = beta * r2d;

  let rf = 1.0;
  if (beta > 1e-6) {
    rf = (2 / beta) * Math.tan(beta / 2);
  }

  const dTVD = (dMD / 2) * (Math.cos(i1Rad) + Math.cos(i2Rad)) * rf;
  const dNorth =
    (dMD / 2) * (Math.sin(i1Rad) * Math.cos(a1Rad) + Math.sin(i2Rad) * Math.cos(a2Rad)) * rf;
  const dEast =
    (dMD / 2) * (Math.sin(i1Rad) * Math.sin(a1Rad) + Math.sin(i2Rad) * Math.sin(a2Rad)) * rf;

  const dls30m = dMD > 0 ? (betaDeg / dMD) * 30 : 0;
  const dls100ft = dMD > 0 ? (betaDeg / dMD) * 100 : 0;

  // Compare with Tangential and Average Angle methods
  // Tangential: uses only station 2 angles
  const tanTVD = dMD * Math.cos(i2Rad);
  const tanNorth = dMD * Math.sin(i2Rad) * Math.cos(a2Rad);
  const tanEast = dMD * Math.sin(i2Rad) * Math.sin(a2Rad);

  // Average Angle: average inclination and average azimuth
  const avgInc = (i1Rad + i2Rad) / 2;
  const avgAzi = (a1Rad + a2Rad) / 2;
  const avgTVD = dMD * Math.cos(avgInc);
  const avgNorth = dMD * Math.sin(avgInc) * Math.cos(avgAzi);
  const avgEast = dMD * Math.sin(avgInc) * Math.sin(avgAzi);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>Minimum Curvature Method (MCM) & Survey Physics</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The <strong>Minimum Curvature Method</strong> is the universal standard defined in SPE literature and API Bulletin D12.
          It models the wellbore trajectory between two survey stations as a <strong>circular arc lying in an inclined plane</strong>.
          A circular arc representation eliminates the severe coordinate errors and artificial dogleg spikes caused by straight-line tangential approximations.
        </p>
      </div>

      {/* Interactive Step-by-Step Calculator */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-sky-400" />
            <span>Interactive Two-Station Minimum Curvature Math Walkthrough</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Live evaluation of intermediate equations
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Station 1 */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="text-xs font-mono font-semibold text-sky-400 mb-2">
              SURVEY STATION 1 (Upper Point)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block">MD (m/ft)</label>
                <input
                  type="number"
                  value={md1}
                  onChange={e => setMd1(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block">Inc (°)</label>
                <input
                  type="number"
                  value={inc1}
                  onChange={e => setInc1(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block">Azi (°)</label>
                <input
                  type="number"
                  value={azi1}
                  onChange={e => setAzi1(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Station 2 */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="text-xs font-mono font-semibold text-amber-400 mb-2">
              SURVEY STATION 2 (Lower Point)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block">MD (m/ft)</label>
                <input
                  type="number"
                  value={md2}
                  onChange={e => setMd2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block">Inc (°)</label>
                <input
                  type="number"
                  value={inc2}
                  onChange={e => setInc2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block">Azi (°)</label>
                <input
                  type="number"
                  value={azi2}
                  onChange={e => setAzi2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Mathematical Decomposition */}
        <div className="space-y-4">
          {/* Step 1: Dogleg Angle */}
          <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
              <span className="font-semibold text-amber-300">
                Step 1: Compute Dogleg Angle (β)
              </span>
              <span className="text-slate-400">
                β = {betaDeg.toFixed(4)}° ({beta.toFixed(5)} rad)
              </span>
            </div>
            <div className="bg-slate-900/90 rounded p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <code>cos(β) = cos(I₁)·cos(I₂) + sin(I₁)·sin(I₂)·cos(A₂ - A₁)</code>
              <div className="text-slate-400 mt-1">
                cos(β) = {Math.cos(i1Rad).toFixed(4)} × {Math.cos(i2Rad).toFixed(4)} +{' '}
                {Math.sin(i1Rad).toFixed(4)} × {Math.sin(i2Rad).toFixed(4)} ×{' '}
                {Math.cos(a2Rad - a1Rad).toFixed(4)} = <strong>{cosBeta.toFixed(6)}</strong>
              </div>
            </div>
          </div>

          {/* Step 2: Ratio Factor RF */}
          <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
              <span className="font-semibold text-amber-300">
                Step 2: Compute Ratio Factor (RF)
              </span>
              <span className="text-slate-400">
                RF = <strong>{rf.toFixed(6)}</strong>
              </span>
            </div>
            <div className="bg-slate-900/90 rounded p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <code>RF = (2 / β) · tan(β / 2)</code>
              <div className="text-slate-400 mt-1">
                (Note: When β &lt; 10⁻⁶ rad, RF approaches exactly 1.0 via Taylor series)
              </div>
            </div>
          </div>

          {/* Step 3: Increments */}
          <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800/80">
            <div className="text-xs font-mono font-semibold text-amber-300 mb-2">
              Step 3: Spherical Increments (ΔTVD, ΔNorth, ΔEast)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-emerald-400 block text-[11px]">ΔTVD (Vertical):</span>
                <span className="text-base font-bold text-slate-100">+{dTVD.toFixed(3)}</span>
                <div className="text-[10px] text-slate-500 mt-1">
                  (ΔMD/2)·(cos I₁ + cos I₂)·RF
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-sky-400 block text-[11px]">ΔNorth (Displacement):</span>
                <span className="text-base font-bold text-slate-100">
                  {dNorth >= 0 ? '+' : ''}{dNorth.toFixed(3)}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">
                  (ΔMD/2)·(sin I₁ cos A₁ + sin I₂ cos A₂)·RF
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-amber-400 block text-[11px]">ΔEast (Displacement):</span>
                <span className="text-base font-bold text-slate-100">
                  {dEast >= 0 ? '+' : ''}{dEast.toFixed(3)}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">
                  (ΔMD/2)·(sin I₁ sin A₁ + sin I₂ sin A₂)·RF
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Dogleg Severity */}
          <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
              <span className="font-semibold text-amber-300">
                Step 4: Dogleg Severity (DLS)
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span>
                  Metric: <strong className="text-emerald-300">{dls30m.toFixed(2)}°/30m</strong>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  Oilfield: <strong className="text-sky-300">{dls100ft.toFixed(2)}°/100ft</strong>
                </span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              DLS = (β_deg / ΔMD) × Normalization Length (30m or 100ft)
            </div>
          </div>
        </div>

        {/* Method Accuracy Comparison Table */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Comparison: Minimum Curvature vs Traditional Approximation Methods
          </h4>

          <div className="overflow-x-auto rounded border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Calculation Method</th>
                  <th className="p-2.5">ΔTVD</th>
                  <th className="p-2.5">ΔNorth</th>
                  <th className="p-2.5">ΔEast</th>
                  <th className="p-2.5">Displacement Error</th>
                  <th className="p-2.5">Industry Adoption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="bg-emerald-500/10 text-emerald-200">
                  <td className="p-2.5 font-bold">Minimum Curvature (MCM)</td>
                  <td className="p-2.5 font-semibold">{dTVD.toFixed(3)}</td>
                  <td className="p-2.5 font-semibold">{dNorth.toFixed(3)}</td>
                  <td className="p-2.5 font-semibold">{dEast.toFixed(3)}</td>
                  <td className="p-2.5 text-emerald-400">0.000 (Reference)</td>
                  <td className="p-2.5 font-semibold">Universal API/SPE Standard</td>
                </tr>
                <tr className="text-slate-300">
                  <td className="p-2.5">Average Angle</td>
                  <td className="p-2.5">{avgTVD.toFixed(3)}</td>
                  <td className="p-2.5">{avgNorth.toFixed(3)}</td>
                  <td className="p-2.5">{avgEast.toFixed(3)}</td>
                  <td className="p-2.5 text-amber-400">
                    {Math.hypot(avgNorth - dNorth, avgEast - dEast).toFixed(3)}
                  </td>
                  <td className="p-2.5 text-slate-500">Rigsite Hand Estimates</td>
                </tr>
                <tr className="text-slate-400">
                  <td className="p-2.5">Tangential (Lower Point)</td>
                  <td className="p-2.5">{tanTVD.toFixed(3)}</td>
                  <td className="p-2.5">{tanNorth.toFixed(3)}</td>
                  <td className="p-2.5">{tanEast.toFixed(3)}</td>
                  <td className="p-2.5 text-red-400">
                    {Math.hypot(tanNorth - dNorth, tanEast - dEast).toFixed(3)}
                  </td>
                  <td className="p-2.5 text-red-500">Deprecated (High Error)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
