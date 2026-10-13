import React, { useState } from 'react';
import { DRILLING_DATASETS } from '../data/datasets';
import { DatasetItem } from '../types/drilling';
import { Search, ExternalLink, Code2, Database, Check, ShieldCheck, FileSpreadsheet } from 'lucide-react';

interface DatasetDirectoryProps {
  onLoadWellPreset?: (wellId: string) => void;
}

export const DatasetDirectory: React.FC<DatasetDirectoryProps> = ({ onLoadWellPreset }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [expandedSnippetId, setExpandedSnippetId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Open Sources' },
    { id: 'field-telemetry', label: 'Field Telemetry & MWD' },
    { id: 'regulatory-portal', label: 'National Wellbore APIs' },
    { id: 'geothermal', label: 'Geothermal Directional' },
    { id: 'benchmark-standard', label: 'ISCWSA & OSDU Standards' },
    { id: 'python-tools', label: 'Python Toolkits & Parsers' },
  ];

  const filteredDatasets = DRILLING_DATASETS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesQuery =
      item.title.toLowerCase().includes(query) ||
      item.provider.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.fileFormats.some(f => f.toLowerCase().includes(query)) ||
      item.highlightData.some(h => h.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Header */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <span>Open Source Directional Drilling Data Directory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Curated catalog of definitive open-access wellbore trajectories, 1Hz MWD/LWD drilling telemetry, regulatory survey databases, and computing libraries.
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keyword, format, well..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-800/80 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-xs font-mono text-slate-500 ml-auto whitespace-nowrap">
            Showing {filteredDatasets.length} of {DRILLING_DATASETS.length} datasets
          </span>
        </div>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredDatasets.map(item => (
          <div
            key={item.id}
            className="bg-slate-900/80 rounded-xl border border-slate-800/90 p-5 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl group"
          >
            <div>
              {/* Card Meta Kicker */}
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2 font-mono">
                <span className="text-amber-400 font-semibold">{item.provider}</span>
                <div className="flex items-center gap-2">
                  <span>{item.accessType}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {item.license.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                {item.title}
              </h3>

              {/* Formats line */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1.5 mb-3">
                <span className="text-slate-500">Formats:</span>
                {item.fileFormats.map((fmt, i) => (
                  <span key={i} className="text-sky-300">
                    {fmt}{i < item.fileFormats.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Highlights bullets */}
              <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800/60 mb-4 space-y-1.5">
                <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  Key Directional Contents:
                </div>
                {item.highlightData.map((hl, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold leading-none mt-1">›</span>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>

              {/* Key Wells / Associated Wells */}
              {item.keyWells && item.keyWells.length > 0 && (
                <div className="text-xs text-slate-400 mb-4 font-mono flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500">Key Wells:</span>
                  {item.keyWells.map((w, idx) => (
                    <span key={idx} className="text-slate-300 bg-slate-800/50 px-1.5 py-0.5 rounded">
                      {w}
                    </span>
                  ))}
                </div>
              )}

              {/* Code Snippet Accordion */}
              {item.codeSnippet && (
                <div className="mb-4">
                  <button
                    onClick={() =>
                      setExpandedSnippetId(expandedSnippetId === item.id ? null : item.id)
                    }
                    className="flex items-center justify-between w-full text-xs font-mono text-sky-400 hover:text-sky-300 py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      {expandedSnippetId === item.id ? 'Hide Python Ingestion Script' : 'View Python Ingestion Script'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {expandedSnippetId === item.id ? '▲' : '▼'}
                    </span>
                  </button>

                  {expandedSnippetId === item.id && (
                    <div className="mt-2 relative rounded-lg bg-slate-950 border border-slate-800 p-3">
                      <button
                        onClick={() => handleCopyCode(item.id, item.codeSnippet!)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded transition-colors"
                        title="Copy script"
                      >
                        {copiedCodeId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Code2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto pr-8 leading-relaxed whitespace-pre">
                        {item.codeSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
                {item.paperReference || item.license}
              </span>

              <a
                href={item.accessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 rounded-lg transition-colors shadow-sm"
              >
                <span>Access Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
