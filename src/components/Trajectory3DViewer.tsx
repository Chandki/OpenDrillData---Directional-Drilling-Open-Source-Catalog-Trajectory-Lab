import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ComputedStation } from '../types/drilling';
import { Compass, RotateCw, ZoomIn, ZoomOut, Layers, Eye } from 'lucide-react';

interface Trajectory3DViewerProps {
  stations: ComputedStation[];
  unit: 'metric' | 'oilfield';
  wellName: string;
  selectedStationIdx: number | null;
  onSelectStation: (idx: number) => void;
}

export const Trajectory3DViewer: React.FC<Trajectory3DViewerProps> = ({
  stations,
  unit,
  wellName,
  selectedStationIdx,
  onSelectStation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [colorMode, setColorMode] = useState<'dls' | 'inc' | 'depth'>('dls');
  const [verticalExagg, setVerticalExagg] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [hoveredStation, setHoveredStation] = useState<ComputedStation | null>(null);

  // References to keep scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const trajectoryGroupRef = useRef<THREE.Group | null>(null);

  // Orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 3500, theta: Math.PI / 4, phi: Math.PI / 3 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, -1500, 0));

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Slate-950
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 50000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Clear previous canvases
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2000, 3000, 2000);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4);
    dirLight2.position.set(-2000, -2000, -2000);
    scene.add(dirLight2);

    // Group for wellbore trajectory elements
    const trajGroup = new THREE.Group();
    scene.add(trajGroup);
    trajectoryGroupRef.current = trajGroup;

    // Mouse drag controls
    const dom = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      sphericalRef.current.theta -= deltaX * 0.006;
      sphericalRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, sphericalRef.current.phi - deltaY * 0.006)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      updateCamera();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(
        100,
        Math.min(30000, sphericalRef.current.radius * (1 + e.deltaY * 0.001))
      );
      updateCamera();
    };

    // Touch support for mobile/tablets
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
        sphericalRef.current.theta -= deltaX * 0.008;
        sphericalRef.current.phi = Math.max(
          0.05,
          Math.min(Math.PI - 0.05, sphericalRef.current.phi - deltaY * 0.008)
        );
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        updateCamera();
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = touchStartDist / currentDist;
        sphericalRef.current.radius = Math.max(
          100,
          Math.min(30000, sphericalRef.current.radius * (factor > 1 ? 1.05 : 0.95))
        );
        touchStartDist = currentDist;
        updateCamera();
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      touchStartDist = 0;
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart);
    dom.addEventListener('touchmove', onTouchMove);
    dom.addEventListener('touchend', onTouchEnd);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const updateCamera = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const target = targetLookAtRef.current;

    const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  };

  // Re-build wellbore geometry whenever stations, colorMode, verticalExagg, or showGrid changes
  useEffect(() => {
    if (!trajectoryGroupRef.current || !stations || stations.length === 0) return;

    const group = trajectoryGroupRef.current;
    // Clear previous children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    // Determine bounding box
    let maxTVD = 0;
    let maxDisp = 0;
    stations.forEach(s => {
      if (s.tvd > maxTVD) maxTVD = s.tvd;
      const disp = Math.hypot(s.north, s.east);
      if (disp > maxDisp) maxDisp = disp;
    });

    const scaledMaxTVD = maxTVD * verticalExagg;
    const centerTVD = scaledMaxTVD / 2;
    targetLookAtRef.current.set(0, -centerTVD, 0);

    const sceneSize = Math.max(scaledMaxTVD, maxDisp * 2, 1000);
    sphericalRef.current.radius = sceneSize * 1.5;
    updateCamera();

    // 1. Surface Plane (Ground / Seabed Level)
    if (showGrid) {
      const gridExtent = Math.max(sceneSize * 1.2, 3000);
      const gridHelper = new THREE.GridHelper(gridExtent, 24, 0x334155, 0x1e293b);
      gridHelper.position.set(0, 0, 0);
      group.add(gridHelper);

      // Compass arrows at surface (North +Z, East +X)
      const northArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 5, 0),
        gridExtent * 0.25,
        0x38bdf8,
        gridExtent * 0.05,
        gridExtent * 0.03
      );
      group.add(northArrow);

      const eastArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 5, 0),
        gridExtent * 0.25,
        0xf59e0b,
        gridExtent * 0.05,
        gridExtent * 0.03
      );
      group.add(eastArrow);

      // Depth Axis / Vertical guide wire
      const depthLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -scaledMaxTVD, 0),
      ]);
      const depthLineMat = new THREE.LineDashedMaterial({
        color: 0x475569,
        dashSize: 40,
        gapSize: 20,
      });
      const depthLine = new THREE.Line(depthLineGeo, depthLineMat);
      depthLine.computeLineDistances();
      group.add(depthLine);
    }

    // 2. Build 3D Trajectory Tube & Segments
    const points: THREE.Vector3[] = [];
    const colors: number[] = [];

    // Helper color mapping
    const getPointColor = (s: ComputedStation): THREE.Color => {
      if (colorMode === 'dls') {
        // DLS: 0-2 (green), 2-4 (yellow), 4-6 (orange), >6 (red)
        const d = s.dls;
        if (d < 1.5) return new THREE.Color(0x10b981); // Emerald
        if (d < 3.0) return new THREE.Color(0xfacc15); // Yellow
        if (d < 5.0) return new THREE.Color(0xf97316); // Orange
        return new THREE.Color(0xef4444); // Red (high dogleg)
      } else if (colorMode === 'inc') {
        // Inclination: 0 (blue) to 90 (crimson)
        const ratio = Math.min(1, s.inc / 90);
        return new THREE.Color().setHSL(0.6 - ratio * 0.6, 0.9, 0.55);
      } else {
        // Depth: shallow (cyan) to deep (violet)
        const ratio = Math.min(1, s.tvd / (maxTVD || 1));
        return new THREE.Color().setHSL(0.5 + ratio * 0.35, 0.85, 0.6);
      }
    };

    stations.forEach(s => {
      // Coordinate transform:
      // X = Easting
      // Y = -TVD * verticalExagg (downwards)
      // Z = Northing
      const pt = new THREE.Vector3(s.east, -s.tvd * verticalExagg, s.north);
      points.push(pt);
      const col = getPointColor(s);
      colors.push(col.r, col.g, col.b);
    });

    if (points.length >= 2) {
      // Create smooth curve through survey stations
      const curve = new THREE.CatmullRomCurve3(points);
      curve.curveType = 'chordal';
      curve.tension = 0.5;

      const tubeRadius = Math.max(sceneSize * 0.004, 6);
      const tubeGeo = new THREE.TubeGeometry(curve, points.length * 8, tubeRadius, 10, false);

      // Vertex color shader on the tube
      const count = tubeGeo.attributes.position.count;
      const vertexColors = new Float32Array(count * 3);
      const pos = tubeGeo.attributes.position;

      for (let i = 0; i < count; i++) {
        const yVal = -pos.getY(i) / (verticalExagg || 1);
        // Find closest station
        let closest = stations[0];
        let minDiff = 999999;
        for (const st of stations) {
          const diff = Math.abs(st.tvd - yVal);
          if (diff < minDiff) {
            minDiff = diff;
            closest = st;
          }
        }
        const c = getPointColor(closest);
        vertexColors[i * 3] = c.r;
        vertexColors[i * 3 + 1] = c.g;
        vertexColors[i * 3 + 2] = c.b;
      }
      tubeGeo.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));

      const tubeMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.35,
        metalness: 0.25,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tubeMesh);

      // Wellhead rig icon/marker at (0, 0, 0)
      const wellheadGeo = new THREE.CylinderGeometry(tubeRadius * 3, tubeRadius * 5, tubeRadius * 8, 8);
      const wellheadMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6 });
      const wellheadMesh = new THREE.Mesh(wellheadGeo, wellheadMat);
      wellheadMesh.position.set(0, tubeRadius * 4, 0);
      group.add(wellheadMesh);

      // Drill bit marker at TD (last point)
      const lastPt = points[points.length - 1];
      const bitGeo = new THREE.ConeGeometry(tubeRadius * 2.2, tubeRadius * 6, 8);
      const bitMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
      const bitMesh = new THREE.Mesh(bitGeo, bitMat);
      bitMesh.position.copy(lastPt);
      bitMesh.rotation.x = Math.PI; // pointing down
      group.add(bitMesh);

      // Target cylinder/ellipse at landing or TD
      const targetRadius = Math.max(sceneSize * 0.05, 50);
      const targetGeo = new THREE.CylinderGeometry(targetRadius, targetRadius, tubeRadius * 0.5, 32);
      const targetMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      });
      const targetMesh = new THREE.Mesh(targetGeo, targetMat);
      targetMesh.position.copy(lastPt);
      group.add(targetMesh);
    }

    // 3. Station sphere nodes
    if (showStations) {
      const sphereRadius = Math.max(sceneSize * 0.007, 10);
      stations.forEach((st, idx) => {
        const isSelected = selectedStationIdx === idx;
        const sphereGeo = new THREE.SphereGeometry(isSelected ? sphereRadius * 1.8 : sphereRadius, 12, 12);
        const col = isSelected ? new THREE.Color(0xffffff) : getPointColor(st);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: col,
          emissive: isSelected ? 0x38bdf8 : 0x000000,
          roughness: 0.4,
        });
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        sphereMesh.position.set(st.east, -st.tvd * verticalExagg, st.north);
        sphereMesh.userData = { stationIndex: idx, station: st };
        group.add(sphereMesh);
      });
    }
  }, [stations, colorMode, verticalExagg, showGrid, showStations, selectedStationIdx]);

  // Set camera view angles
  const setPresetView = (type: 'isometric' | 'plan' | 'section') => {
    if (type === 'isometric') {
      sphericalRef.current.theta = Math.PI / 4;
      sphericalRef.current.phi = Math.PI / 3;
    } else if (type === 'plan') {
      // Looking directly down from surface
      sphericalRef.current.theta = 0;
      sphericalRef.current.phi = 0.01;
    } else if (type === 'section') {
      // Looking horizontally from the side
      sphericalRef.current.theta = Math.PI / 2;
      sphericalRef.current.phi = Math.PI / 2;
    }
    updateCamera();
  };

  const handleZoom = (factor: number) => {
    sphericalRef.current.radius = Math.max(100, sphericalRef.current.radius * factor);
    updateCamera();
  };

  const activeStation = selectedStationIdx !== null ? stations[selectedStationIdx] : hoveredStation;

  return (
    <div className="relative w-full h-[520px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none flex flex-col">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing relative"
      />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Well info badge */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold font-mono">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>3D SPATIAL TRAJECTORY</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-200 font-medium truncate max-w-[220px]">
            {wellName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {stations.length} stations
          </span>
        </div>

        {/* View Angle Presets & Exaggeration */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-lg">
          <button
            onClick={() => setPresetView('isometric')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Isometric 3D Perspective"
          >
            3D Iso
          </button>
          <button
            onClick={() => setPresetView('plan')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Top-down Plan View (North vs East)"
          >
            Plan (Top)
          </button>
          <button
            onClick={() => setPresetView('section')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Side Section View (TVD Profile)"
          >
            Section (Side)
          </button>

          <span className="text-slate-700 mx-0.5">|</span>

          {/* Vertical Exaggeration */}
          <div className="flex items-center gap-1 px-1">
            <span className="text-[11px] text-slate-400">VE:</span>
            {[1, 2, 5].map(ve => (
              <button
                key={ve}
                onClick={() => setVerticalExagg(ve)}
                className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  verticalExagg === ve
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ve}x
              </button>
            ))}
          </div>

          <span className="text-slate-700 mx-0.5">|</span>

          {/* Zoom Buttons */}
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.25)}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Bar: Color Mode & Active Station Readout */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Color Coding Mode */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Color:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setColorMode('dls')}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                colorMode === 'dls'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dogleg Severity (DLS)
            </button>
            <button
              onClick={() => setColorMode('inc')}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                colorMode === 'inc'
                  ? 'bg-sky-500/20 text-sky-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inclination (Inc)
            </button>
            <button
              onClick={() => setColorMode('depth')}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                colorMode === 'depth'
                  ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Depth (TVD)
            </button>
          </div>
        </div>

        {/* Legend / DLS Color Bar */}
        {colorMode === 'dls' && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-mono text-slate-300 shadow-lg">
            <span className="text-slate-400">DLS:</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>&lt;1.5°</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            <span>1.5-3°</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>3-5°</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>&gt;5° (High)</span>
          </div>
        )}

        {/* Active Station Readout */}
        {activeStation && (
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-amber-500/40 px-3.5 py-1.5 rounded-lg flex items-center gap-3 text-xs font-mono shadow-xl">
            <span className="text-amber-400 font-bold">
              {activeStation.comment || `Station @ ${activeStation.md}${unit === 'metric' ? 'm' : 'ft'}`}
            </span>
            <span className="text-slate-400">
              Inc: <strong className="text-slate-100">{activeStation.inc.toFixed(1)}°</strong>
            </span>
            <span className="text-slate-400">
              Azi: <strong className="text-slate-100">{activeStation.azi.toFixed(1)}°</strong>
            </span>
            <span className="text-slate-400">
              TVD: <strong className="text-slate-100">{activeStation.tvd.toFixed(1)}{unit === 'metric' ? 'm' : 'ft'}</strong>
            </span>
            <span className="text-slate-400">
              DLS: <strong className="text-amber-300">{activeStation.dls.toFixed(2)}°/{unit === 'metric' ? '30m' : '100ft'}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
