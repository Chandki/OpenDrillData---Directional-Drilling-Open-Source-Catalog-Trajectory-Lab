import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { NorwayWellbore } from '../types/drilling';
import { MapPin, AlertTriangle, Compass, Globe, Waves, Eye } from 'lucide-react';

interface NorwayOffshoreMapProps {
  wells: NorwayWellbore[];
  selectedWell: NorwayWellbore | null;
  onSelectWell: (well: NorwayWellbore) => void;
  filterSector: string;
  setFilterSector: (sector: string) => void;
  onlyWithIssues: boolean;
  setOnlyWithIssues: (val: boolean) => void;
}

type BaseMapType = 'ocean' | 'osm' | 'satellite';

export const NorwayOffshoreMap: React.FC<NorwayOffshoreMapProps> = ({
  wells,
  selectedWell,
  onSelectWell,
  filterSector,
  setFilterSector,
  onlyWithIssues,
  setOnlyWithIssues,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap style state (default: ocean bathymetry without any watermarks/keys)
  const [baseMapType, setBaseMapType] = useState<BaseMapType>('ocean');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center over Norwegian Sea / North Sea
    const map = L.map(mapContainerRef.current, {
      center: [62.5, 4.5],
      zoom: 5,
      zoomControl: false,
      attributionControl: true,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer: ESRI World Ocean Basemap (100% Free, No API key, built for offshore bathymetry)
    const initialTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, National Geographic | NOD FactPages',
        maxZoom: 13,
        minZoom: 3,
      }
    ).addTo(map);

    tileLayerRef.current = initialTile;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when user switches basemap type
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    let url = '';
    let attribution = '';
    let maxZoom = 14;

    if (baseMapType === 'ocean') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; GEBCO, NOAA, CHS, National Geographic | NOD FactPages';
      maxZoom = 13;
    } else if (baseMapType === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | NOD FactPages';
      maxZoom = 18;
    } else if (baseMapType === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS | NOD FactPages';
      maxZoom = 17;
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      maxZoom,
      minZoom: 3,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [baseMapType]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    wells.forEach(w => {
      const isSelected = selectedWell?.id === w.id;
      const hasIssues = w.issues.length > 0;
      const hasHighIssue = w.issues.some(i => i.severity === 'High');

      // Determine accent color
      let pinColor = '#38bdf8'; // Sky blue default
      if (w.sector === 'North Sea') pinColor = '#f59e0b'; // Amber
      if (w.sector === 'Barents Sea') pinColor = '#10b981'; // Emerald
      if (hasHighIssue) pinColor = '#ef4444'; // Red if critical construction incident

      const iconHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full flex items-center justify-center transition-transform transform ${
            isSelected ? 'scale-125 ring-4 ring-amber-400 shadow-xl shadow-amber-500/50' : 'hover:scale-110 shadow-lg'
          }" style="background-color: ${isSelected ? '#f59e0b' : '#0f172a'}; border: 2.5px solid ${pinColor};">
            <span style="color: ${isSelected ? '#020617' : pinColor}; font-size: 13px; font-weight: bold; line-height: 1;">
              ${hasHighIssue ? '!' : '⚓'}
            </span>
          </div>
          ${
            hasIssues
              ? `<span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border border-slate-900 text-[8px] font-bold text-white flex items-center justify-center">
                  ${w.issues.length}
                </span>`
              : ''
          }
          <div class="absolute left-1/2 -translate-x-1/2 top-9 whitespace-nowrap px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] font-mono font-semibold text-slate-100 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg">
            ${w.wellName} (${w.field})
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-offshore-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([w.lat, w.lng], { icon: customIcon }).addTo(map);

      // Popup with explicit dark background container and high-contrast typography
      const popupHtml = `
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background-color: #0f172a; color: #f1f5f9; padding: 10px 12px; border-radius: 8px; min-width: 210px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);">
          <div style="font-size: 14px; font-weight: 800; color: #f59e0b; margin-bottom: 2px;">
            Well ${w.wellName}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 4px;">
            ${w.field} Field · Block ${w.block} (${w.sector})
          </div>
          <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 3px;">
            Operator: <strong style="color: #ffffff;">${w.operator}</strong>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 3px;">
            Rig: <strong style="color: #38bdf8;">${w.drillingFacility}</strong> (${w.facilityType})
          </div>
          <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px;">
            Total Depth: <strong style="color: #10b981;">${w.totalDepthMD}m MD</strong> (Inc: ${w.maxInclination}°)
          </div>
          ${
            w.issues.length > 0
              ? `<div style="font-size: 10px; font-weight: 600; color: #fca5a5; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); padding: 4px 8px; border-radius: 4px; margin-bottom: 8px;">
                  ⚠️ ${w.issues.length} construction incident(s) reported
                </div>`
              : `<div style="font-size: 10px; color: #34d399; margin-bottom: 6px;">
                  ✓ Nominal drilling operations
                </div>`
          }
          <div style="font-size: 10px; font-weight: bold; color: #fbbf24; text-decoration: underline; cursor: pointer;">
            Click pin to view full operational details ›
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'dark-offshore-popup',
        closeButton: true,
      });

      marker.on('click', () => {
        onSelectWell(w);
      });

      markersRef.current[w.id] = marker;
    });
  }, [wells, selectedWell, onSelectWell]);

  // Center on selected well when it changes
  useEffect(() => {
    if (!selectedWell || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedWell.lat, selectedWell.lng], 8, {
      duration: 1.2,
    });
    // Open marker popup
    const marker = markersRef.current[selectedWell.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedWell]);

  // View preset navigations
  const flyToRegion = (region: 'all' | 'north-sea' | 'norwegian-sea' | 'barents') => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (region === 'all') {
      map.flyTo([63.5, 7.5], 5, { duration: 1 });
    } else if (region === 'north-sea') {
      map.flyTo([59.2, 2.4], 7, { duration: 1 });
    } else if (region === 'norwegian-sea') {
      map.flyTo([65.2, 6.8], 7, { duration: 1 });
    } else if (region === 'barents') {
      map.flyTo([71.8, 21.2], 6.5, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col shadow-2xl">
      {/* Map Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-14 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        {/* Sector Quick Jump */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-xl">
          <div className="flex items-center gap-1 px-2 text-xs font-mono text-amber-400 font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Offshore Sectors:</span>
          </div>

          <button
            onClick={() => {
              setFilterSector('all');
              flyToRegion('all');
            }}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filterSector === 'all'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Shelf (NCS)
          </button>

          <button
            onClick={() => {
              setFilterSector('North Sea');
              flyToRegion('north-sea');
            }}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filterSector === 'North Sea'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            North Sea (Volve/Troll)
          </button>

          <button
            onClick={() => {
              setFilterSector('Norwegian Sea');
              flyToRegion('norwegian-sea');
            }}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filterSector === 'Norwegian Sea'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Norwegian Sea (Kristin)
          </button>

          <button
            onClick={() => {
              setFilterSector('Barents Sea');
              flyToRegion('barents');
            }}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filterSector === 'Barents Sea'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Barents Sea (Castberg)
          </button>
        </div>

        {/* Right Controls: Basemap Style & Incident Filter */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Basemap Style Switcher (Keyless & Clean) */}
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-xl flex items-center gap-1 text-xs font-mono">
            <span className="text-[10px] text-slate-400 px-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-sky-400" />
              <span>Map:</span>
            </span>
            <button
              onClick={() => setBaseMapType('ocean')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                baseMapType === 'ocean'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ESRI Ocean Bathymetry & Marine Contours"
            >
              Ocean
            </button>
            <button
              onClick={() => setBaseMapType('osm')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                baseMapType === 'osm'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="OpenStreetMap Standard Navigation"
            >
              OSM
            </button>
            <button
              onClick={() => setBaseMapType('satellite')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                baseMapType === 'satellite'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ESRI Satellite Imagery"
            >
              Satellite
            </button>
          </div>

          {/* Issues Filter Toggle */}
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
              <input
                type="checkbox"
                checked={onlyWithIssues}
                onChange={e => setOnlyWithIssues(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Only Incidents</span>
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-3 text-xs font-mono text-slate-300 shadow-xl">
          <span className="text-slate-400 font-semibold">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span>North Sea</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
            <span>Norwegian Sea</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>Barents Sea</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse"></span>
            <span>Critical Construction Issue</span>
          </div>
        </div>

        {selectedWell && (
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-amber-500/50 px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-200 flex items-center gap-2 shadow-2xl">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Selected:</span>
            <strong className="text-amber-300">{selectedWell.wellName}</strong>
            <span className="text-slate-400">({selectedWell.field})</span>
            <span className="text-slate-500">
              [{selectedWell.lat.toFixed(3)}°N, {selectedWell.lng.toFixed(3)}°E]
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
