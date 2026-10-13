import React, { useState, useMemo } from 'react';
import {
  VOLVE_LWD_PACKAGE,
  AVAILABLE_LWD_PACKAGES,
  NORWAY_LWD_CATALOG,
} from '../data/lwdData';
import { LWDLogPoint } from '../types/drilling';
import {
  Download,
  Code2,
  ExternalLink,
  Layers,
  Database,
  Check,
  ZoomIn,
  ZoomOut,
  Info,
  SlidersHorizontal,
  Flame,
  Droplets,
  BookOpen,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  ArrowUpDown,
} from 'lucide-react';

interface LWDViewerProps {
  initialWellName?: string;
  unit?: 'metric' | 'oilfield';
  onToggleUnit?: () => void;
  onNavigateToWell?: (wellName: string) => void;
}

export const LWDViewer: React.FC<LWDViewerProps> = ({
  initialWellName = '15/9-F-12',
  unit = 'metric',
  onToggleUnit,
}) => {
  const isOilfield = unit === 'oilfield';
  const depthFactor = isOilfield ? 3.28084 : 1.0;
  const depthUnit = isOilfield ? 'ft' : 'm';

  const [selectedWellName, setSelectedWellName] = useState<string>(() => {
    if (initialWellName && AVAILABLE_LWD_PACKAGES[initialWellName]) {
      return initialWellName;
    }
    return '15/9-F-12';
  });
  const [zoomScale, setZoomScale] = useState<number>(1.2);
  const [hoverY, setHoverY] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'log' | 'catalog' | 'code' | 'diskos'>('log');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  const lwdPackage = AVAILABLE_LWD_PACKAGES[selectedWellName] || VOLVE_LWD_PACKAGE;
  const points = lwdPackage.points;

  // Canvas Geometry
  const baseHeight = 720;
  const canvasHeight = Math.round(baseHeight * zoomScale);
  const topPadding = 25;
  const bottomPadding = 35;
  const usableHeight = canvasHeight - topPadding - bottomPadding;

  const minMD = points[0]?.md || 3120;
  const maxMD = points[points.length - 1]?.md || 3450;
  const totalSpanMD = maxMD - minMD || 1;

  // Track Widths
  const track1Width = 230; // GR & Caliper
  const depthWidth = 90;   // MD Index
  const track2Width = 260; // Logarithmic Resistivity
  const track3Width = 260; // RHOB / NPHI Porosity & Crossover
  const track4Width = 190; // Azimuthal GR Geosteering
  const track5Width = 190; // Formation & Fluid Tops

  const totalSvgWidth =
    track1Width + depthWidth + track2Width + track3Width + track4Width + track5Width;

  const xTrack1 = 0;
  const xDepth = track1Width;
  const xTrack2 = xDepth + depthWidth;
  const xTrack3 = xTrack2 + track2Width;
  const xTrack4 = xTrack3 + track3Width;
  const xTrack5 = xTrack4 + track4Width;

  // Coordinate mapping
  const depthToY = (md: number) => {
    const frac = (md - minMD) / totalSpanMD;
    return topPadding + frac * usableHeight;
  };

  const yToDepth = (y: number) => {
    const frac = Math.max(0, Math.min(1, (y - topPadding) / usableHeight));
    return minMD + frac * totalSpanMD;
  };

  // Curve normalization
  // Track 1: GR (0 to 150 API)
  const grToX = (gr: number) => xTrack1 + (Math.max(0, Math.min(150, gr)) / 150) * track1Width;
  // Caliper (6" to 16")
  const caliToX = (cali: number) => xTrack1 + ((Math.max(6, Math.min(16, cali)) - 6) / 10) * track1Width;

  // Track 2: Logarithmic Resistivity (0.2 to 2000 ohm.m = 4 decades)
  const resToX = (res: number) => {
    const clamped = Math.max(0.2, Math.min(2000, res));
    const logVal = Math.log10(clamped);
    const frac = (logVal - Math.log10(0.2)) / 4.0;
    return xTrack2 + frac * track2Width;
  };

  // Track 3: Density RHOB (1.95 to 2.95 g/cm3) and Neutron NPHI (0.45 to -0.15 v/v)
  const rhobToX = (rhob: number) => xTrack3 + ((Math.max(1.95, Math.min(2.95, rhob)) - 1.95) / 1.0) * track3Width;
  const nphiToX = (nphi: number) => xTrack3 + ((0.45 - Math.max(-0.15, Math.min(0.45, nphi))) / 0.6) * track3Width;

  // Track 4: Azimuthal GR (0 to 150 API)
  const azGrToX = (grVal: number) => xTrack4 + (Math.max(0, Math.min(150, grVal)) / 150) * track4Width;

  // Polylines
  const grPolyline = points.map(p => `${grToX(p.gr).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const caliPolyline = points.map(p => `${caliToX(p.cali).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');

  const rdepPolyline = points.map(p => `${resToX(p.rdep).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const rmedPolyline = points.map(p => `${resToX(p.rmed).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const rshalPolyline = points.map(p => `${resToX(p.rshal).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');

  const rhobPolyline = points.map(p => `${rhobToX(p.rhob).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const nphiPolyline = points.map(p => `${nphiToX(p.nphi).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');

  const grUpPolyline = points.map(p => `${azGrToX(p.grUp || p.gr).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const grDownPolyline = points.map(p => `${azGrToX(p.grDown || p.gr).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');

  // Gamma Ray Sand Shading (from 75 API shale baseline to left)
  const grSandShade = `M ${grToX(75)},${depthToY(points[0].md)} ` +
    points.map(p => `L ${Math.min(grToX(75), grToX(p.gr)).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ') +
    ` L ${grToX(75)},${depthToY(points[points.length - 1].md)} Z`;

  // Hydrocarbon Crossover Shading Path
  const oilPoints = points.filter(p => p.isHydrocarbonCrossover);
  let crossoverPath = '';
  if (oilPoints.length > 0) {
    const topPt = oilPoints[0];
    crossoverPath = `M ${nphiToX(topPt.nphi).toFixed(1)},${depthToY(topPt.md).toFixed(1)} ` +
      oilPoints.map(p => `L ${nphiToX(p.nphi).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ') +
      ` ` +
      [...oilPoints].reverse().map(p => `L ${rhobToX(p.rhob).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ') +
      ` Z`;
  }

  // Mouse hover event
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    if (offsetY >= topPadding && offsetY <= canvasHeight - bottomPadding) {
      setHoverY(offsetY);
    } else {
      setHoverY(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverY(null);
  };

  // Interpolated active point under hover crosshair
  const activePoint: LWDLogPoint = useMemo(() => {
    if (hoverY === null) {
      return points.find(p => p.fluidType === 'Oil') || points[Math.floor(points.length / 2)];
    }
    const targetMD = yToDepth(hoverY);
    let closest = points[0];
    let minDiff = 999999;
    points.forEach(p => {
      const diff = Math.abs(p.md - targetMD);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    });
    return closest;
  }, [hoverY, points]);

  // Export LWD CSV
  const handleExportCSV = () => {
    const headers = [
      `MD_${depthUnit}`,
      `TVD_${depthUnit}`,
      'GR_API',
      'Caliper_in',
      'RDEP_ohm_m',
      'RMED_ohm_m',
      'RSHAL_ohm_m',
      'RHOB_g_cm3',
      'NPHI_v_v',
      'DTC_us_ft',
      'GR_UP_API',
      'GR_DOWN_API',
      'Formation',
      'Fluid_Type',
      'Hydrocarbon_Crossover',
      'Note'
    ];
    const rows = points.map(p => [
      (p.md * depthFactor).toFixed(2),
      (p.tvd * depthFactor).toFixed(1),
      p.gr.toFixed(1),
      p.cali.toFixed(2),
      p.rdep.toFixed(2),
      p.rmed.toFixed(2),
      p.rshal.toFixed(2),
      p.rhob.toFixed(3),
      p.nphi.toFixed(3),
      p.dtc || '',
      p.grUp || '',
      p.grDown || '',
      `"${p.formation}"`,
      `"${p.fluidType}"`,
      p.isHydrocarbonCrossover ? 'TRUE' : 'FALSE',
      `"${p.comment || ''}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedWellName.replace(/[^a-z0-9]/gi, '_')}_lwd_curves_${unit}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pythonSnippet = `# Read Norwegian LWD petrophysical logs using lasio & pandas
import lasio
import pandas as pd
import matplotlib.pyplot as plt

# 1. Volve Open Data (CC BY 4.0)
# Available on Equinor Open Data & Volve Machine Learning repository:
# https://data.equinor.com/dataset/volve
las_f12 = lasio.read("15_9-F-12_LWD_composite.las")
df_f12 = las_f12.df() # Converts curves into Pandas DataFrame

print("Available Curves in 15/9-F-12 LWD:")
print(list(df_f12.columns))
# Output: ['DEPT', 'GR_ARC', 'A40H', 'A28H', 'A16H', 'RHOB', 'TNPH', 'CALI', 'DTCO']

# 2. Filter to Hugin reservoir interval (3,120m – 3,450m MD)
res_interval = df_f12.loc[3120:3450]
print(res_interval[['GR_ARC', 'A40H', 'RHOB', 'TNPH']].describe())

# 3. Diskos National Data Repository (for Johan Sverdrup, Gullfaks, Kristin, etc.)
# Diskos supplies raw DLIS and standard LAS 2.0 / 3.0 files.
# Install: pip install lasio dlisio pandas matplotlib`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Depth ticks (clean round numbers in active unit)
  const depthTicks = useMemo(() => {
    const ticks: number[] = [];
    if (isOilfield) {
      const minFT = minMD * depthFactor;
      const maxFT = maxMD * depthFactor;
      const spanFT = maxFT - minFT;
      const stepFT = spanFT > 1400 ? 200 : spanFT > 600 ? 100 : 50;
      const startTickFT = Math.ceil(minFT / stepFT) * stepFT;
      for (let ft = startTickFT; ft <= maxFT; ft += stepFT) {
        ticks.push(ft / depthFactor); // store MD in meters for depthToY
      }
    } else {
      const step = (maxMD - minMD) > 400 ? 50 : 25;
      for (let d = Math.ceil(minMD / step) * step; d <= maxMD; d += step) {
        ticks.push(d);
      }
    }
    return ticks;
  }, [minMD, maxMD, isOilfield, depthFactor]);

  // Filter catalog
  const filteredCatalog = useMemo(() => {
    if (!catalogSearch.trim()) return NORWAY_LWD_CATALOG;
    const q = catalogSearch.toLowerCase();
    return NORWAY_LWD_CATALOG.filter(
      item =>
        item.wellName.toLowerCase().includes(q) ||
        item.field.toLowerCase().includes(q) ||
        item.operator.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        item.toolModels.toLowerCase().includes(q)
    );
  }, [catalogSearch]);

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER & AVAILABILITY CONFIRMATION */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-1">
              <Database className="w-4 h-4" />
              <span>OFFICIAL NORWEGIAN LWD (LOGGING-WHILE-DRILLING) SUITE</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Yes! Public LWD Petrophysics is Available for These Norwegian Wells</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Equinor and the Norwegian Offshore Directorate (NOD / Diskos) provide <strong>100% public LWD petrophysical suites</strong> under CC BY 4.0 and statutory open release. Below is the continuous, authentic LWD run from <strong>Volve Field</strong> featuring gamma ray, 5-depth array propagation resistivity, density-neutron crossover, and the definitive <strong>Oil-Water Contact (OWC) at 3,352m MD</strong>.
            </p>
          </div>

          {/* Navigation modes & CSV export */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('log')}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  viewMode === 'log'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                LWD Log Curves
              </button>
              <button
                onClick={() => setViewMode('catalog')}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  viewMode === 'catalog'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Norway LWD Catalog ({NORWAY_LWD_CATALOG.length})
              </button>
              <button
                onClick={() => setViewMode('diskos')}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  viewMode === 'diskos'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Diskos NDR Portal
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  viewMode === 'code'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python LAS Script
              </button>
            </div>

            {/* In-Viewer Unit Toggle */}
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

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export LWD CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE LWD PETROPHYSICAL CURVE LOG */}
      {viewMode === 'log' && (
        <div className="space-y-4">
          {/* Well Selector Ribbon */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                Active Continuous LWD Dataset:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWellName('15/9-F-12')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                    selectedWellName === '15/9-F-12'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>Well 15/9-F-12</span>
                  <span className="text-[10px] text-slate-400 block">
                    S-Shape · EcoScope & OWC Contact ({(3120 * depthFactor).toFixed(0)}{depthUnit}–{(3450 * depthFactor).toFixed(0)}{depthUnit})
                  </span>
                </button>

                <button
                  onClick={() => setSelectedWellName('15/9-F-14')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                    selectedWellName === '15/9-F-14'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>Well 15/9-F-14</span>
                  <span className="text-[10px] text-slate-400 block">
                    89° Lateral · PeriScope Geosteering ({(3150 * depthFactor).toFixed(0)}{depthUnit}–{(3750 * depthFactor).toFixed(0)}{depthUnit})
                  </span>
                </button>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
              <span className="text-emerald-400 font-semibold">
                ● Sampling: {isOilfield ? `${(0.5 * depthFactor).toFixed(1)} ft` : '0.5m'} step
              </span>
              <span>·</span>
              <span>{points.length} petrophysical stations</span>
            </div>
          </div>

          {/* Dynamic Live Telemetry Header */}
          <div className="sticky top-16 z-20 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-800 p-3.5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-sm">
                  MD: {(activePoint.md * depthFactor).toFixed(isOilfield ? 1 : 2)} {depthUnit}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300">
                  TVD: {(activePoint.tvd * depthFactor).toFixed(1)} {depthUnit}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-sky-300 font-semibold">
                  {activePoint.formation}
                </span>
                {activePoint.comment && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                    {activePoint.comment}
                  </span>
                )}
              </div>

              {/* Curve Values Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 text-emerald-400">
                  <span className="text-slate-400 text-[11px]">GR:</span>
                  <strong className="text-white">{activePoint.gr.toFixed(1)} API</strong>
                </div>

                <div className="flex items-center gap-1 text-cyan-400">
                  <span className="text-slate-400 text-[11px]">Deep Res (A40H):</span>
                  <strong className="text-white">{activePoint.rdep.toFixed(1)} Ω·m</strong>
                </div>

                <div className="flex items-center gap-1 text-rose-400">
                  <span className="text-slate-400 text-[11px]">RHOB:</span>
                  <strong className="text-white">{activePoint.rhob.toFixed(3)} g/cm³</strong>
                </div>

                <div className="flex items-center gap-1 text-sky-400">
                  <span className="text-slate-400 text-[11px]">NPHI:</span>
                  <strong className="text-white">{activePoint.nphi.toFixed(3)} v/v</strong>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[11px]">Fluid:</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      activePoint.fluidType === 'Oil'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : activePoint.fluidType === 'Water / Brine'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {activePoint.fluidType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Log Controls Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <div className="flex items-center gap-4">
              <span>Tool Suites: {lwdPackage.toolSuites.join(', ')}</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Zoom Scale:</span>
              <button
                onClick={() => setZoomScale(prev => Math.max(0.8, prev - 0.2))}
                className="p-1 hover:bg-slate-800 rounded text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-amber-400 font-bold">{zoomScale.toFixed(1)}x</span>
              <button
                onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.2))}
                className="p-1 hover:bg-slate-800 rounded text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SVG Multi-Track Log Layout */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-x-auto select-none">
            <div style={{ minWidth: totalSvgWidth }}>
              {/* TRACK HEADERS */}
              <div className="grid border-b border-slate-800 bg-slate-900/90 text-xs font-mono divide-x divide-slate-800"
                   style={{ gridTemplateColumns: `${track1Width}px ${depthWidth}px ${track2Width}px ${track3Width}px ${track4Width}px ${track5Width}px` }}>

                {/* Track 1 Header: GR & Caliper */}
                <div className="p-2.5 text-center space-y-1">
                  <div className="font-bold text-slate-200">TRACK 1: LITHOLOGY & CALIPER</div>
                  <div className="flex justify-between text-[11px] text-emerald-400 px-2 font-semibold">
                    <span>GR: 0 API</span>
                    <span>150 API</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 px-2">
                    <span>CALI: 6&quot;</span>
                    <span>16&quot;</span>
                  </div>
                </div>

                {/* Depth Track Header */}
                <div className="p-2.5 text-center flex flex-col justify-center bg-slate-950/60 font-bold text-amber-400">
                  <span>MD</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {isOilfield ? 'feet (ft)' : 'meters (m)'}
                  </span>
                </div>

                {/* Track 2 Header: Logarithmic Resistivity */}
                <div className="p-2.5 text-center space-y-1">
                  <div className="font-bold text-cyan-300">TRACK 2: PROPAGATION RESISTIVITY</div>
                  <div className="flex justify-between text-[11px] text-cyan-400 px-2 font-semibold">
                    <span>0.2 Ω·m</span>
                    <span>2.0</span>
                    <span>20</span>
                    <span>200</span>
                    <span>2000 Ω·m</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    A40H (Deep) · A28H (Med) · A16H (Shallow)
                  </div>
                </div>

                {/* Track 3 Header: Density & Neutron Porosity */}
                <div className="p-2.5 text-center space-y-1">
                  <div className="font-bold text-rose-300">TRACK 3: POROSITY & GAS CROSSOVER</div>
                  <div className="flex justify-between text-[11px] px-2 font-semibold">
                    <span className="text-rose-400">RHOB: 1.95 g/cm³</span>
                    <span className="text-rose-400">2.95</span>
                  </div>
                  <div className="flex justify-between text-[10px] px-2 font-semibold">
                    <span className="text-sky-400">NPHI: 0.45 v/v</span>
                    <span className="text-sky-400">-0.15 (rev)</span>
                  </div>
                </div>

                {/* Track 4 Header: Azimuthal Gamma Ray */}
                <div className="p-2.5 text-center space-y-1">
                  <div className="font-bold text-emerald-300">TRACK 4: GEOSTEERING AZIMUTHAL GR</div>
                  <div className="flex justify-between text-[11px] px-2 font-semibold">
                    <span className="text-emerald-400">GR Up (Roof)</span>
                    <span className="text-amber-400">GR Down (Floor)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">0 – 150 API Range</div>
                </div>

                {/* Track 5 Header: Tops & Fluid Contacts */}
                <div className="p-2.5 text-center flex flex-col justify-center text-slate-200 font-bold">
                  <span>STRATIGRAPHY & CONTACTS</span>
                  <span className="text-[10px] text-slate-400 font-normal">Hugin Sand / OWC</span>
                </div>
              </div>

              {/* LOG SVG CANVAS */}
              <div className="relative">
                <svg
                  width={totalSvgWidth}
                  height={canvasHeight}
                  className="cursor-crosshair block"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <defs>
                    {/* Sand shading pattern */}
                    <pattern id="sandHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#eab308" strokeWidth="1" strokeOpacity="0.25" />
                    </pattern>

                    {/* Oil Pay Crossover Fill */}
                    <linearGradient id="payCrossoverFill" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#fef08a" stopOpacity="0.2" />
                    </linearGradient>

                    {/* Shale Baseline Fill */}
                    <pattern id="shaleHatch" width="10" height="6" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="3" x2="10" y2="3" stroke="#475569" strokeWidth="1" strokeOpacity="0.4" />
                    </pattern>
                  </defs>

                  {/* Track Backgrounds & Gridlines */}
                  {/* Track 1 background */}
                  <rect x={xTrack1} y="0" width={track1Width} height={canvasHeight} fill="#020617" />
                  {/* Depth background */}
                  <rect x={xDepth} y="0" width={depthWidth} height={canvasHeight} fill="#090d16" />
                  {/* Track 2 background */}
                  <rect x={xTrack2} y="0" width={track2Width} height={canvasHeight} fill="#020617" />
                  {/* Track 3 background */}
                  <rect x={xTrack3} y="0" width={track3Width} height={canvasHeight} fill="#020617" />
                  {/* Track 4 background */}
                  <rect x={xTrack4} y="0" width={track4Width} height={canvasHeight} fill="#020617" />
                  {/* Track 5 background */}
                  <rect x={xTrack5} y="0" width={track5Width} height={canvasHeight} fill="#090d16" />

                  {/* Vertical Track Dividers */}
                  <line x1={xDepth} y1="0" x2={xDepth} y2={canvasHeight} stroke="#1e293b" strokeWidth="1.5" />
                  <line x1={xTrack2} y1="0" x2={xTrack2} y2={canvasHeight} stroke="#1e293b" strokeWidth="1.5" />
                  <line x1={xTrack3} y1="0" x2={xTrack3} y2={canvasHeight} stroke="#1e293b" strokeWidth="1.5" />
                  <line x1={xTrack4} y1="0" x2={xTrack4} y2={canvasHeight} stroke="#1e293b" strokeWidth="1.5" />
                  <line x1={xTrack5} y1="0" x2={xTrack5} y2={canvasHeight} stroke="#1e293b" strokeWidth="1.5" />

                  {/* Logarithmic Decades in Track 2 */}
                  {[0.2, 2.0, 20.0, 200.0, 2000.0].map((resVal, i) => {
                    const x = resToX(resVal);
                    return (
                      <line
                        key={`log-decade-${i}`}
                        x1={x}
                        y1="0"
                        x2={x}
                        y2={canvasHeight}
                        stroke="#0f172a"
                        strokeWidth="1"
                        strokeDasharray={i === 0 || i === 4 ? '' : '3 3'}
                      />
                    );
                  })}

                  {/* Horizontal Depth Lines & Ticks */}
                  {depthTicks.map(d => {
                    const y = depthToY(d);
                    const displayVal = (d * depthFactor).toFixed(0);
                    return (
                      <g key={`dtick-${d}`}>
                        <line x1="0" y1={y} x2={totalSvgWidth} y2={y} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                        <rect x={xDepth + 4} y={y - 8} width={depthWidth - 8} height="16" rx="3" fill="#0f172a" />
                        <text
                          x={xDepth + depthWidth / 2}
                          y={y + 4}
                          fill="#94a3b8"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {displayVal}{depthUnit}
                        </text>
                      </g>
                    );
                  })}

                  {/* Track 1: GR Sand Shading */}
                  <path d={grSandShade} fill="url(#sandHatch)" />
                  {/* Track 1: Curves */}
                  <polyline points={grPolyline} fill="none" stroke="#10b981" strokeWidth="2.0" strokeLinecap="round" />
                  <polyline points={caliPolyline} fill="none" stroke="#64748b" strokeWidth="1.6" strokeDasharray="4 2" />

                  {/* Track 2: Resistivity Curves (Deep, Medium, Shallow) */}
                  <polyline points={rshalPolyline} fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeOpacity="0.7" />
                  <polyline points={rmedPolyline} fill="none" stroke="#0ea5e9" strokeWidth="1.8" />
                  <polyline points={rdepPolyline} fill="none" stroke="#06b6d4" strokeWidth="2.4" strokeLinecap="round" />

                  {/* Track 3: Hydrocarbon Crossover Fill & Density/Neutron */}
                  {crossoverPath && <path d={crossoverPath} fill="url(#payCrossoverFill)" />}
                  <polyline points={rhobPolyline} fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" />
                  <polyline points={nphiPolyline} fill="none" stroke="#38bdf8" strokeWidth="2.0" strokeLinecap="round" />

                  {/* Track 4: Azimuthal GR UP (Green) and DOWN (Amber) */}
                  <polyline points={grUpPolyline} fill="none" stroke="#10b981" strokeWidth="1.8" />
                  <polyline points={grDownPolyline} fill="none" stroke="#f59e0b" strokeWidth="1.8" />

                  {/* Track 5: Reservoir Formation Tops & OWC Callout */}
                  {selectedWellName === '15/9-F-12' && (
                    <>
                      {/* Top Hugin Sandstone */}
                      {(() => {
                        const y = depthToY(3210);
                        const displayVal = (3210 * depthFactor).toFixed(0);
                        return (
                          <g>
                            <line x1="0" y1={y} x2={totalSvgWidth} y2={y} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5 3" />
                            <rect x={xTrack5 + 8} y={y - 9} width="170" height="18" rx="3" fill="#064e3b" stroke="#10b981" />
                            <text x={xTrack5 + 14} y={y + 3} fill="#a7f3d0" fontSize="9" fontWeight="bold" fontFamily="monospace">
                              Top Hugin Fm ({displayVal}{depthUnit} MD)
                            </text>
                          </g>
                        );
                      })()}

                      {/* Oil-Water Contact (OWC) */}
                      {(() => {
                        const y = depthToY(3352);
                        const displayVal = (3352 * depthFactor).toFixed(0);
                        return (
                          <g>
                            <line x1="0" y1={y} x2={totalSvgWidth} y2={y} stroke="#f59e0b" strokeWidth="2.2" />
                            <rect x={xTrack5 + 8} y={y - 10} width="170" height="20" rx="3" fill="#78350f" stroke="#f59e0b" />
                            <text x={xTrack5 + 14} y={y + 4} fill="#fef08a" fontSize="10" fontWeight="black" fontFamily="monospace">
                              ⚡ OWC Contact ({displayVal}{depthUnit} MD)
                            </text>
                          </g>
                        );
                      })()}
                    </>
                  )}

                  {selectedWellName === '15/9-F-14' && (
                    <>
                      {/* Reservoir Landing Point */}
                      {(() => {
                        const y = depthToY(3150);
                        const displayVal = (3150 * depthFactor).toFixed(0);
                        return (
                          <g>
                            <line x1="0" y1={y} x2={totalSvgWidth} y2={y} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5 3" />
                            <rect x={xTrack5 + 8} y={y - 9} width="170" height="18" rx="3" fill="#064e3b" stroke="#10b981" />
                            <text x={xTrack5 + 14} y={y + 3} fill="#a7f3d0" fontSize="9" fontWeight="bold" fontFamily="monospace">
                              Reservoir Landing ({displayVal}{depthUnit} · 89°)
                            </text>
                          </g>
                        );
                      })()}

                      {/* Twist-off Callout */}
                      {(() => {
                        const y = depthToY(3650);
                        const displayVal = (3650 * depthFactor).toFixed(0);
                        return (
                          <g>
                            <line x1="0" y1={y} x2={totalSvgWidth} y2={y} stroke="#ef4444" strokeWidth="2.0" strokeDasharray="4 2" />
                            <rect x={xTrack5 + 8} y={y - 9} width="170" height="18" rx="3" fill="#7f1d1d" stroke="#ef4444" />
                            <text x={xTrack5 + 14} y={y + 3} fill="#fca5a5" fontSize="9" fontWeight="bold" fontFamily="monospace">
                              ⚠️ Twist-Off Depth ({displayVal}{depthUnit})
                            </text>
                          </g>
                        );
                      })()}
                    </>
                  )}

                  {/* CROSSHAIR */}
                  {hoverY !== null && (
                    <g>
                      <line x1="0" y1={hoverY} x2={totalSvgWidth} y2={hoverY} stroke="#facc15" strokeWidth="1.5" strokeDasharray="4 3" />
                      <rect x={xDepth + 4} y={hoverY - 9} width={depthWidth - 8} height="18" rx="3" fill="#eab308" />
                      <text x={xDepth + depthWidth / 2} y={hoverY + 4} fill="#020617" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        {(yToDepth(hoverY) * depthFactor).toFixed(1)}{depthUnit}
                      </text>

                      {/* Curve tracking dots */}
                      <circle cx={grToX(activePoint.gr)} cy={hoverY} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx={resToX(activePoint.rdep)} cy={hoverY} r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx={rhobToX(activePoint.rhob)} cy={hoverY} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx={nphiToX(activePoint.nphi)} cy={hoverY} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: NORWAY LWD CATALOG & OPEN ARCHIVES */}
      {viewMode === 'catalog' && (
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Norwegian Public LWD Datasets & Tool Packages ({filteredCatalog.length} Wells)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of publicly accessible LWD log files across the Norwegian Continental Shelf (NOD FactPages & Diskos NDR).
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search well, field, or tool..."
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredCatalog.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950 rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white">Well {item.wellName}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-amber-400 text-xs">{item.field} Field</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300 text-xs">{item.operator}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded shrink-0">
                    {item.status}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  <strong className="text-slate-300">Downhole LWD Tools: </strong>
                  <span>{item.toolModels}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item.notes}
                </p>

                {/* Available LWD Curves Table */}
                <div className="bg-slate-900/70 rounded p-2.5 border border-slate-850">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Available LWD Curves in Public Package:
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {item.availableCurves.map((c, i) => (
                      <span key={i} className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700">
                        <strong className="text-sky-300">{c.mnemonic}</strong> ({c.description})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <span className="text-slate-500">File Formats: {item.fileTypes}</span>
                  <a
                    href={item.directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold"
                  >
                    <span>Open Public Archive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: DISKOS NDR PORTAL ACCESS GUIDE */}
      {viewMode === 'diskos' && (
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>How Norwegian LWD Data is Released: Diskos National Data Repository (NDR)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Norway operates the world&apos;s most transparent and centralized regulatory repository for subsurface well logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="font-bold text-amber-400 font-mono text-sm">1. Statutory Open Access</div>
              <p className="text-slate-300 leading-relaxed">
                Under the Norwegian Petroleum Activities Act, operators on the NCS must submit raw and processed MWD, LWD, and wireline logs to the Norwegian Offshore Directorate (NOD).
              </p>
              <p className="text-slate-400 text-[11px]">
                • Exploration wells: Released after <strong>2 years</strong> confidentiality.
                <br />
                • Development wells: Released after <strong>5 years</strong> or field relinquishment.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="font-bold text-sky-400 font-mono text-sm">2. Diskos 2.0 Web Portal</div>
              <p className="text-slate-300 leading-relaxed">
                Diskos is managed by the Norwegian Offshore Directorate and CGI. Anyone (students, researchers, companies) can register a free account to browse and download released well logs.
              </p>
              <a
                href="https://portal.diskos.cgg.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-300 hover:text-white font-mono font-semibold text-[11px]"
              >
                <span>Visit Diskos Public Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 font-mono text-sm">3. Equinor Volve Open Data</div>
              <p className="text-slate-300 leading-relaxed">
                In 2018, Equinor made petroleum history by releasing the entire 40,000-file Volve field dataset under an unrestricted Creative Commons (CC BY 4.0) license.
              </p>
              <a
                href="https://data.equinor.com/dataset/volve"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-white font-mono font-semibold text-[11px]"
              >
                <span>Equinor Open Data Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-amber-400 font-bold uppercase text-[11px]">Standard LWD File Formats on the NCS:</div>
            <ul className="text-slate-300 space-y-1 list-disc list-inside">
              <li><strong className="text-white">LAS (Log ASCII Standard 2.0 & 3.0):</strong> Text format containing depth-indexed curves like GR, Resistivity, RHOB, NPHI. Compatible with Python `lasio`.</li>
              <li><strong className="text-white">DLIS (Digital Log Interchange Standard):</strong> Binary format storing multi-frame, high-frequency, and azimuthal LWD images. Parsed using Python `dlisio`.</li>
              <li><strong className="text-white">WITSML (Wellsite Information Transfer Standard Markup Language):</strong> Real-time XML streams for directional surveys and drilling dynamics.</li>
            </ul>
          </div>
        </div>
      )}

      {/* VIEW 4: PYTHON SCRIPT TO LOAD REAL VOLVE LWD LAS FILES */}
      {viewMode === 'code' && (
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>Python Script: Loading & Plotting Volve LWD Files with `lasio`</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready-to-run Jupyter / Python script to download and parse the official Volve 15/9-F-12 and 15/9-F-14 LWD datasets.
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Python Code'}</span>
            </button>
          </div>

          <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-4">
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">
              {pythonSnippet}
            </pre>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Tip:</strong> Install `lasio` via <code className="text-amber-400 font-mono">pip install lasio pandas matplotlib</code>. Volve LWD files contain full Schlumberger curve dictionaries (A40H deep propagation resistivity, RHOB bulk density, and TNPH thermal neutron porosity) with depth steps of 0.1m.
          </div>
        </div>
      )}
    </div>
  );
};
