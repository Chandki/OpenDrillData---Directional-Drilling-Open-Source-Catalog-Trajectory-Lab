import React, { useState, useMemo } from 'react';
import { Navbar, ActiveNavTab } from './components/Navbar';
import { NorwayOffshoreMap } from './components/NorwayOffshoreMap';
import { NorwayWellDetails } from './components/NorwayWellDetails';
import { SectionLogViewer } from './components/SectionLogViewer';
import { LWDViewer } from './components/LWDViewer';
import { Trajectory3DViewer } from './components/Trajectory3DViewer';
import { Trajectory2DViews } from './components/Trajectory2DViews';
import { SurveyTable } from './components/SurveyTable';
import { DatasetDirectory } from './components/DatasetDirectory';
import { MathFormulaExplainer } from './components/MathFormulaExplainer';
import { TelemetryViewer } from './components/TelemetryViewer';
import { NORWAY_WELLBORES } from './data/norwayWells';
import { NorwayWellbore, SurveyStation } from './types/drilling';
import { calculateMinimumCurvature } from './utils/minimumCurvature';
import {
  Compass,
  MapPin,
  AlertTriangle,
  Layers,
  Box,
  Calendar,
  Anchor,
  Database,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('map');
  const [selectedWell, setSelectedWell] = useState<NorwayWellbore>(NORWAY_WELLBORES[0]);
  const [unit, setUnit] = useState<'metric' | 'oilfield'>('metric');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [onlyWithIssues, setOnlyWithIssues] = useState<boolean>(false);
  const [selectedStationIdx, setSelectedStationIdx] = useState<number | null>(null);

  // Active survey stations for selected well (allows live editing/insertion)
  const [activeStations, setActiveStations] = useState<SurveyStation[]>(selectedWell.surveyStations);

  // Filter wells
  const filteredWells = useMemo(() => {
    return NORWAY_WELLBORES.filter(w => {
      const matchSector = filterSector === 'all' || w.sector === filterSector;
      const matchIssues = !onlyWithIssues || w.issues.length > 0;
      return matchSector && matchIssues;
    });
  }, [filterSector, onlyWithIssues]);

  // Handle well selection
  const handleSelectWell = (well: NorwayWellbore) => {
    setSelectedWell(well);
    setActiveStations(well.surveyStations);
    setSelectedStationIdx(null);
  };

  const handleToggleUnit = () => {
    setUnit(prev => (prev === 'metric' ? 'oilfield' : 'metric'));
  };

  // Trajectory calculations via Minimum Curvature Method
  const computedStations = useMemo(() => {
    const courseNorm = unit === 'metric' ? 30 : 100;
    return calculateMinimumCurvature(activeStations, 0, courseNorm);
  }, [activeStations, unit]);

  // Station mutation handlers
  const handleAddStation = (station: SurveyStation) => {
    setActiveStations(prev => [...prev, station]);
  };

  const handleDeleteStation = (idx: number) => {
    if (activeStations.length <= 2) return;
    setActiveStations(prev => prev.filter((_, i) => i !== idx));
    if (selectedStationIdx === idx) setSelectedStationIdx(null);
  };

  const handleImportStations = (stations: SurveyStation[]) => {
    setActiveStations(stations);
    setSelectedStationIdx(null);
  };

  // Navigate to 3D trajectory view from details card
  const handleViewIn3D = (well: NorwayWellbore) => {
    handleSelectWell(well);
    setActiveTab('trajectory');
  };

  const handleViewSectionLogs = (_sectionIdx: number) => {
    setActiveTab('sections');
  };

  const handleViewLWD = (well?: NorwayWellbore) => {
    if (well) handleSelectWell(well);
    setActiveTab('lwd');
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wells={NORWAY_WELLBORES}
        selectedWell={selectedWell}
        onSelectWell={handleSelectWell}
        unit={unit}
        onToggleUnit={handleToggleUnit}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Context Banner */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold tracking-wider uppercase">
                <Compass className="w-4 h-4" />
                <span>Norwegian Continental Shelf (NCS) · Open Directional Drilling Repository</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Norway Public Directional Wellbores & Operational Incident Tracker
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click any offshore well on the map to inspect its <strong>drilling history</strong>, <strong>hole sizes & casing program</strong> (from 36&quot; conductor to 8-1/2&quot; lateral), and documented <strong>well construction issues</strong> (stuck pipe, lost circulation, pack-offs, gas kicks, and tool failures) sourced from the <em>Norwegian Offshore Directorate (NOD)</em> and <em>Volve / Diskos</em> public releases.
              </p>
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-lg text-center min-w-[90px]">
                <div className="text-lg font-bold font-mono text-amber-400">
                  {NORWAY_WELLBORES.length}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Mapped Wells</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-lg text-center min-w-[90px]">
                <div className="text-lg font-bold font-mono text-sky-400">
                  {NORWAY_WELLBORES.reduce((s, w) => s + w.sections.length, 0)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Hole Sections</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-lg text-center min-w-[90px]">
                <div className="text-lg font-bold font-mono text-red-400">
                  {NORWAY_WELLBORES.reduce((s, w) => s + w.issues.length, 0)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Documented Issues</div>
              </div>
            </div>
          </div>
        </section>

        {/* TAB 1: INTERACTIVE MAP & WELL OPERATION SUMMARY */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Offshore Leaflet Map */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-100">
                    Norwegian Continental Shelf Map
                  </span>
                  <span className="text-slate-500">
                    (Click any pin to inspect drilling operations)
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Showing {filteredWells.length} wells
                </span>
              </div>

              <NorwayOffshoreMap
                wells={filteredWells}
                selectedWell={selectedWell}
                onSelectWell={handleSelectWell}
                filterSector={filterSector}
                setFilterSector={setFilterSector}
                onlyWithIssues={onlyWithIssues}
                setOnlyWithIssues={setOnlyWithIssues}
              />
            </div>

            {/* Horizontal Well Selector Quick-Pill Carousel */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3">
              <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span className="font-semibold uppercase text-slate-300">
                  Browse Public Wellbores:
                </span>
                <span className="text-slate-500">Click to focus on map</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {NORWAY_WELLBORES.map(w => {
                  const isSelected = selectedWell.id === w.id;
                  const hasIssues = w.issues.length > 0;
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleSelectWell(w)}
                      className={`px-3 py-2 rounded-lg text-left transition-all shrink-0 border font-mono ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-md'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{w.wellName}</span>
                        {hasIssues && (
                          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {w.field} · {w.sector}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Operational Summary & Construction Issues Panel for Selected Well */}
            <div className="pt-2">
              <NorwayWellDetails
                well={selectedWell}
                unit={unit}
                onToggleUnit={handleToggleUnit}
                onViewIn3D={handleViewIn3D}
                onViewSectionLogs={handleViewSectionLogs}
                onViewLWD={handleViewLWD}
              />
            </div>
          </div>
        )}

        {/* TAB 2: DEDICATED WELL OPERATIONS & ISSUES VIEW */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <NorwayWellDetails
              well={selectedWell}
              unit={unit}
              onToggleUnit={handleToggleUnit}
              onViewIn3D={handleViewIn3D}
              onViewSectionLogs={handleViewSectionLogs}
              onViewLWD={handleViewLWD}
            />
          </div>
        )}

        {/* TAB: SECTION DRILLING PARAMETER LOGS (TIME & DEPTH BASED) */}
        {activeTab === 'sections' && (
          <SectionLogViewer
            well={selectedWell}
            unit={unit}
            onToggleUnit={handleToggleUnit}
          />
        )}

        {/* TAB: LWD PETROPHYSICAL CURVE LOGS & REPOSITORIES */}
        {activeTab === 'lwd' && (
          <LWDViewer
            initialWellName={selectedWell.wellName}
            unit={unit}
            onToggleUnit={handleToggleUnit}
            onNavigateToWell={(wellName) => {
              const matched = NORWAY_WELLBORES.find(
                w => w.wellName.toLowerCase().includes(wellName.toLowerCase()) ||
                     wellName.toLowerCase().includes(w.wellName.toLowerCase())
              );
              if (matched) handleSelectWell(matched);
            }}
          />
        )}

        {/* TAB 3: 3D TRAJECTORY LAB */}
        {activeTab === 'trajectory' && (
          <div className="space-y-6">
            {/* Well Meta Header */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold mb-1">
                  <span>3D TRAJECTORY INSPECTOR:</span>
                  <span className="text-slate-300">{selectedWell.wellType}</span>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Well {selectedWell.wellName}</span>
                  <span className="text-xs font-mono text-slate-400 font-normal">
                    ({selectedWell.field} Field · {selectedWell.sector})
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl font-mono">
                  KOP: <strong>{selectedWell.kickoffPointMD}m MD</strong> · Max Inclination:{' '}
                  <strong>{selectedWell.maxInclination}°</strong> · Total Depth:{' '}
                  <strong>{selectedWell.totalDepthMD}m MD ({selectedWell.totalDepthTVD}m TVD)</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('summary')}
                  className="px-3 py-1.5 text-xs font-mono text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>View Well Construction Issues</span>
                </button>
              </div>
            </div>

            {/* 3D WebGL Three.js Canvas */}
            <Trajectory3DViewer
              stations={computedStations}
              unit={unit}
              wellName={selectedWell.wellName}
              selectedStationIdx={selectedStationIdx}
              onSelectStation={idx => setSelectedStationIdx(idx)}
            />

            {/* 2D Plan & Section Projections */}
            <Trajectory2DViews
              stations={computedStations}
              unit={unit}
              proposalAzi={computedStations[computedStations.length - 1]?.closureAzi || 0}
              selectedStationIdx={selectedStationIdx}
              onSelectStation={idx => setSelectedStationIdx(idx)}
            />

            {/* Editable Survey Stations Table */}
            <SurveyTable
              wellName={selectedWell.wellName}
              stations={computedStations}
              unit={unit}
              selectedStationIdx={selectedStationIdx}
              onSelectStation={idx => setSelectedStationIdx(idx)}
              onAddStation={handleAddStation}
              onDeleteStation={handleDeleteStation}
              onImportStations={handleImportStations}
            />
          </div>
        )}

        {/* TAB 4: OPEN DATA DIRECTORY */}
        {activeTab === 'directory' && (
          <DatasetDirectory
            onLoadWellPreset={wellId => {
              const matched = NORWAY_WELLBORES.find(w => w.id === wellId);
              if (matched) handleSelectWell(matched);
              setActiveTab('map');
            }}
          />
        )}

        {/* TAB 5: TELEMETRY & MECHANICS */}
        {activeTab === 'telemetry' && (
          <TelemetryViewer unit={unit} onToggleUnit={handleToggleUnit} />
        )}

        {/* TAB 6: MCM FORMULAS */}
        {activeTab === 'math' && <MathFormulaExplainer />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>NCS DrillTracker · Norwegian Public Directional Drilling & Incident Explorer</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Norwegian Offshore Directorate (NOD)</span>
            <span>·</span>
            <span>Diskos & Equinor Volve Data</span>
            <span>·</span>
            <span>Minimum Curvature Method</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
