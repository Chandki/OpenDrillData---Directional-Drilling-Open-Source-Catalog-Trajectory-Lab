import React, { useState } from 'react';
import { ComputedStation, SurveyStation } from '../types/drilling';
import { exportToCSV, exportToWitsml } from '../utils/minimumCurvature';
import { Download, Plus, Trash2, FileText, Upload } from 'lucide-react';

interface SurveyTableProps {
  wellName: string;
  stations: ComputedStation[];
  unit: 'metric' | 'oilfield';
  selectedStationIdx: number | null;
  onSelectStation: (idx: number) => void;
  onAddStation: (station: SurveyStation) => void;
  onDeleteStation: (idx: number) => void;
  onImportStations: (stations: SurveyStation[]) => void;
}

export const SurveyTable: React.FC<SurveyTableProps> = ({
  wellName,
  stations,
  unit,
  selectedStationIdx,
  onSelectStation,
  onAddStation,
  onDeleteStation,
  onImportStations,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMD, setNewMD] = useState('');
  const [newInc, setNewInc] = useState('');
  const [newAzi, setNewAzi] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const md = parseFloat(newMD);
    const inc = parseFloat(newInc);
    const azi = parseFloat(newAzi);

    if (isNaN(md) || isNaN(inc) || isNaN(azi)) return;

    onAddStation({
      md,
      inc,
      azi,
      comment: newComment.trim() || undefined,
    });

    setNewMD('');
    setNewInc('');
    setNewAzi('');
    setNewComment('');
    setShowAddForm(false);
  };

  const handleDownloadCSV = () => {
    const csv = exportToCSV(stations, unit === 'metric' ? 'm' : 'ft');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${wellName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_survey.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWitsml = () => {
    const xml = exportToWitsml(wellName, stations, unit === 'metric' ? 'm' : 'ft');
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${wellName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_trajectory.witsml.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n');
    const parsed: SurveyStation[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || line.toLowerCase().startsWith('md')) continue;

      // Split by comma, tab, or space
      const parts = line.split(/[,\t\s]+/).filter(Boolean);
      if (parts.length >= 3) {
        const md = parseFloat(parts[0]);
        const inc = parseFloat(parts[1]);
        const azi = parseFloat(parts[2]);
        const comment = parts.slice(3).join(' ');

        if (!isNaN(md) && !isNaN(inc) && !isNaN(azi)) {
          parsed.push({ md, inc, azi, comment: comment || undefined });
        }
      }
    }

    if (parsed.length > 0) {
      onImportStations(parsed);
      setShowImportModal(false);
      setImportText('');
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Directional Survey Stations</span>
            <span className="text-xs font-mono text-slate-400 font-normal">
              Minimum Curvature Method (MCM) Output
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Station</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Paste / Import CSV</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadWitsml}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition-colors"
            title="Export WITSML 1.4 XML"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>WITSML XML</span>
          </button>
        </div>
      </div>

      {/* Inline Add Station Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="mb-4 p-3 bg-slate-950 rounded-lg border border-amber-500/30 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              MD ({unit === 'metric' ? 'm' : 'ft'})
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 2100"
              value={newMD}
              onChange={e => setNewMD(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex-1 min-w-[90px]">
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Inc (deg 0-90)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max="180"
              placeholder="e.g. 28.5"
              value={newInc}
              onChange={e => setNewInc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex-1 min-w-[90px]">
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Azi (deg 0-360)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max="360"
              placeholder="e.g. 312.0"
              value={newAzi}
              onChange={e => setNewAzi(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex-2 min-w-[140px]">
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Annotation / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Casing Shoe, EOB"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-end pt-2">
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded transition-colors"
            >
              Calculate & Insert
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="mb-4 p-4 bg-slate-950 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Paste Raw Directional Survey Data
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">Format: MD, Inclination, Azimuth, [Comment]</span>
          </div>
          <textarea
            rows={5}
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder={`0, 0, 0, Wellhead\n500, 0.5, 45\n1000, 1.2, 50, KOP\n1300, 15.0, 312\n1600, 28.5, 312, Tangent\n2200, 28.5, 312, 13-3/8 Casing`}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-slate-200 focus:border-sky-500 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleParseImport}
              className="px-3 py-1 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded transition-colors"
            >
              Load Survey Stations
            </button>
          </div>
        </div>
      )}

      {/* Responsive Table */}
      <div className="overflow-x-auto max-h-[380px] rounded border border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/90 text-slate-400 sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">MD ({unit === 'metric' ? 'm' : 'ft'})</th>
              <th className="py-2 px-3">Inc (°)</th>
              <th className="py-2 px-3">Azi (°)</th>
              <th className="py-2 px-3">TVD ({unit === 'metric' ? 'm' : 'ft'})</th>
              <th className="py-2 px-3">North ({unit === 'metric' ? 'm' : 'ft'})</th>
              <th className="py-2 px-3">East ({unit === 'metric' ? 'm' : 'ft'})</th>
              <th className="py-2 px-3">VS ({unit === 'metric' ? 'm' : 'ft'})</th>
              <th className="py-2 px-3">DLS (°/{unit === 'metric' ? '30m' : '100ft'})</th>
              <th className="py-2 px-3">Closure Dist</th>
              <th className="py-2 px-3">Closure Azi</th>
              <th className="py-2 px-3">Annotation</th>
              <th className="py-2 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {stations.map((s, idx) => {
              const isSelected = selectedStationIdx === idx;
              const isHighDLS = s.dls >= 4.0;
              return (
                <tr
                  key={idx}
                  onClick={() => onSelectStation(idx)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-200'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-100">{s.md.toFixed(1)}</td>
                  <td className="py-2 px-3 text-sky-300">{s.inc.toFixed(2)}</td>
                  <td className="py-2 px-3 text-amber-300">{s.azi.toFixed(1)}</td>
                  <td className="py-2 px-3 text-emerald-300">{s.tvd.toFixed(1)}</td>
                  <td className="py-2 px-3">{s.north.toFixed(1)}</td>
                  <td className="py-2 px-3">{s.east.toFixed(1)}</td>
                  <td className="py-2 px-3">{s.vs.toFixed(1)}</td>
                  <td className={`py-2 px-3 font-semibold ${isHighDLS ? 'text-red-400' : 'text-slate-300'}`}>
                    {s.dls.toFixed(2)}
                  </td>
                  <td className="py-2 px-3">{s.closureDist.toFixed(1)}</td>
                  <td className="py-2 px-3">{s.closureAzi.toFixed(1)}°</td>
                  <td className="py-2 px-3 text-slate-400 truncate max-w-[160px]">
                    {s.comment || '—'}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {stations.length > 2 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteStation(idx);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 rounded"
                        title="Delete station"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
