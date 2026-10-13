import React, { useState, useMemo, useRef } from 'react';
import { NorwayWellbore, HoleCasingSection, DepthLogPoint, TimeLogPoint } from '../types/drilling';
import { getSectionDrillingLogs, SamplingOptions } from '../data/sectionDrillingLogs';
import {
  Layers,
  Clock,
  ArrowUpDown,
  Download,
  AlertTriangle,
  Compass,
  Sliders,
  ZoomIn,
  ZoomOut,
  Activity,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SectionLogViewerProps {
  well: NorwayWellbore;
  unit?: 'metric' | 'oilfield';
  onToggleUnit?: () => void;
}

export type TimeWindowMode = '1m' | '5m' | '15m' | '1h' | '4h' | 'full';

export const SectionLogViewer: React.FC<SectionLogViewerProps> = ({
  well,
  unit = 'metric',
  onToggleUnit,
}) => {
  const isOilfield = unit === 'oilfield';

  // Unit conversion multipliers and labels
  const depthFactor = isOilfield ? 3.28084 : 1.0;
  const depthUnit = isOilfield ? 'ft' : 'm';

  const ropFactor = isOilfield ? 3.28084 : 1.0;
  const ropUnit = isOilfield ? 'ft/hr' : 'm/hr';
  const ropMaxScale = isOilfield ? 130 : 40;

  const wobFactor = isOilfield ? 2.20462 : 1.0;
  const wobUnit = isOilfield ? 'klbf' : 'tonnes';
  const wobMaxScale = isOilfield ? 66 : 30;

  const trqFactor = isOilfield ? 0.73756 : 1.0;
  const trqUnit = isOilfield ? 'kft-lbs' : 'kNm';
  const trqMaxScale = isOilfield ? 15 : 20;

  const sppFactor = isOilfield ? 14.5038 : 1.0;
  const sppUnit = isOilfield ? 'psi' : 'bar';
  const sppMaxScale = isOilfield ? 4350 : 300;

  const flowFactor = isOilfield ? 0.264172 : 1.0;
  const flowUnit = isOilfield ? 'gpm' : 'L/min';
  const flowMaxScale = isOilfield ? 1050 : 4000;

  // Selected Section index
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(() => {
    const idx = well.sections.findIndex(s => s.holeSize.includes('12'));
    return idx !== -1 ? idx : Math.min(2, well.sections.length - 1);
  });

  // Log Domain: Depth-based or Time-based
  const [logDomain, setLogDomain] = useState<'depth' | 'time'>('depth');

  // Actual Sampling Resolution State
  const [depthStepM, setDepthStepM] = useState<number>(0.5); // 0.2m, 0.5m, 1.0m
  const [timeStepSec, setTimeStepSec] = useState<number>(30); // 10s, 30s, 60s

  // Depth Window / Viewport Mode: 'full' | '150m' | '300m'
  const [windowMode, setWindowMode] = useState<'full' | '150m' | '300m'>('300m');
  const [windowOffsetMD, setWindowOffsetMD] = useState<number>(0);

  // Time Window / Viewport Mode: '1m' | '5m' | '15m' | '1h' | '4h' | 'full'
  const [timeWindowMode, setTimeWindowMode] = useState<TimeWindowMode>('1h');
  const [timeWindowOffsetSec, setTimeWindowOffsetSec] = useState<number>(0);

  // Vertical scale multiplier
  const [zoomScale, setZoomScale] = useState<number>(1.2);

  // Active mouse hover position (Y in pixels inside the SVG canvas)
  const [hoverY, setHoverY] = useState<number | null>(null);

  const selectedSection: HoleCasingSection =
    well.sections[selectedSectionIdx] || well.sections[0];

  // Windowed sub-range calculation
  const totalMeters = selectedSection.toDepth - selectedSection.fromDepth;

  // Baseline total drilling hours estimate
  const estTotalDrillingHours = useMemo(() => {
    const isBuildTangent = selectedSection.holeSize.includes('12');
    const isTopHole = selectedSection.holeSize.includes('36') || selectedSection.holeSize.includes('42');
    const isSurface = selectedSection.holeSize.includes('26') || selectedSection.holeSize.includes('24');
    const isLateral = selectedSection.holeSize.includes('8') || selectedSection.holeSize.includes('6');
    const avgRate = isTopHole ? 22 : isSurface ? 18 : isLateral ? 19 : isBuildTangent ? 16 : 14;
    return Math.max(12, Math.round(totalMeters / avgRate) + (isBuildTangent ? 16 : 6));
  }, [totalMeters, selectedSection.holeSize]);

  const totalDrillingSeconds = estTotalDrillingHours * 3600;

  const currentTimeWindowSpanSec = useMemo(() => {
    if (timeWindowMode === '1m') return 60;
    if (timeWindowMode === '5m') return 300;
    if (timeWindowMode === '15m') return 900;
    if (timeWindowMode === '1h') return 3600;
    if (timeWindowMode === '4h') return 14400;
    return totalDrillingSeconds;
  }, [timeWindowMode, totalDrillingSeconds]);

  const maxTimeOffsetSec = Math.max(0, totalDrillingSeconds - currentTimeWindowSpanSec);
  const clampedTimeOffsetSec = Math.min(maxTimeOffsetSec, Math.max(0, timeWindowOffsetSec));

  const samplingOptions: SamplingOptions = useMemo(() => ({
    depthStepM,
    timeStepSeconds: timeStepSec,
    timeWindowStartSec: logDomain === 'time' && timeWindowMode !== 'full' ? clampedTimeOffsetSec : undefined,
    timeWindowDurationSec: logDomain === 'time' && timeWindowMode !== 'full' ? currentTimeWindowSpanSec : undefined,
  }), [depthStepM, timeStepSec, logDomain, timeWindowMode, clampedTimeOffsetSec, currentTimeWindowSpanSec]);

  // Generate high-resolution continuous log data
  const rawLogData = useMemo(() => {
    return getSectionDrillingLogs(well, selectedSection, samplingOptions);
  }, [well, selectedSection, samplingOptions]);

  const currentWindowSpanM = useMemo(() => {
    if (windowMode === 'full') return totalMeters;
    if (windowMode === '150m') return Math.min(150, totalMeters);
    return Math.min(300, totalMeters);
  }, [windowMode, totalMeters]);

  // Effective visible range in MD
  const viewMinMD = selectedSection.fromDepth + windowOffsetMD;
  const viewMaxMD = Math.min(selectedSection.toDepth, viewMinMD + currentWindowSpanM);

  // Filter points within active window
  const visibleDepthPoints = useMemo(() => {
    if (windowMode === 'full') return rawLogData.depthLogs;
    return rawLogData.depthLogs.filter(p => p.md >= viewMinMD && p.md <= viewMaxMD);
  }, [rawLogData.depthLogs, windowMode, viewMinMD, viewMaxMD]);

  const visibleTimePoints = rawLogData.timeLogs;

  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Dimensions & Scales
  const baseHeight = 720;
  const canvasHeight = Math.round(baseHeight * zoomScale);
  const topPadding = 25;
  const bottomPadding = 35;
  const usableHeight = canvasHeight - topPadding - bottomPadding;

  // Track Widths (Standard Oilfield Multi-Track Geometry)
  const track1Width = 240; // ROP & Gamma
  const depthTrackWidth = 100; // Depth / Time Index Track
  const track2Width = 240; // WOB & Torque
  const track3Width = 190; // RPM & Steering Mode
  const track4Width = 240; // Hydraulics SPP & Flow
  const track5Width = 180; // Annotations / Flags

  const totalSvgWidth =
    track1Width + depthTrackWidth + track2Width + track3Width + track4Width + track5Width;

  // Track X-offsets
  const xTrack1 = 0;
  const xDepth = track1Width;
  const xTrack2 = xDepth + depthTrackWidth;
  const xTrack3 = xTrack2 + track2Width;
  const xTrack4 = xTrack3 + track3Width;
  const xTrack5 = xTrack4 + track4Width;

  // Scale mappings: Depth domain
  const effectiveMinMD = visibleDepthPoints[0]?.md || viewMinMD;
  const effectiveMaxMD = visibleDepthPoints[visibleDepthPoints.length - 1]?.md || viewMaxMD;
  const effectiveSpanMD = effectiveMaxMD - effectiveMinMD || 1;

  const depthToY = (md: number) => {
    const fraction = (md - effectiveMinMD) / effectiveSpanMD;
    return topPadding + fraction * usableHeight;
  };

  const yToDepth = (y: number) => {
    const fraction = Math.max(0, Math.min(1, (y - topPadding) / usableHeight));
    return effectiveMinMD + fraction * effectiveSpanMD;
  };

  // Scale mappings: Time domain
  const viewMinTimeSec = logDomain === 'time' && timeWindowMode !== 'full' ? clampedTimeOffsetSec : 0;
  const viewMaxTimeSec = logDomain === 'time' && timeWindowMode !== 'full' ? clampedTimeOffsetSec + currentTimeWindowSpanSec : totalDrillingSeconds;
  const viewMinTimeHours = viewMinTimeSec / 3600;
  const viewMaxTimeHours = viewMaxTimeSec / 3600;
  const viewSpanTimeHours = Math.max(0.0001, viewMaxTimeHours - viewMinTimeHours);

  const timeToY = (hours: number) => {
    const fraction = (hours - viewMinTimeHours) / viewSpanTimeHours;
    return topPadding + fraction * usableHeight;
  };

  const yToTime = (y: number) => {
    const fraction = Math.max(0, Math.min(1, (y - topPadding) / usableHeight));
    return viewMinTimeHours + fraction * viewSpanTimeHours;
  };

  // Curve normalization helpers (X within track):
  // Curve normalization helpers (X within track):
  // Track 1: ROP -> 0 to track1Width
  const ropToX = (rop: number) => {
    const val = rop * ropFactor;
    return xTrack1 + (Math.min(ropMaxScale, Math.max(0, val)) / ropMaxScale) * track1Width;
  };
  // Gamma (0-150 API) -> 0 to track1Width
  const grToX = (gr: number) => xTrack1 + (Math.min(150, Math.max(0, gr)) / 150) * track1Width;

  // Track 2: WOB -> xTrack2 to xTrack2 + track2Width
  const wobToX = (wob: number) => {
    const val = wob * wobFactor;
    return xTrack2 + (Math.min(wobMaxScale, Math.max(0, val)) / wobMaxScale) * track2Width;
  };
  // Torque -> xTrack2 to xTrack2 + track2Width
  const trqToX = (trq: number) => {
    const val = trq * trqFactor;
    return xTrack2 + (Math.min(trqMaxScale, Math.max(0, val)) / trqMaxScale) * track2Width;
  };

  // Track 3: RPM (0-180 RPM) -> xTrack3 to xTrack3 + track3Width
  const rpmToX = (rpm: number) => xTrack3 + (Math.min(180, Math.max(0, rpm)) / 180) * track3Width;

  // Track 4: SPP -> xTrack4 to xTrack4 + track4Width
  const sppToX = (spp: number) => {
    const val = spp * sppFactor;
    return xTrack4 + (Math.min(sppMaxScale, Math.max(0, val)) / sppMaxScale) * track4Width;
  };
  // Flow Rate -> xTrack4 to xTrack4 + track4Width
  const flowToX = (flow: number) => {
    const val = flow * flowFactor;
    return xTrack4 + (Math.min(flowMaxScale, Math.max(0, val)) / flowMaxScale) * track4Width;
  };

  // Continuous SVG Polylines for Depth Domain
  const ropDepthPolyline = visibleDepthPoints.map(p => `${ropToX(p.rop).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const grDepthPolyline = visibleDepthPoints.map(p => `${grToX(p.gammaRay).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const wobDepthPolyline = visibleDepthPoints.map(p => `${wobToX(p.wob).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const trqDepthPolyline = visibleDepthPoints.map(p => `${trqToX(p.torque).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const rpmDepthPolyline = visibleDepthPoints.map(p => `${rpmToX(p.rpm).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const sppDepthPolyline = visibleDepthPoints.map(p => `${sppToX(p.spp).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');
  const flowDepthPolyline = visibleDepthPoints.map(p => `${flowToX(p.flowRate).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ');

  // Shaded area for Gamma Ray curve (from 0 API on left)
  const grDepthShadePath = visibleDepthPoints.length > 0
    ? `M ${xTrack1},${depthToY(visibleDepthPoints[0].md)} ` +
      visibleDepthPoints.map(p => `L ${grToX(p.gammaRay).toFixed(1)},${depthToY(p.md).toFixed(1)}`).join(' ') +
      ` L ${xTrack1},${depthToY(visibleDepthPoints[visibleDepthPoints.length - 1].md)} Z`
    : '';

  // Continuous SVG Polylines for Time Domain
  const ropTimePolyline = visibleTimePoints.map(p => `${ropToX(p.rop).toFixed(1)},${timeToY(p.elapsedHours).toFixed(1)}`).join(' ');
  const wobTimePolyline = visibleTimePoints.map(p => `${wobToX(p.wob).toFixed(1)},${timeToY(p.elapsedHours).toFixed(1)}`).join(' ');
  const trqTimePolyline = visibleTimePoints.map(p => `${trqToX(p.torque).toFixed(1)},${timeToY(p.elapsedHours).toFixed(1)}`).join(' ');
  const rpmTimePolyline = visibleTimePoints.map(p => `${rpmToX(p.rpm).toFixed(1)},${timeToY(p.elapsedHours).toFixed(1)}`).join(' ');
  const sppTimePolyline = visibleTimePoints.map(p => `${sppToX(p.spp).toFixed(1)},${timeToY(p.elapsedHours).toFixed(1)}`).join(' ');
  const flowTimePolyline = visibleTimePoints.map(p => `${flowToX(p.flowRate).toFixed(1)},${timeToY(p.elapsedHours).toFixed(1)}`).join(' ');

  // Mouse hover tracking
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

  // Interpolated Active Readout based on hover position with actual sub-meter / exact seconds
  const activeHoverReadout = useMemo(() => {
    if (hoverY === null) {
      // Default to middle of visible range
      if (logDomain === 'depth') {
        const midPoint = visibleDepthPoints[Math.floor(visibleDepthPoints.length / 2)] || visibleDepthPoints[0];
        const mdVal = (midPoint?.md || 0) * depthFactor;
        const tvdVal = (midPoint?.tvd || 0) * depthFactor;
        return {
          rawMD: midPoint?.md || 0,
          rawTVD: midPoint?.tvd || 0,
          indexLabel: `MD: ${mdVal.toFixed(isOilfield ? 1 : 2)} ${depthUnit}`,
          tvdLabel: `TVD: ${tvdVal.toFixed(1)} ${depthUnit}`,
          stepDisplay: `Δ Depth: ${isOilfield ? (depthStepM * depthFactor).toFixed(1) + ' ft' : depthStepM + 'm'} step`,
          rop: midPoint?.rop || 0,
          gamma: midPoint?.gammaRay || 0,
          wob: midPoint?.wob || 0,
          torque: midPoint?.torque || 0,
          rpm: midPoint?.rpm || 0,
          spp: midPoint?.spp || 0,
          flow: midPoint?.flowRate || 0,
          mode: midPoint?.mode || 'Rotating',
          note: midPoint?.operationNote,
        };
      } else {
        const midPoint = visibleTimePoints[Math.floor(visibleTimePoints.length / 2)] || visibleTimePoints[0];
        const bitVal = (midPoint?.bitDepthMD || 0) * depthFactor;
        const elapsedTotalSec = Math.round((midPoint?.elapsedHours || 0) * 3600);
        const elH = Math.floor(elapsedTotalSec / 3600);
        const elM = Math.floor((elapsedTotalSec % 3600) / 60);
        const elS = elapsedTotalSec % 60;
        const elapsedFormatted = elH > 0
          ? `${elH}h ${String(elM).padStart(2, '0')}m ${String(elS).padStart(2, '0')}s`
          : `${elM}m ${String(elS).padStart(2, '0')}s`;

        return {
          rawMD: midPoint?.bitDepthMD || 0,
          rawTVD: midPoint?.holeDepthMD || 0,
          indexLabel: `Time: ${midPoint?.timeStr || '00:00:00'}`,
          tvdLabel: `Elapsed: +${elapsedFormatted}`,
          stepDisplay: `Δ Time: ${timeStepSec}s · Bit: ${bitVal.toFixed(1)}${depthUnit}`,
          rop: midPoint?.rop || 0,
          gamma: 65,
          wob: midPoint?.wob || 0,
          torque: midPoint?.torque || 0,
          rpm: midPoint?.rpm || 0,
          spp: midPoint?.spp || 0,
          flow: midPoint?.flowRate || 0,
          mode: midPoint?.mode || 'Drilling Ahead',
          note: midPoint?.statusNote,
        };
      }
    }

    if (logDomain === 'depth') {
      const targetMD = yToDepth(hoverY);
      // Binary search or closest search
      let closest = visibleDepthPoints[0];
      let minDiff = 999999;
      visibleDepthPoints.forEach(p => {
        const diff = Math.abs(p.md - targetMD);
        if (diff < minDiff) {
          minDiff = diff;
          closest = p;
        }
      });

      const mdVal = closest.md * depthFactor;
      const tvdVal = closest.tvd * depthFactor;

      return {
        rawMD: closest.md,
        rawTVD: closest.tvd,
        indexLabel: `MD: ${mdVal.toFixed(isOilfield ? 1 : 2)} ${depthUnit}`,
        tvdLabel: `TVD: ${tvdVal.toFixed(1)} ${depthUnit}`,
        stepDisplay: `Δ Depth: ${isOilfield ? (depthStepM * depthFactor).toFixed(1) + ' ft' : depthStepM + 'm'} step`,
        rop: closest.rop,
        gamma: closest.gammaRay,
        wob: closest.wob,
        torque: closest.torque,
        rpm: closest.rpm,
        spp: closest.spp,
        flow: closest.flowRate,
        mode: closest.mode,
        note: closest.operationNote,
      };
    } else {
      const targetHour = yToTime(hoverY);
      let closest = visibleTimePoints[0];
      let minDiff = 999999;
      visibleTimePoints.forEach(p => {
        const diff = Math.abs(p.elapsedHours - targetHour);
        if (diff < minDiff) {
          minDiff = diff;
          closest = p;
        }
      });

      if (!closest) {
        closest = visibleTimePoints[0] || {
          timeStr: '07:00:00',
          elapsedHours: 0,
          bitDepthMD: selectedSection.fromDepth,
          holeDepthMD: selectedSection.fromDepth,
          rop: 0,
          wob: 0,
          torque: 0,
          rpm: 0,
          flowRate: 0,
          spp: 0,
          hookload: 140,
          mode: 'Drilling Ahead'
        };
      }

      const bitVal = closest.bitDepthMD * depthFactor;
      const holeVal = closest.holeDepthMD * depthFactor;
      const elapsedTotalSec = Math.round(closest.elapsedHours * 3600);
      const elH = Math.floor(elapsedTotalSec / 3600);
      const elM = Math.floor((elapsedTotalSec % 3600) / 60);
      const elS = elapsedTotalSec % 60;
      const elapsedFormatted = elH > 0
        ? `${elH}h ${String(elM).padStart(2, '0')}m ${String(elS).padStart(2, '0')}s`
        : `${elM}m ${String(elS).padStart(2, '0')}s`;

      return {
        rawMD: closest.bitDepthMD,
        rawTVD: closest.holeDepthMD,
        indexLabel: `Time: ${closest.timeStr}`,
        tvdLabel: `Elapsed: +${elapsedFormatted}`,
        stepDisplay: `Δ Time: ${timeStepSec}s · Bit: ${bitVal.toFixed(1)}${depthUnit}`,
        rop: closest.rop,
        gamma: 60,
        wob: closest.wob,
        torque: closest.torque,
        rpm: closest.rpm,
        spp: closest.spp,
        flow: closest.flowRate,
        mode: closest.mode,
        note: closest.statusNote,
      };
    }
  }, [hoverY, logDomain, visibleDepthPoints, visibleTimePoints, depthStepM, timeStepSec, depthFactor, depthUnit, isOilfield, selectedSection.fromDepth]);

  // Depth grid tick levels in the active viewport (clean round increments in current unit)
  const depthTicks = useMemo(() => {
    const ticks: number[] = [];
    if (isOilfield) {
      const minFT = effectiveMinMD * depthFactor;
      const maxFT = effectiveMaxMD * depthFactor;
      const spanFT = maxFT - minFT;
      const stepFT = spanFT <= 500 ? 50 : spanFT <= 1200 ? 100 : 250;
      const startTickFT = Math.ceil(minFT / stepFT) * stepFT;
      for (let ft = startTickFT; ft <= maxFT; ft += stepFT) {
        ticks.push(ft / depthFactor); // store MD in meters for depthToY
      }
    } else {
      const step = effectiveSpanMD <= 150 ? 10 : effectiveSpanMD <= 350 ? 25 : 50;
      const startTick = Math.ceil(effectiveMinMD / step) * step;
      for (let d = startTick; d <= effectiveMaxMD; d += step) {
        ticks.push(d);
      }
    }
    return ticks;
  }, [effectiveMinMD, effectiveMaxMD, effectiveSpanMD, isOilfield, depthFactor]);

  // Time grid tick levels (supports detailed seconds, minutes, and hour scales)
  interface TimeTickItem {
    hours: number;
    seconds: number;
    timeStr: string;
    elapsedLabel: string;
    isMajor: boolean;
  }

  const timeTicks = useMemo<TimeTickItem[]>(() => {
    const ticks: TimeTickItem[] = [];
    const spanSec = viewMaxTimeSec - viewMinTimeSec;

    // Pick tick interval based on the current window span
    let stepSec = 3600;
    if (spanSec <= 65) {
      stepSec = 10; // 10s intervals for 1-minute window
    } else if (spanSec <= 320) {
      stepSec = 30; // 30s intervals for 5-minute window
    } else if (spanSec <= 1000) {
      stepSec = 120; // 2 min intervals for 15-minute window
    } else if (spanSec <= 4000) {
      stepSec = 600; // 10 min intervals for 1-hour window
    } else if (spanSec <= 16000) {
      stepSec = 1800; // 30 min intervals for 4-hour window
    } else {
      stepSec = spanSec > 100000 ? 14400 : 7200; // 2h or 4h for full section
    }

    const startSec = Math.ceil(viewMinTimeSec / stepSec) * stepSec;
    for (let s = startSec; s <= viewMaxTimeSec; s += stepSec) {
      const totalHoursInt = Math.floor(s / 3600);
      const minsInt = Math.floor((s % 3600) / 60);
      const secsInt = Math.floor(s % 60);
      const clockH = (7 + totalHoursInt) % 24;

      const timeStr = spanSec <= 360
        ? `${String(clockH).padStart(2, '0')}:${String(minsInt).padStart(2, '0')}:${String(secsInt).padStart(2, '0')}`
        : `${String(clockH).padStart(2, '0')}:${String(minsInt).padStart(2, '0')}`;

      let elapsedLabel = `+${(s / 3600).toFixed(1)}h`;
      if (spanSec <= 360) {
        const elM = Math.floor(s / 60);
        const elS = s % 60;
        elapsedLabel = `+${elM}m ${elS}s`;
      } else if (spanSec <= 7200) {
        const elH = Math.floor(s / 3600);
        const elM = Math.floor((s % 3600) / 60);
        elapsedLabel = elH > 0 ? `+${elH}h ${elM}m` : `+${elM}m`;
      }

      ticks.push({
        hours: s / 3600,
        seconds: s,
        timeStr,
        elapsedLabel,
        isMajor: s % (stepSec * 2) === 0,
      });
    }
    return ticks;
  }, [viewMinTimeSec, viewMaxTimeSec]);

  // Export CSV with dynamic unit column headers
  const handleExportCSV = () => {
    let csvContent = '';
    if (logDomain === 'depth') {
      const headers = [
        `MD_${depthUnit}`,
        `TVD_${depthUnit}`,
        `ROP_${ropUnit.replace('/', '_')}`,
        'GammaRay_API',
        `WOB_${wobUnit}`,
        `Torque_${trqUnit}`,
        'RPM',
        `SPP_${sppUnit}`,
        `Flow_${flowUnit.replace('/', '_')}`,
        'Mode',
        'Note'
      ];
      const rows = visibleDepthPoints.map(p => [
        (p.md * depthFactor).toFixed(2),
        (p.tvd * depthFactor).toFixed(1),
        (p.rop * ropFactor).toFixed(1),
        p.gammaRay,
        (p.wob * wobFactor).toFixed(1),
        (p.torque * trqFactor).toFixed(1),
        p.rpm,
        Math.round(p.spp * sppFactor),
        Math.round(p.flowRate * flowFactor),
        `"${p.mode}"`,
        `"${p.operationNote || ''}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      const headers = [
        'Time',
        'Elapsed_Hours',
        `Bit_Depth_${depthUnit}`,
        `Hole_Depth_${depthUnit}`,
        `ROP_${ropUnit.replace('/', '_')}`,
        `WOB_${wobUnit}`,
        `Torque_${trqUnit}`,
        'RPM',
        `SPP_${sppUnit}`,
        `Flow_${flowUnit.replace('/', '_')}`,
        'Mode',
        'Note'
      ];
      const rows = visibleTimePoints.map(p => [
        `"${p.timeStr}"`,
        p.elapsedHours.toFixed(2),
        (p.bitDepthMD * depthFactor).toFixed(2),
        (p.holeDepthMD * depthFactor).toFixed(2),
        (p.rop * ropFactor).toFixed(1),
        (p.wob * wobFactor).toFixed(1),
        (p.torque * trqFactor).toFixed(1),
        p.rpm,
        Math.round(p.spp * sppFactor),
        Math.round(p.flowRate * flowFactor),
        `"${p.mode}"`,
        `"${p.statusNote || ''}"`
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${well.wellName}_${selectedSection.holeSize}_sampling_${depthStepM}m_${unit}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* 1. SECTION SELECTOR & ACTUAL SAMPLING RESOLUTION BAR */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold mb-1">
              <Layers className="w-4 h-4" />
              <span>HIGH-FREQUENCY CONTINUOUS OILFIELD LOG CURVES</span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Section Curve Log · Well {well.wellName}</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                ({well.field} Field · Block {well.block})
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Continuous petrophysical and rig telemetry curves sampled at authentic fine intervals (<strong>0.2m / 0.5m</strong> depth resolution, <strong>10s / 30s</strong> time intervals) matching the official Equinor Volve MWD and Pason EDR datasets.
            </p>
          </div>

          {/* Controls: Domain Switcher & ACTUAL SAMPLING RATE SELECTOR */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Domain Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setLogDomain('depth')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  logDomain === 'depth'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Depth Log Curves</span>
              </button>

              <button
                onClick={() => setLogDomain('time')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  logDomain === 'time'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Time Log Curves</span>
              </button>
            </div>

            {/* ACTUAL SAMPLING RESOLUTION SELECTOR */}
            {logDomain === 'depth' ? (
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-amber-500/30 text-xs font-mono">
                <span className="text-[11px] text-amber-400 font-semibold mr-1">Δ Depth:</span>
                {[0.2, 0.5, 1.0].map(step => (
                  <button
                    key={step}
                    onClick={() => setDepthStepM(step)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      depthStepM === step
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isOilfield ? `${(step * depthFactor).toFixed(1)}ft` : `${step}m`}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-sky-500/30 text-xs font-mono">
                <span className="text-[11px] text-sky-400 font-semibold mr-1">Δ Time:</span>
                {[1, 5, 10, 30, 60].map(step => (
                  <button
                    key={step}
                    onClick={() => setTimeStepSec(step)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      timeStepSec === step
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {step}s
                  </button>
                ))}
              </div>
            )}

            {/* Scale Zoom */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-[11px] text-slate-500">Zoom:</span>
              <button
                onClick={() => setZoomScale(s => Math.max(0.8, s - 0.2))}
                className="p-1 hover:text-white rounded"
                title="Compress vertical scale"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-amber-400 font-bold px-1">{zoomScale.toFixed(1)}x</span>
              <button
                onClick={() => setZoomScale(s => Math.min(2.5, s + 0.2))}
                className="p-1 hover:text-white rounded"
                title="Stretch vertical scale"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg transition-colors"
              title="Export high-resolution sampled data to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* In-Viewer Unit Toggle */}
            {onToggleUnit && (
              <button
                onClick={onToggleUnit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-950 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-slate-200 rounded-lg transition-colors shadow-sm"
                title="Toggle between Metric and Oilfield units across logs"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400 text-[11px]">Unit:</span>
                <span className="font-bold text-amber-300">{isOilfield ? 'Oilfield (ft, psi)' : 'Metric (m, bar)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION BUTTON SELECTOR CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800">
          {well.sections.map((sec, idx) => {
            const isSelected = selectedSectionIdx === idx;
            const fromDisplay = (sec.fromDepth * depthFactor).toFixed(0);
            const toDisplay = (sec.toDepth * depthFactor).toFixed(0);
            const lengthDisplay = ((sec.toDepth - sec.fromDepth) * depthFactor).toFixed(0);
            const mudWeightDisplay = isOilfield
              ? `${(sec.mudWeight * 8.3454).toFixed(1)} ppg`
              : `${sec.mudWeight.toFixed(2)} SG`;

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSectionIdx(idx);
                  setWindowOffsetMD(0);
                }}
                className={`p-3 rounded-lg text-left transition-all border font-mono ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-lg text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                    {sec.holeSize} Section
                  </span>
                  <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                </div>
                <div className="text-[11px] text-slate-300 font-semibold truncate">
                  {sec.casingSize}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {fromDisplay}{depthUnit} – {toDisplay}{depthUnit} ({lengthDisplay}{depthUnit})
                </div>
                <div className="text-[10px] text-amber-400/90 font-medium mt-0.5">
                  {mudWeightDisplay} mud
                </div>
              </button>
            );
          })}
        </div>

        {/* 2. DEPTH WINDOW RANGE & PAN SLIDER (FOR DETAILED SUB-METER INSPECTION) */}
        {logDomain === 'depth' && totalMeters > 200 && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-semibold">Inspection Window:</span>
              {(['150m', '300m', 'full'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    setWindowMode(mode);
                    setWindowOffsetMD(0);
                  }}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    windowMode === mode
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  {mode === 'full' ? 'Full Section' : mode === '150m' ? (isOilfield ? '500ft Span' : '150m Span') : (isOilfield ? '1,000ft Span' : '300m Span')}
                </button>
              ))}
            </div>

            {windowMode !== 'full' && (
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <span className="text-slate-400 shrink-0 text-[11px]">Pan:</span>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, totalMeters - currentWindowSpanM)}
                  step="5"
                  value={windowOffsetMD}
                  onChange={e => setWindowOffsetMD(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-amber-300 font-bold shrink-0 text-[11px]">
                  {(viewMinMD * depthFactor).toFixed(0)}{depthUnit} – {(viewMaxMD * depthFactor).toFixed(0)}{depthUnit}
                </span>
              </div>
            )}
          </div>
        )}

        {/* TIME WINDOW RANGE & PAN SLIDER WITH DETAILED MIN/SEC VIEW & EVENT JUMPS */}
        {logDomain === 'time' && (
          <div className="bg-slate-950 p-3.5 rounded-lg border border-sky-500/30 space-y-3 text-xs font-mono">
            {/* Row 1: Time Window / Vertical Scale presets & Pan Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Vertical Scale Window Mode */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-slate-300 font-semibold mr-1">Time Scale / Window:</span>
                {(
                  [
                    { mode: '1m', label: '1 min (1s sampling)' },
                    { mode: '5m', label: '5 min' },
                    { mode: '15m', label: '15 min' },
                    { mode: '1h', label: '1 hour' },
                    { mode: '4h', label: '4 hours' },
                    { mode: 'full', label: 'Full Run' },
                  ] as const
                ).map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setTimeWindowMode(mode);
                    }}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      timeWindowMode === mode
                        ? 'bg-sky-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Time Navigation: Pan Buttons & Active Range */}
              {timeWindowMode !== 'full' && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 text-[11px] mr-1">Pan Controls:</span>
                  <button
                    onClick={() => setTimeWindowOffsetSec(0)}
                    disabled={clampedTimeOffsetSec <= 0}
                    className="p-1 px-2 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1 text-[11px] transition-colors"
                    title="Jump to drilling start (00:00:00)"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">Start</span>
                  </button>

                  <button
                    onClick={() => {
                      const step =
                        timeWindowMode === '1m'
                          ? 15
                          : timeWindowMode === '5m'
                          ? 60
                          : timeWindowMode === '15m'
                          ? 180
                          : timeWindowMode === '1h'
                          ? 900
                          : 3600;
                      setTimeWindowOffsetSec(prev => Math.max(0, prev - step));
                    }}
                    disabled={clampedTimeOffsetSec <= 0}
                    className="p-1 px-2 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1 text-[11px] transition-colors"
                    title="Pan Backward in Time"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-sky-400" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => {
                      const step =
                        timeWindowMode === '1m'
                          ? 15
                          : timeWindowMode === '5m'
                          ? 60
                          : timeWindowMode === '15m'
                          ? 180
                          : timeWindowMode === '1h'
                          ? 900
                          : 3600;
                      setTimeWindowOffsetSec(prev => Math.min(maxTimeOffsetSec, prev + step));
                    }}
                    disabled={clampedTimeOffsetSec >= maxTimeOffsetSec}
                    className="p-1 px-2 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1 text-[11px] transition-colors"
                    title="Pan Forward in Time"
                  >
                    <span>Forward</span>
                    <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                  </button>

                  <button
                    onClick={() => setTimeWindowOffsetSec(maxTimeOffsetSec)}
                    disabled={clampedTimeOffsetSec >= maxTimeOffsetSec}
                    className="p-1 px-2 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1 text-[11px] transition-colors"
                    title="Jump to Section TD end"
                  >
                    <span className="hidden sm:inline">End</span>
                    <ChevronsRight className="w-3.5 h-3.5 text-sky-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Row 2: Pan Scrubber Slider & Timestamp Display */}
            {timeWindowMode !== 'full' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-slate-400 shrink-0 text-[11px]">Time Scrubber:</span>
                  <input
                    type="range"
                    min="0"
                    max={maxTimeOffsetSec}
                    step={
                      timeWindowMode === '1m'
                        ? 1
                        : timeWindowMode === '5m'
                        ? 5
                        : timeWindowMode === '15m'
                        ? 15
                        : timeWindowMode === '1h'
                        ? 60
                        : 300
                    }
                    value={clampedTimeOffsetSec}
                    onChange={e => setTimeWindowOffsetSec(parseFloat(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-sky-500/40 text-[11px]">
                    <span className="text-slate-400">Clock:</span>
                    <strong className="text-sky-300 font-bold">
                      {(() => {
                        const sH = Math.floor(viewMinTimeSec / 3600);
                        const sM = Math.floor((viewMinTimeSec % 3600) / 60);
                        const sS = Math.floor(viewMinTimeSec % 60);
                        const eH = Math.floor(viewMaxTimeSec / 3600);
                        const eM = Math.floor((viewMaxTimeSec % 3600) / 60);
                        const eS = Math.floor(viewMaxTimeSec % 60);
                        return `${String((7 + sH) % 24).padStart(2, '0')}:${String(sM).padStart(2, '0')}:${String(sS).padStart(2, '0')} – ${String((7 + eH) % 24).padStart(2, '0')}:${String(eM).padStart(2, '0')}:${String(eS).padStart(2, '0')}`;
                      })()}
                    </strong>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Elapsed: <span className="text-slate-200 font-semibold">+{(viewMinTimeSec / 3600).toFixed(2)}h – +{(viewMaxTimeSec / 3600).toFixed(2)}h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Row 3: Operational Event Jump Shortcuts */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-900 text-[11px]">
              <span className="text-slate-500 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Jump to Event:</span>
              </span>
              {[
                { label: 'Stand #1 Start (00:00:00)', sec: 0 },
                { label: 'Oriented Slide (00:30:00)', sec: 1800 },
                { label: 'Connection #1 (01:12:00)', sec: 4320 },
                { label: 'Stand #2 Drilling (01:25:00)', sec: 5100 },
                { label: 'Stand #3 Drilling (02:50:00)', sec: 10200 },
                ...(selectedSection.holeSize.includes('12')
                  ? [{ label: 'LCM Pill Loss Incident (10:48:00)', sec: Math.round(totalDrillingSeconds * 0.45) }]
                  : []),
                { label: 'Section TD Finish', sec: maxTimeOffsetSec },
              ].map((ev, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (timeWindowMode === 'full') setTimeWindowMode('15m');
                    setTimeWindowOffsetSec(Math.min(maxTimeOffsetSec, Math.max(0, ev.sec)));
                  }}
                  className="px-2 py-0.5 rounded bg-slate-900/90 hover:bg-sky-950/60 hover:text-sky-300 text-slate-400 border border-slate-800 hover:border-sky-500/40 transition-colors"
                >
                  {ev.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. DYNAMIC TELEMETRY CROSSHAIR READOUT BANNER */}
      <div className="sticky top-16 z-20 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-800 p-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Index & Exact Sampling Badge */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-white text-sm">
              {activeHoverReadout.indexLabel}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-medium">
              {activeHoverReadout.tvdLabel}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
              {activeHoverReadout.stepDisplay}
            </span>
            {activeHoverReadout.note && (
              <span className="hidden lg:inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                {activeHoverReadout.note}
              </span>
            )}
          </div>

          {/* Curve Value Badges (Color-coded to match curve lines) */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* ROP */}
            <div className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-0.5 bg-cyan-400 inline-block" />
              <span className="text-slate-400 text-[11px]">ROP:</span>
              <strong className="text-slate-100">{(activeHoverReadout.rop * ropFactor).toFixed(1)} {ropUnit}</strong>
            </div>

            {/* Gamma Ray (Depth only) */}
            {logDomain === 'depth' && (
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-0.5 bg-emerald-400 inline-block" />
                <span className="text-slate-400 text-[11px]">GR:</span>
                <strong className="text-slate-100">{activeHoverReadout.gamma} API</strong>
              </div>
            )}

            {/* WOB */}
            <div className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-0.5 bg-amber-400 inline-block" />
              <span className="text-slate-400 text-[11px]">WOB:</span>
              <strong className="text-slate-100">{(activeHoverReadout.wob * wobFactor).toFixed(1)} {wobUnit}</strong>
            </div>

            {/* Torque */}
            <div className="flex items-center gap-1 text-purple-400">
              <span className="w-2 h-0.5 bg-purple-400 inline-block" />
              <span className="text-slate-400 text-[11px]">TRQ:</span>
              <strong className="text-slate-100">{(activeHoverReadout.torque * trqFactor).toFixed(1)} {trqUnit}</strong>
            </div>

            {/* RPM */}
            <div className="flex items-center gap-1 text-sky-400">
              <span className="w-2 h-0.5 bg-sky-400 inline-block" />
              <span className="text-slate-400 text-[11px]">RPM:</span>
              <strong className="text-slate-100">{activeHoverReadout.rpm}</strong>
            </div>

            {/* SPP */}
            <div className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-0.5 bg-rose-400 inline-block" />
              <span className="text-slate-400 text-[11px]">SPP:</span>
              <strong className="text-slate-100">{Math.round(activeHoverReadout.spp * sppFactor)} {sppUnit}</strong>
            </div>

            {/* Flow */}
            <div className="flex items-center gap-1 text-orange-400">
              <span className="w-2 h-0.5 bg-orange-400 inline-block" />
              <span className="text-slate-400 text-[11px]">Flow:</span>
              <strong className="text-slate-100">{Math.round(activeHoverReadout.flow * flowFactor)} {flowUnit}</strong>
            </div>

            {/* Mode */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">Mode:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  activeHoverReadout.mode.includes('Sliding')
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : activeHoverReadout.mode.includes('Connection')
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {activeHoverReadout.mode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTINUOUS MULTI-TRACK WELL LOG CURVE CANVAS */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto shadow-2xl">
        <div className="min-w-[1190px] p-4">
          {/* TRACK SCALE HEADERS */}
          <div className="grid grid-cols-[240px_100px_240px_190px_240px_180px] gap-0 text-[10px] font-mono border-b border-slate-800 pb-2 mb-1 bg-slate-900/60 rounded-t-lg p-2 text-slate-300">
            {/* Track 1 Scale Header: ROP & Gamma */}
            <div className="border-r border-slate-800 pr-3">
              <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                <span>TRACK 1: ROP & LITHOLOGY</span>
                <span className="text-[9px] text-cyan-400">
                  {logDomain === 'depth'
                    ? `Δ ${isOilfield ? (depthStepM * depthFactor).toFixed(1) + 'ft' : depthStepM + 'm'} step`
                    : `Δ ${timeStepSec}s sampling`}
                </span>
              </div>
              <div className="flex items-center justify-between text-cyan-400 font-semibold mb-0.5">
                <span>0</span>
                <span className="truncate mx-1">ROP ({ropUnit})</span>
                <span>{ropMaxScale}</span>
              </div>
              {logDomain === 'depth' ? (
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>0</span>
                  <span className="truncate mx-1">Gamma Ray (API)</span>
                  <span>150</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Time Domain Run</span>
                  <span className="text-sky-400 text-[9px] font-semibold">{timeWindowMode === 'full' ? 'Full Run' : timeWindowMode.toUpperCase() + ' Window'}</span>
                </div>
              )}
            </div>

            {/* Index Track Header */}
            <div className="border-r border-slate-800 px-2 text-center flex flex-col justify-center">
              <span className="font-bold text-amber-400 block">
                {logDomain === 'depth' ? `DEPTH (${depthUnit.toUpperCase()})` : 'TIME (HH:MM:SS)'}
              </span>
              <span className="text-slate-500 text-[9px]">
                {logDomain === 'depth'
                  ? `±${isOilfield ? (depthStepM * depthFactor).toFixed(1) + 'ft' : depthStepM + 'm'}`
                  : `±${timeStepSec}s · ${timeWindowMode === 'full' ? 'Full Run' : timeWindowMode.toUpperCase()}`}
              </span>
            </div>

            {/* Track 2 Scale Header: WOB & Torque */}
            <div className="border-r border-slate-800 px-3">
              <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                <span>TRACK 2: DRILLING MECHANICS</span>
              </div>
              <div className="flex items-center justify-between text-amber-400 font-semibold mb-0.5">
                <span>0</span>
                <span className="truncate mx-1">WOB ({wobUnit})</span>
                <span>{wobMaxScale}</span>
              </div>
              <div className="flex items-center justify-between text-purple-400 font-semibold">
                <span>0</span>
                <span className="truncate mx-1">Torque ({trqUnit})</span>
                <span>{trqMaxScale}</span>
              </div>
            </div>

            {/* Track 3 Scale Header: Rotary RPM & Steering */}
            <div className="border-r border-slate-800 px-3">
              <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                <span>TRACK 3: ROTARY & STEERING</span>
              </div>
              <div className="flex items-center justify-between text-sky-400 font-semibold mb-0.5">
                <span>0</span>
                <span className="truncate mx-1">Rig Speed (RPM)</span>
                <span>180</span>
              </div>
              <div className="text-[9px] text-slate-500">
                Steering Mode: Rotating / Sliding
              </div>
            </div>

            {/* Track 4 Scale Header: Hydraulics SPP & Flow */}
            <div className="border-r border-slate-800 px-3">
              <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                <span>TRACK 4: HYDRAULICS</span>
              </div>
              <div className="flex items-center justify-between text-rose-400 font-semibold mb-0.5">
                <span>0</span>
                <span className="truncate mx-1">SPP ({sppUnit})</span>
                <span>{sppMaxScale}</span>
              </div>
              <div className="flex items-center justify-between text-orange-400 font-semibold">
                <span>0</span>
                <span className="truncate mx-1">Flow Rate ({flowUnit})</span>
                <span>{flowMaxScale}</span>
              </div>
            </div>

            {/* Track 5 Scale Header: Operational Annotations */}
            <div className="pl-3 flex flex-col justify-center">
              <span className="font-bold text-slate-200 block">OBSERVATIONS</span>
              <span className="text-slate-500 text-[9px]">Rig Operations & Events</span>
            </div>
          </div>

          {/* SVG MULTI-TRACK CURVE CANVAS */}
          <div
            ref={svgContainerRef}
            className="relative cursor-crosshair select-none bg-slate-950 rounded-b-lg border border-slate-900 overflow-hidden"
          >
            <svg
              width={totalSvgWidth}
              height={canvasHeight}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full"
            >
              <defs>
                {/* Gamma ray green gradient fill */}
                <linearGradient id="gammaFill" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
                </linearGradient>

                {/* Grid line pattern */}
                <pattern id="logGrid" width="48" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 3" />
                </pattern>
              </defs>

              {/* 1. BACKGROUND TRACK RECTS & VERTICAL DIVIDERS */}
              {/* Track 1: ROP & Gamma */}
              <rect x={xTrack1} y="0" width={track1Width} height={canvasHeight} fill="#090d16" />
              <rect x={xTrack1} y="0" width={track1Width} height={canvasHeight} fill="url(#logGrid)" />
              <line x1={xTrack1 + track1Width} y1="0" x2={xTrack1 + track1Width} y2={canvasHeight} stroke="#334155" strokeWidth="1.5" />

              {/* Depth / Index Track */}
              <rect x={xDepth} y="0" width={depthTrackWidth} height={canvasHeight} fill="#0f172a" />
              <line x1={xDepth + depthTrackWidth} y1="0" x2={xDepth + depthTrackWidth} y2={canvasHeight} stroke="#334155" strokeWidth="1.5" />

              {/* Track 2: WOB & Torque */}
              <rect x={xTrack2} y="0" width={track2Width} height={canvasHeight} fill="#090d16" />
              <rect x={xTrack2} y="0" width={track2Width} height={canvasHeight} fill="url(#logGrid)" />
              <line x1={xTrack2 + track2Width} y1="0" x2={xTrack2 + track2Width} y2={canvasHeight} stroke="#334155" strokeWidth="1.5" />

              {/* Track 3: Rotary & Mode */}
              <rect x={xTrack3} y="0" width={track3Width} height={canvasHeight} fill="#090d16" />
              <rect x={xTrack3} y="0" width={track3Width} height={canvasHeight} fill="url(#logGrid)" />
              <line x1={xTrack3 + track3Width} y1="0" x2={xTrack3 + track3Width} y2={canvasHeight} stroke="#334155" strokeWidth="1.5" />

              {/* Track 4: Hydraulics */}
              <rect x={xTrack4} y="0" width={track4Width} height={canvasHeight} fill="#090d16" />
              <rect x={xTrack4} y="0" width={track4Width} height={canvasHeight} fill="url(#logGrid)" />
              <line x1={xTrack4 + track4Width} y1="0" x2={xTrack4 + track4Width} y2={canvasHeight} stroke="#334155" strokeWidth="1.5" />

              {/* Track 5: Observations */}
              <rect x={xTrack5} y="0" width={track5Width} height={canvasHeight} fill="#030712" />

              {/* 2. HORIZONTAL GRID TICKS & DEPTH / TIME NUMBERS */}
              {logDomain === 'depth' ? (
                depthTicks.map(d => {
                  const y = depthToY(d);
                  return (
                    <g key={d}>
                      <line x1="0" y1={y} x2={totalSvgWidth} y2={y} stroke="#1e293b" strokeWidth="0.8" />
                      <line x1={xDepth} y1={y} x2={xDepth + 6} y2={y} stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1={xDepth + depthTrackWidth - 6} y1={y} x2={xDepth + depthTrackWidth} y2={y} stroke="#f59e0b" strokeWidth="1.5" />
                      <text
                        x={xDepth + depthTrackWidth / 2}
                        y={y + 4}
                        fill="#cbd5e1"
                        fontSize="11"
                        fontFamily="ui-monospace, monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {(d * depthFactor).toFixed(0)}{depthUnit}
                      </text>
                    </g>
                  );
                })
              ) : (
                timeTicks.map(tick => {
                  const y = timeToY(tick.hours);
                  return (
                    <g key={tick.seconds}>
                      <line
                        x1="0"
                        y1={y}
                        x2={totalSvgWidth}
                        y2={y}
                        stroke={tick.isMajor ? '#334155' : '#1e293b'}
                        strokeWidth={tick.isMajor ? '1.0' : '0.6'}
                        strokeDasharray={tick.isMajor ? undefined : '2 2'}
                      />
                      <line x1={xDepth} y1={y} x2={xDepth + 6} y2={y} stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={xDepth + depthTrackWidth - 6} y1={y} x2={xDepth + depthTrackWidth} y2={y} stroke="#38bdf8" strokeWidth="1.5" />
                      <text
                        x={xDepth + depthTrackWidth / 2}
                        y={y - 1}
                        fill="#f8fafc"
                        fontSize="10"
                        fontFamily="ui-monospace, monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {tick.timeStr}
                      </text>
                      <text
                        x={xDepth + depthTrackWidth / 2}
                        y={y + 11}
                        fill="#38bdf8"
                        fontSize="8"
                        fontFamily="ui-monospace, monospace"
                        textAnchor="middle"
                      >
                        {tick.elapsedLabel}
                      </text>
                    </g>
                  );
                })
              )}

              {/* 3. STEERING MODE BACKGROUND BARS IN TRACK 3 */}
              {logDomain === 'depth'
                ? visibleDepthPoints.map((p, idx) => {
                    const y1 = depthToY(p.md);
                    const nextP = visibleDepthPoints[idx + 1];
                    const y2 = nextP ? depthToY(nextP.md) : y1 + 6;
                    const h = Math.max(3, y2 - y1);
                    if (p.mode.includes('Sliding')) {
                      return (
                        <rect
                          key={idx}
                          x={xTrack3}
                          y={y1}
                          width={track3Width}
                          height={h}
                          fill="rgba(245, 158, 11, 0.18)"
                        />
                      );
                    }
                    return null;
                  })
                : visibleTimePoints.map((p, idx) => {
                    const y1 = timeToY(p.elapsedHours);
                    const nextP = visibleTimePoints[idx + 1];
                    const y2 = nextP ? timeToY(nextP.elapsedHours) : y1 + 8;
                    const h = Math.max(3, y2 - y1);
                    if (p.mode.includes('Connection')) {
                      return (
                        <rect
                          key={idx}
                          x={xTrack3}
                          y={y1}
                          width={track3Width}
                          height={h}
                          fill="rgba(51, 65, 85, 0.45)"
                        />
                      );
                    } else if (p.mode.includes('Sliding')) {
                      return (
                        <rect
                          key={idx}
                          x={xTrack3}
                          y={y1}
                          width={track3Width}
                          height={h}
                          fill="rgba(245, 158, 11, 0.18)"
                        />
                      );
                    }
                    return null;
                  })}

              {/* 4. CONTINUOUS ULTRA-FINE LOG CURVES */}
              {logDomain === 'depth' ? (
                <>
                  {/* Track 1: Gamma Ray Shaded Fill */}
                  {grDepthShadePath && <path d={grDepthShadePath} fill="url(#gammaFill)" />}

                  {/* Track 1: Gamma Ray Curve (Green) */}
                  <polyline
                    points={grDepthPolyline}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 1: ROP Curve (Cyan) */}
                  <polyline
                    points={ropDepthPolyline}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 2: Torque Curve (Purple) */}
                  <polyline
                    points={trqDepthPolyline}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 2: WOB Curve (Amber) */}
                  <polyline
                    points={wobDepthPolyline}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 3: Rotary RPM Curve (Sky Blue) */}
                  <polyline
                    points={rpmDepthPolyline}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 4: Flow Rate Curve (Orange Dashed) */}
                  <polyline
                    points={flowDepthPolyline}
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 4: SPP Curve (Rose/Red) */}
                  <polyline
                    points={sppDepthPolyline}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 5: Operational Milestones & Flags */}
                  {visibleDepthPoints
                    .filter(p => p.operationNote)
                    .map((p, idx) => {
                      const y = depthToY(p.md);
                      return (
                        <g key={idx}>
                          <line x1={xTrack5} y1={y} x2={xTrack5 + 12} y2={y} stroke="#f59e0b" strokeWidth="1.5" />
                          <circle cx={xTrack5 + 12} cy={y} r="3" fill="#f59e0b" />
                          <rect
                            x={xTrack5 + 18}
                            y={y - 9}
                            width="155"
                            height="18"
                            rx="3"
                            fill="#1e293b"
                            stroke="#334155"
                          />
                          <text
                            x={xTrack5 + 23}
                            y={y + 3}
                            fill="#f8fafc"
                            fontSize="9"
                            fontFamily="ui-monospace, monospace"
                          >
                            {p.operationNote?.slice(0, 24)}...
                          </text>
                        </g>
                      );
                    })}
                </>
              ) : (
                <>
                  {/* Time Domain Curves */}
                  {/* Track 1: ROP Curve */}
                  <polyline
                    points={ropTimePolyline}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 2: Torque Curve */}
                  <polyline
                    points={trqTimePolyline}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 2: WOB Curve */}
                  <polyline
                    points={wobTimePolyline}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 3: Rotary RPM Curve */}
                  <polyline
                    points={rpmTimePolyline}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 4: Flow Rate Curve */}
                  <polyline
                    points={flowTimePolyline}
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 4: SPP Curve */}
                  <polyline
                    points={sppTimePolyline}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Track 5: Time Domain Flags */}
                  {visibleTimePoints
                    .filter(p => p.statusNote && !p.statusNote.includes('Drill ahead'))
                    .map((p, idx) => {
                      const y = timeToY(p.elapsedHours);
                      return (
                        <g key={idx}>
                          <line x1={xTrack5} y1={y} x2={xTrack5 + 12} y2={y} stroke="#38bdf8" strokeWidth="1.5" />
                          <circle cx={xTrack5 + 12} cy={y} r="3" fill="#38bdf8" />
                          <rect
                            x={xTrack5 + 18}
                            y={y - 9}
                            width="155"
                            height="18"
                            rx="3"
                            fill="#1e293b"
                            stroke="#334155"
                          />
                          <text
                            x={xTrack5 + 23}
                            y={y + 3}
                            fill="#f8fafc"
                            fontSize="9"
                            fontFamily="ui-monospace, monospace"
                          >
                            {p.statusNote?.slice(0, 24)}...
                          </text>
                        </g>
                      );
                    })}
                </>
              )}

              {/* 5. INTERACTIVE HORIZONTAL CROSSHAIR LINE */}
              {hoverY !== null && (
                <g>
                  {/* Dashed line across all tracks */}
                  <line
                    x1="0"
                    y1={hoverY}
                    x2={totalSvgWidth}
                    y2={hoverY}
                    stroke="#facc15"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />

                  {/* Crosshair depth label pill in index track */}
                  <rect
                    x={xDepth + 4}
                    y={hoverY - 9}
                    width={depthTrackWidth - 8}
                    height="18"
                    rx="3"
                    fill="#eab308"
                  />
                  <text
                    x={xDepth + depthTrackWidth / 2}
                    y={hoverY + 4}
                    fill="#020617"
                    fontSize="10"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {logDomain === 'depth'
                      ? `${(yToDepth(hoverY) * depthFactor).toFixed(1)}${depthUnit}`
                      : `+${yToTime(hoverY).toFixed(2)}h`}
                  </text>

                  {/* Exact point tracking dots on active curves */}
                  {/* Track 1: ROP dot */}
                  <circle cx={ropToX(activeHoverReadout.rop)} cy={hoverY} r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                  {/* Track 2: WOB dot */}
                  <circle cx={wobToX(activeHoverReadout.wob)} cy={hoverY} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                  {/* Track 2: Torque dot */}
                  <circle cx={trqToX(activeHoverReadout.torque)} cy={hoverY} r="3.5" fill="#c084fc" stroke="#ffffff" strokeWidth="1.5" />
                  {/* Track 3: RPM dot */}
                  <circle cx={rpmToX(activeHoverReadout.rpm)} cy={hoverY} r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                  {/* Track 4: SPP dot */}
                  <circle cx={sppToX(activeHoverReadout.spp)} cy={hoverY} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* 5. SAMPLING PHYSICS & DATA CONTEXT */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 text-xs text-slate-300 space-y-3">
        <h4 className="font-semibold text-amber-400 font-mono text-xs uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <span>Continuous High-Resolution Sampling Methodology</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed font-mono">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <strong className="text-cyan-400 block">Sub-Meter Depth Step ({depthStepM}m):</strong>
            <p className="text-slate-400 text-[11px] font-sans">
              Unlike coarse surveys spaced 30m apart, actual downhole MWD gamma and mechanical sensors log at sub-meter intervals (<strong>0.2m to 0.5m</strong>), revealing thin sandstone laminae, hard stringers, and cutter engagement changes.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <strong className="text-sky-400 block">High-Frequency Time Sampling ({timeStepSec}s):</strong>
            <p className="text-slate-400 text-[11px] font-sans">
              Surface EDR rig telemetry captures dynamic data every <strong>10 to 30 seconds</strong>. This reveals individual connection cycles (slips set, weight off, pumps down), toolface adjustments, and sudden pressure drop signatures.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <strong className="text-amber-400 block">Inspection Window Pan:</strong>
            <p className="text-slate-400 text-[11px] font-sans">
              Use the <strong>Span buttons (150m / 300m)</strong> and <strong>Pan Slider</strong> to inspect specific depths with high visual fidelity, such as the casing shoe interval, kickoff point, or loss zones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
