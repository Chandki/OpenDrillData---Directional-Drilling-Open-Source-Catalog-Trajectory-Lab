import React from 'react';
import { Compass, Database, Box, Calculator, Activity, MapPin, AlertTriangle, Layers, ArrowUpDown } from 'lucide-react';
import { NorwayWellbore } from '../types/drilling';

export type ActiveNavTab = 'map' | 'summary' | 'sections' | 'lwd' | 'trajectory' | 'directory' | 'telemetry' | 'math';

interface NavbarProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  wells: NorwayWellbore[];
  selectedWell: NorwayWellbore;
  onSelectWell: (well: NorwayWellbore) => void;
  unit: 'metric' | 'oilfield';
  onToggleUnit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  wells,
  selectedWell,
  onSelectWell,
  unit,
  onToggleUnit,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('map')}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 tracking-tight text-base">
                  NCS DrillTracker
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  NORWAY OPEN DATA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block">
                Public Directional Drilling, Hole Sizes & Well Construction Incident Explorer
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Norway Map</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'summary'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Well Operations & Issues</span>
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'sections'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Section Logs (Time / Depth)</span>
            </button>

            <button
              onClick={() => setActiveTab('lwd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'lwd'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>LWD Petrophysics</span>
            </button>

            <button
              onClick={() => setActiveTab('trajectory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'trajectory'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Trajectory</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'telemetry'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>MWD Telemetry</span>
            </button>
          </nav>

          {/* Active Well Selector & Units */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick dropdown for all Norwegian wellbores */}
            <select
              value={selectedWell.id}
              onChange={e => {
                const found = wells.find(w => w.id === e.target.value);
                if (found) onSelectWell(found);
              }}
              className="bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 max-w-[130px] sm:max-w-[180px] truncate"
            >
              {wells.map(w => (
                <option key={w.id} value={w.id}>
                  {w.wellName} ({w.field})
                </option>
              ))}
            </select>

            {/* Units Toggle Button */}
            <button
              onClick={onToggleUnit}
              className={`group relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all shadow-md focus:outline-none focus:ring-2 ${
                unit === 'oilfield'
                  ? 'bg-sky-950/70 border-sky-500/60 text-sky-200 hover:border-sky-400 focus:ring-sky-500/40 shadow-sky-500/10'
                  : 'bg-amber-950/70 border-amber-500/60 text-amber-200 hover:border-amber-400 focus:ring-amber-500/40 shadow-amber-500/10'
              }`}
              title="Toggle all drilling, LWD logs, telemetry, and survey units between Metric (m, m/h, bar, SG) and Oilfield (ft, ft/h, psi, ppg)"
            >
              <ArrowUpDown className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 group-hover:rotate-180 ${
                unit === 'oilfield' ? 'text-sky-400' : 'text-amber-400'
              }`} />
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                  unit === 'metric'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}>
                  Metric (m)
                </span>
                <span className="text-slate-600 font-sans">/</span>
                <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                  unit === 'oilfield'
                    ? 'bg-sky-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}>
                  Oilfield (ft)
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
