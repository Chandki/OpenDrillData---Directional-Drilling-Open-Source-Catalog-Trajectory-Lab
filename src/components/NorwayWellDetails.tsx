import React, { useState } from 'react';
import { NorwayWellbore } from '../types/drilling';
import { calculateMinimumCurvature, exportToCSV, exportToWitsml } from '../utils/minimumCurvature';
import {
  Calendar,
  Anchor,
  Layers,
  AlertTriangle,
  Compass,
  FileText,
  ExternalLink,
  Clock,
  ShieldCheck,
  ChevronRight,
  Download,
  Box,
  CheckCircle2,
  Gauge,
  Activity,
  Database,
  ArrowUpDown,
} from 'lucide-react';
import { NORWAY_LWD_CATALOG } from '../data/lwdData';

interface NorwayWellDetailsProps {
  well: NorwayWellbore;
  unit?: 'metric' | 'oilfield';
  onToggleUnit?: () => void;
  onViewIn3D: (well: NorwayWellbore) => void;
  onViewSectionLogs?: (sectionIdx: number) => void;
  onViewLWD?: (well: NorwayWellbore) => void;
}

export const NorwayWellDetails: React.FC<NorwayWellDetailsProps> = ({
  well,
  unit = 'metric',
  onToggleUnit,
  onViewIn3D,
  onViewSectionLogs,
  onViewLWD,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'issues' | 'surveys' | 'lwd'>('overview');

  const isOilfield = unit === 'oilfield';
  const depthFactor = isOilfield ? 3.28084 : 1.0;
  const depthUnit = isOilfield ? 'ft' : 'm';
  const courseNorm = isOilfield ? 100 : 30;
  const dlsUnit = isOilfield ? '°/100ft' : '°/30m';

  const computedStations = React.useMemo(() => {
    return calculateMinimumCurvature(well.surveyStations, 0, courseNorm);
  }, [well.surveyStations, courseNorm]);

  const totalNptHours = well.issues.reduce((sum, i) => sum + i.nptHours, 0);

  const handleDownloadCSV = () => {
    const csv = exportToCSV(computedStations, isOilfield ? 'ft' : 'm');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${well.wellName.replace(/[^a-z0-9]/gi, '_')}_survey_${unit}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWitsml = () => {
    const xml = exportToWitsml(well.wellName, computedStations, isOilfield ? 'ft' : 'm');
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${well.wellName.replace(/[^a-z0-9]/gi, '_')}_trajectory_${unit}.witsml.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/95 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Well Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-5 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1.5 flex-wrap">
              <span className="text-amber-400 font-semibold">{well.sector}</span>
              <span aria-hidden="true">·</span>
              <span>{well.field} Field</span>
              <span aria-hidden="true">·</span>
              <span>Block {well.block}</span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-400">NPDID: {well.npdid}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">{well.wellStatus}</span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Well {well.wellName}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-normal">
                {well.wellType}
              </span>
            </h2>

            <p className="text-xs text-slate-300 mt-1 font-mono">
              Operator: <strong className="text-slate-100">{well.operator}</strong> · License: {well.license}
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onViewIn3D(well)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Launch 3D Trajectory</span>
            </button>

            {onViewLWD && (
              <button
                onClick={() => onViewLWD(well)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors shadow-sm"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>LWD Petrophysics</span>
              </button>
            )}

            {onToggleUnit && (
              <button
                onClick={onToggleUnit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-950 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-slate-200 rounded-lg transition-colors shadow-sm"
                title="Toggle between Metric and Oilfield units across logs"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400 text-[11px]">Unit:</span>
                <span className="font-bold text-amber-300">
                  {isOilfield ? 'Oilfield (ft)' : 'Metric (m)'}
                </span>
              </button>
            )}

            <a
              href={well.officialFactPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <span>NOD FactPage</span>
              <ExternalLink className="w-3 h-3 text-amber-400" />
            </a>
          </div>
        </div>

        {/* Operational Highlights KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Spud & Completion</span>
            <span className="text-slate-200 font-semibold">{well.spudDate}</span>
            <div className="text-[10px] text-slate-500 mt-0.5">{well.rigDays} rig days</div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Rig Facility</span>
            <span className="text-sky-300 font-semibold truncate block">{well.drillingFacility}</span>
            <div className="text-[10px] text-slate-500 mt-0.5">{well.facilityType}</div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Total Depth</span>
            <span className="text-emerald-300 font-bold">
              {(well.totalDepthMD * depthFactor).toFixed(0)}{depthUnit} MD
            </span>
            <div className="text-[10px] text-slate-500 mt-0.5">
              TVD: {(well.totalDepthTVD * depthFactor).toFixed(0)}{depthUnit}
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Max Inclination</span>
            <span className="text-amber-300 font-bold">{well.maxInclination}°</span>
            <div className="text-[10px] text-slate-500 mt-0.5">
              KOP: {(well.kickoffPointMD * depthFactor).toFixed(0)}{depthUnit} MD
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Water & RKB</span>
            <span className="text-slate-200 font-semibold">
              {(well.waterDepth * depthFactor).toFixed(0)}{depthUnit} WD
            </span>
            <div className="text-[10px] text-slate-500 mt-0.5">
              RKB: +{(well.rkbElevation * depthFactor).toFixed(0)}{depthUnit}
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Issues & NPT</span>
            <span className={well.issues.length > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
              {well.issues.length} {well.issues.length === 1 ? 'incident' : 'incidents'}
            </span>
            <div className="text-[10px] text-slate-500 mt-0.5">NPT: {totalNptHours} hrs</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/50 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 text-xs font-mono font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Operation Summary
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'sections'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Hole Sizes & Casing ({well.sections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'issues'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>Construction Incidents ({well.issues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('surveys')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'surveys'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Directional Survey ({well.surveyStations.length} stns)</span>
        </button>

        <button
          onClick={() => setActiveTab('lwd')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'lwd'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>LWD Petrophysics Logs</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 flex-1 overflow-y-auto">
        {/* TAB 1: OPERATIONAL OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Construction Narrative */}
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Drilling Campaign Timeline & Purpose</span>
                </h4>
                <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                  <p>
                    Well <strong>{well.wellName}</strong> was drilled by operator <strong>{well.operator}</strong> using the offshore facility <strong>{well.drillingFacility}</strong> ({well.facilityType}).
                  </p>
                  <p>
                    Spudded on <strong>{well.spudDate}</strong> and reached total depth on <strong>{well.completionDate}</strong>, executing the wellbore program in <strong>{well.rigDays} cumulative days</strong>.
                  </p>
                  <p>
                    Target reservoir zone reached at <strong>{(well.totalDepthMD * depthFactor).toFixed(0)}{depthUnit} MD ({(well.totalDepthTVD * depthFactor).toFixed(0)}{depthUnit} TVD)</strong> into the <em>{well.geologicalFormationAtTD}</em>.
                  </p>
                </div>
              </div>

              {/* Directional Steering Strategy */}
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  <span>Directional Trajectory & Steering</span>
                </h4>
                <div className="text-xs text-slate-300 leading-relaxed space-y-2 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Steering Technology:</span>
                    <span className="text-slate-100 font-semibold">{well.steeringSystem}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Kickoff Point (KOP):</span>
                    <span className="text-amber-300 font-semibold">{(well.kickoffPointMD * depthFactor).toFixed(0)}{depthUnit} MD</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Maximum Hole Angle:</span>
                    <span className="text-sky-300 font-semibold">{well.maxInclination}°</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Horizontal Displacement:</span>
                    <span className="text-emerald-300 font-semibold">
                      {((computedStations[computedStations.length - 1]?.closureDist || 0) * (isOilfield ? depthFactor : 1)).toFixed(1)}{depthUnit}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Grid Coordinates:</span>
                    <span className="text-slate-300 text-[11px]">{well.utmZone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Issues Banner if any */}
            {well.issues.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-red-300 uppercase tracking-wider">
                    Operational Incidents Summary ({well.issues.length} Issues · {totalNptHours} Hours NPT)
                  </div>
                  <p className="text-xs text-slate-300">
                    During the well construction phase, significant non-productive time occurred due to{' '}
                    {well.issues.map(i => i.category).join(', ')}. Click the <strong>Construction Incidents</strong> tab to review root cause analyses and remedial procedures.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HOLE SECTIONS & CASING PROGRAM */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Hole Size & Casing Engineering Schematic
                </h3>
                <p className="text-xs text-slate-400">
                  Detailed breakdown of drilled hole sections, casing strings, mud weights ({isOilfield ? 'ppg' : 'SG'}), and casing shoe integrity tests.
                </p>
              </div>
            </div>

            {/* Visual Casing Nesting Schematic */}
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
              <div className="space-y-3">
                {well.sections.map((sec, idx) => {
                  const fromDisplay = (sec.fromDepth * depthFactor).toFixed(0);
                  const toDisplay = (sec.toDepth * depthFactor).toFixed(0);
                  const lengthDisplay = ((sec.toDepth - sec.fromDepth) * depthFactor).toFixed(0);
                  const pct = Math.max(10, Math.min(100, (sec.toDepth / well.totalDepthMD) * 100));

                  return (
                    <div
                      key={idx}
                      className="bg-slate-900/80 rounded-lg p-3.5 border border-slate-800/80 hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 font-mono">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/30">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-base font-black text-white">{sec.holeSize} Hole</span>
                            <span className="text-slate-500 mx-2">→</span>
                            <span className="text-sky-300 font-bold">{sec.casingSize}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 flex items-center gap-3">
                          <span>
                            Interval: <strong className="text-emerald-300">{fromDisplay}{depthUnit} – {toDisplay}{depthUnit} MD</strong>
                          </span>
                          <span className="text-slate-600">|</span>
                          <span className="text-slate-400">({lengthDisplay}{depthUnit} drilled)</span>
                        </div>
                      </div>

                      {/* Technical specifications */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-800/60 text-xs font-mono">
                        <div className="bg-slate-950 p-2 rounded">
                          <span className="text-[10px] text-slate-500 block">Drilling Fluid (Mud)</span>
                          <span className="text-slate-200 font-medium">{sec.mudType}</span>
                          <div className="text-amber-300 font-bold mt-0.5">
                            {isOilfield ? `${(sec.mudWeight * 8.3454).toFixed(1)} ppg` : `${sec.mudWeight.toFixed(2)} SG`}
                          </div>
                        </div>

                        <div className="bg-slate-950 p-2 rounded">
                          <span className="text-[10px] text-slate-500 block">Shoe Integrity (LOT / FIT)</span>
                          <span className="text-slate-300 font-medium">
                            {sec.shoeTestLOT
                              ? isOilfield
                                ? `${(sec.shoeTestLOT * 8.3454).toFixed(1)} ppg EMW`
                                : `${sec.shoeTestLOT.toFixed(2)} SG equivalent`
                              : 'Not tested / Top hole'}
                          </span>
                        </div>

                        <div className="bg-slate-950 p-2 rounded">
                          <span className="text-[10px] text-slate-500 block">Bit & Bottom Hole Assembly</span>
                          <span className="text-slate-300 text-[11px] truncate block">
                            {sec.bitType || 'Standard Directional PDC BHA'}
                          </span>
                        </div>
                      </div>

                      {/* Depth visual bar */}
                      <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-sky-400 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Action button to open Time & Depth Logs */}
                      {onViewSectionLogs && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-slate-400">
                            Drilling telemetry logged at 0.1m / 1-sec resolution
                          </span>
                          <button
                            onClick={() => onViewSectionLogs(idx)}
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded transition-colors"
                          >
                            <Gauge className="w-3.5 h-3.5" />
                            <span>View Section Logs (Time & Depth) ›</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WELL CONSTRUCTION ISSUES & INCIDENTS */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Well Construction Operational Incidents & Non-Productive Time</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Documented drill-string sticking, pack-offs, lost circulation, gas influxes, and BHA failures.
                </p>
              </div>

              <div className="bg-slate-950 px-3 py-1 rounded border border-slate-800 text-xs font-mono text-slate-300">
                Total NPT: <strong className="text-red-400">{totalNptHours} hours</strong>
              </div>
            </div>

            {well.issues.length === 0 ? (
              <div className="bg-slate-950 rounded-lg p-6 border border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-200 font-mono">
                  Nominal Drilling Operations
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No major non-productive incidents or well control events were logged for this wellbore in the public completion report.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {well.issues.map((iss, idx) => (
                  <div
                    key={iss.id}
                    className="bg-slate-950 rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            iss.severity === 'High'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {iss.severity} Severity
                        </span>
                        <span className="text-xs font-mono font-semibold text-sky-400">
                          {iss.category}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
                        <span>Depth: <strong className="text-slate-200">{(iss.depthMD * depthFactor).toFixed(0)}{depthUnit} MD</strong></span>
                        <span className="text-slate-600">|</span>
                        <span>Section: {iss.holeSection}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-red-400 font-bold">{iss.nptHours} hrs NPT</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100">{iss.title}</h4>

                    <div className="bg-slate-900/90 rounded p-3 text-xs text-slate-300 leading-relaxed border border-slate-850">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                        Incident Observation & Root Cause:
                      </div>
                      {iss.description}
                    </div>

                    <div className="bg-emerald-950/20 rounded p-3 text-xs text-emerald-200 leading-relaxed border border-emerald-900/30">
                      <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                        Remedial Engineering Action Taken:
                      </div>
                      {iss.remedialAction}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DIRECTIONAL SURVEY TABLE */}
        {activeTab === 'surveys' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Directional Survey Stations (MCM Computed)
                </h3>
                <p className="text-xs text-slate-400">
                  Norwegian Continental Shelf survey stations calculated via Minimum Curvature Method (normalized to {isOilfield ? '100ft' : '30m'} course length).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleDownloadWitsml}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-mono bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export WITSML</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded border border-slate-800 max-h-[300px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">MD ({depthUnit})</th>
                    <th className="p-2">Inc (°)</th>
                    <th className="p-2">Azi (°)</th>
                    <th className="p-2">TVD ({depthUnit})</th>
                    <th className="p-2">North ({depthUnit})</th>
                    <th className="p-2">East ({depthUnit})</th>
                    <th className="p-2">DLS ({dlsUnit})</th>
                    <th className="p-2">Annotation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {computedStations.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="p-2 text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-100">{(s.md * (isOilfield ? depthFactor : 1)).toFixed(1)}</td>
                      <td className="p-2 text-sky-300">{s.inc.toFixed(2)}</td>
                      <td className="p-2 text-amber-300">{s.azi.toFixed(1)}</td>
                      <td className="p-2 text-emerald-300">{(s.tvd * (isOilfield ? depthFactor : 1)).toFixed(1)}</td>
                      <td className="p-2">{(s.north * (isOilfield ? depthFactor : 1)).toFixed(1)}</td>
                      <td className="p-2">{(s.east * (isOilfield ? depthFactor : 1)).toFixed(1)}</td>
                      <td className="p-2 text-slate-300">{s.dls.toFixed(2)}</td>
                      <td className="p-2 text-slate-400">{s.comment || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LWD PETROPHYSICS SUITE */}
        {activeTab === 'lwd' && (() => {
          const matchedLwd = NORWAY_LWD_CATALOG.find(
            c => c.wellName.toLowerCase().includes(well.wellName.toLowerCase()) ||
                 well.wellName.toLowerCase().includes(c.wellName.split(' ')[0].toLowerCase())
          );

          return (
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-lg p-5 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold uppercase">
                      <Activity className="w-4 h-4" />
                      <span>Downhole LWD (Logging-While-Drilling) Availability</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Well {well.wellName} · {matchedLwd ? matchedLwd.status : 'Diskos NDR Public Archive'}
                    </h3>
                  </div>

                  {onViewLWD && (
                    <button
                      onClick={() => onViewLWD(well)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm shrink-0"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Launch Multi-Track Curve Log</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-900/80 p-3.5 rounded border border-slate-800 space-y-2">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">
                      Tool Suite & Downhole Sensors:
                    </span>
                    <p className="text-slate-200">
                      {matchedLwd?.toolModels || 'Directional MWD, Propagation Resistivity & Azimuthal Gamma Ray'}
                    </p>
                    <div className="text-[11px] text-slate-400">
                      Public Repository: <strong className="text-sky-300">{matchedLwd?.publicRepo || 'Diskos National Data Repository (NDR)'}</strong>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded border border-slate-800 space-y-2">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">
                      File Formats Available:
                    </span>
                    <p className="text-slate-200">
                      {matchedLwd?.fileTypes || 'LAS 2.0 / 3.0, DLIS (binary), WITSML XML'}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      {matchedLwd?.directLink && (
                        <a
                          href={matchedLwd.directLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-amber-300 hover:text-white font-semibold"
                        >
                          <span>Open Public Download Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {matchedLwd?.availableCurves && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                      Available LWD Log Curves in Official Release:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {matchedLwd.availableCurves.map((c, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                        >
                          <div>
                            <span className="font-bold text-sky-300">{c.mnemonic}</span>
                            <span className="text-slate-400 block text-[10px]">{c.description}</span>
                          </div>
                          <span className="text-slate-500 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
                            {c.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchedLwd?.notes && (
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                    <strong className="text-slate-100 font-mono">Geological & Operational Context: </strong>
                    {matchedLwd.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
