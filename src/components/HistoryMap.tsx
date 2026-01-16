import { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJsonFeatureCollection, TelemetryProperties, TelemetryRanges } from '@/services/api/telemetryService';
import { Gauge, Layers, Activity, Mountain } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const googleHybridUrl = 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}';

interface HistoryMapProps {
  geoJson: GeoJsonFeatureCollection;
  ranges: TelemetryRanges;
  statusFilter: 'all' | 'working' | 'dislocating' | 'stopped';
  maxActiveSectionsFilter: number | null;
  averageFuel?: number;
  averagePitch?: number;
}

type MapType = 
  | 'speed' 
  | 'rpm' 
  | 'elevation' 
  | 'rate' 
  | 'flow' 
  | 'pressure' 
  | 'engine_load' 
  | 'engine_temp' 
  | 'oil_temp' 
  | 'oil_pressure';

// Custom SVG markers for start and end
const createMarkerIcon = (color: string, label: string) => new L.DivIcon({
  className: '',
  html: `
    <div style="
      width: 24px; height: 32px; position: relative;
      display: flex; flex-direction: column; align-items: center;
    ">
      <div style="
        width: 20px; height: 20px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
      <div style="
        font-size: 8px; font-weight: bold; color: white;
        background: ${color}; padding: 1px 3px; border-radius: 2px;
        margin-top: 2px; white-space: nowrap;
      ">${label}</div>
    </div>
  `,
  iconSize: [24, 40],
  iconAnchor: [12, 40],
  popupAnchor: [0, -40]
});

const startMarkerIcon = createMarkerIcon('hsl(142 85% 45%)', 'INÍCIO');
const endMarkerIcon = createMarkerIcon('hsl(0 85% 55%)', 'FIM');

// Static Helper Functions
const getConfig = (type: MapType) => {
  switch (type) {
    case 'speed': return { label: 'Velocidade', unit: 'km/h', icon: Gauge, decimals: 1, invertColor: true };
    case 'rpm': return { label: 'RPM Motor', unit: 'rpm', icon: Activity, decimals: 0, invertColor: true };
    case 'engine_load': return { label: 'Carga do Motor', unit: '%', icon: Activity, decimals: 0, invertColor: true };
    case 'engine_temp': return { label: 'Temp. Motor', unit: '°C', icon: Activity, decimals: 0, invertColor: true };
    case 'oil_temp': return { label: 'Temp. Óleo', unit: '°C', icon: Activity, decimals: 0, invertColor: true };
    case 'oil_pressure': return { label: 'Pressão Óleo', unit: 'kPa', icon: Activity, decimals: 0, invertColor: false };
    case 'rate': return { label: 'Taxa Aplicação', unit: 'L/ha', icon: Layers, decimals: 1, invertColor: true };
    case 'flow': return { label: 'Vazão', unit: 'L/min', icon: Layers, decimals: 1, invertColor: true };
    case 'pressure': return { label: 'Pressão Aplicação', unit: 'kPa', icon: Layers, decimals: 0, invertColor: true };
    case 'elevation': return { label: 'Altitude', unit: 'm', icon: Mountain, decimals: 1, invertColor: false };
    default: return { label: 'Valor', unit: '', icon: Activity, decimals: 1, invertColor: true };
  }
};

const getValue = (props: TelemetryProperties, type: MapType) => {
  switch (type) {
    case 'speed': return props.speed;
    case 'rpm': return props.rpm;
    case 'engine_load': return props.engineLoad;
    case 'engine_temp': return props.engineCoolantTemperature;
    case 'oil_temp': return props.engineOilTemperature;
    case 'oil_pressure': return props.engineOilPressure;
    case 'rate': return props.actualApplicationRate;
    case 'flow': return props.applicationFlowRate;
    case 'pressure': return props.actualApplicationPressure;
    case 'elevation': return props.alt;
    default: return 0;
  }
};

const getColor = (
  value: number | undefined, 
  range: { min: number, max: number } | undefined, 
  invert: boolean
): string => {
  if (value === undefined || value === null || !range) return '#78716c';
  if (range.max === range.min) return 'hsl(120, 85%, 45%)'; 
  let t = (value - range.min) / (range.max - range.min);
  t = Math.max(0, Math.min(1, t)); 
  const hue = invert ? (1 - t) * 120 : t * 120;
  return `hsl(${hue}, 85%, 50%)`;
};

const lineToPolygon = (
  p1: [number, number],
  p2: [number, number],
  widthMeters: number
): L.LatLngTuple[] => {
  if (!widthMeters || widthMeters <= 0) widthMeters = 30;
  
  const toRad = (d: number) => d * Math.PI / 180;
  const toDeg = (r: number) => r * 180 / Math.PI;
  const lat1 = toRad(p1[1]), lon1 = toRad(p1[0]);
  const lat2 = toRad(p2[1]), lon2 = toRad(p2[0]);
  const dLon = lon2 - lon1;
  const x = Math.sin(dLon) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = toDeg(Math.atan2(x, y));
  
  const perpBearing1 = (bearing + 90) % 360;
  const perpBearing2 = (bearing - 90 + 360) % 360;
  
  const halfWidth = widthMeters / 2;
  const earthRadius = 6378137;
  
  const offsetPoint = (lat: number, lng: number, brng: number, dist: number): [number, number] => {
    const latRad = toRad(lat);
    const lngRad = toRad(lng);
    const brngRad = toRad(brng);
    const distRatio = dist / earthRadius;
    
    const newLat = Math.asin(
      Math.sin(latRad) * Math.cos(distRatio) +
      Math.cos(latRad) * Math.sin(distRatio) * Math.cos(brngRad)
    );
    const newLng = lngRad + Math.atan2(
      Math.sin(brngRad) * Math.sin(distRatio) * Math.cos(latRad),
      Math.cos(distRatio) - Math.sin(latRad) * Math.sin(newLat)
    );
    return [toDeg(newLat), toDeg(newLng)];
  };
  
  const [lat1L, lng1L] = offsetPoint(p1[1], p1[0], perpBearing1, halfWidth);
  const [lat1R, lng1R] = offsetPoint(p1[1], p1[0], perpBearing2, halfWidth);
  const [lat2L, lng2L] = offsetPoint(p2[1], p2[0], perpBearing1, halfWidth);
  const [lat2R, lng2R] = offsetPoint(p2[1], p2[0], perpBearing2, halfWidth);
  
  return [
    [lat1L, lng1L] as L.LatLngTuple,
    [lat2L, lng2L] as L.LatLngTuple,
    [lat2R, lng2R] as L.LatLngTuple,
    [lat1R, lng1R] as L.LatLngTuple,
  ];
};

const WORKING_EVENT = 155;
const DISLOCATING_EVENT = 153;
const BEING_DISPLACEMENT = 154;

// Fit bounds helper
const MapBounds = ({ geoJson }: { geoJson: GeoJsonFeatureCollection }) => {
  const map = useMap();
  useEffect(() => {
    if (geoJson?.features?.length) {
      const coords = geoJson.features.flatMap(f => f.geometry.coordinates.map(c => [c[1], c[0]] as L.LatLngTuple));
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [geoJson, map]);
  return null;
};

import { FastTelemetryLayer } from './FastTelemetryLayer';

interface NativeLayersProps {
  filteredFeatures: any[];
  mapType: MapType;
  activeRange: { min: number, max: number, avg: number };
  config: any;
  maxSections: number;
  onHover: (f: any | null) => void;
}

const NativeLayers = ({ filteredFeatures, mapType, activeRange, config, maxSections, onHover }: NativeLayersProps) => {
  const map = useMap();
  const layerRef = useRef<FastTelemetryLayer | null>(null);

  useEffect(() => {
    if (!layerRef.current) {
        layerRef.current = new FastTelemetryLayer({
            features: filteredFeatures,
            mapType,
            activeRange,
            config,
            maxSections,
            getValue, // Pass the getValue function from parent scope
            onHover
        });
        map.addLayer(layerRef.current);
    } else {
        layerRef.current.setOptions({
            features: filteredFeatures,
            mapType,
            activeRange,
            config,
            maxSections
        });
        // Force redraw if needed, setOptions handles it
    }

    return () => {
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
            layerRef.current = null;
        }
    };
  }, [map, filteredFeatures, mapType, activeRange, config, maxSections, onHover]);

  return null;
};

// ==================================================================================
// MAIN COMPONENT
// ==================================================================================
const HistoryMap = ({ 
  geoJson, 
  ranges, 
  statusFilter,
  maxActiveSectionsFilter,
  averageFuel,
  averagePitch
}: HistoryMapProps) => {
  const [hoverFeature, setHoverFeature] = useState<any | null>(null);
  const [mapType, setMapType] = useState<MapType>('speed');
  
  // Calculate max available sections
  const maxSections = useMemo(() => {
    if (!geoJson?.features?.length) return 7;
    let maxLen = 0;
    for (const f of geoJson.features) {
       const s = f.properties?.sections as boolean[] | undefined;
       if (Array.isArray(s) && s.length > maxLen) maxLen = s.length;
    }
    return maxLen > 0 ? maxLen : 7;
  }, [geoJson]);

  const config = getConfig(mapType);

  // Range Logic
  const getRange = useCallback((type: MapType) => {
    switch (type) {
      case 'speed': return ranges?.speed;
      case 'rpm': return ranges?.rpm;
      case 'engine_load': return ranges?.engineLoad;
      case 'engine_temp': return ranges?.engineCoolantTemperature;
      case 'oil_temp': return ranges?.engineOilTemperature;
      case 'oil_pressure': return ranges?.engineOilPressure;
      case 'rate': return ranges?.actualApplicationRate;
      case 'flow': return { min: 0, max: 200, avg: 100 }; 
      case 'pressure': return ranges?.actualApplicationPressure;
      case 'elevation': return ranges?.alt;
      default: return null;
    }
  }, [ranges]);

  const activeRange = useMemo(() => {
    const backendRange = getRange(mapType);
    if (backendRange) return backendRange;
    
    if (!geoJson?.features?.length) return { min: 0, max: 100, avg: 50 };
    
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let count = 0;
    
    for (const f of geoJson.features) {
       if (!f.properties?.working) continue;
       const val = getValue(f.properties, mapType);
       if (val !== undefined && val !== null) {
         if (val < min) min = val;
         if (val > max) max = val;
         sum += val;
         count++;
       }
    }
    
    if (count === 0) return { min: 0, max: 100, avg: 0 };
    return { min, max, avg: sum / count };
  }, [geoJson, getRange, mapType]);


  // Filtering Logic
  const filteredFeatures = useMemo(() => {
    if (!geoJson?.features) return [];

    return geoJson.features.filter(f => {
      const props = f.properties;
      const isWorking = props?.working === true || props?.transmissionReason === WORKING_EVENT;
      const isDislocating = props?.dislocating === true 
        || props?.transmissionReason === DISLOCATING_EVENT 
        || props?.transmissionReason === BEING_DISPLACEMENT;
      const isStopped = !isWorking && !isDislocating && props?.ignitionOn && !props?.moving;

      if (statusFilter === 'working' && !isWorking) return false;
      if (statusFilter === 'dislocating' && !isDislocating) return false;
      if (statusFilter === 'stopped' && !isStopped) return false;

      if (maxActiveSectionsFilter !== null && isWorking) {
        const sections = props?.sections as boolean[] | undefined;
        const activeSections = Array.isArray(sections) ? sections.filter(s => s).length : 0;
        if (activeSections > maxActiveSectionsFilter) return false;
      }

      return true;
    });
  }, [geoJson, statusFilter, maxActiveSectionsFilter]);

  // Distribution for legend
  const legendData = useMemo(() => {
    if (!activeRange || !filteredFeatures.length) return [];

    const bands = 5;
    const step = (activeRange.max - activeRange.min) / bands;
    const distribution = Array(bands).fill(0).map((_, i) => ({
      min: activeRange.max - (step * (i + 1)),
      max: activeRange.max - (step * i),
      count: 0
    }));

    let total = 0;
    for (const f of filteredFeatures) {
      if (!f.properties?.working) continue; 
      const val = getValue(f.properties, mapType);
      if (val === undefined || val === null) continue;
      
      total++;
      for (const band of distribution) {
        if (val >= band.min && val <= band.max + 0.001) { 
          band.count++;
          break;
        }
      }
    }

    return distribution.map(d => ({
      value: d.min, 
      label: d.max.toFixed(config.decimals), 
      percentage: total > 0 ? (d.count / total * 100).toFixed(1) : '0.0'
    }));
  }, [filteredFeatures, mapType, activeRange, config]);

  // Stable callback for hover
  const handleHover = useCallback((f: any | null) => {
    setHoverFeature(f);
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden border border-border">
      {/* Map Type Selector */}
      <div className="absolute top-4 left-4 z-[1000] w-[200px]">
        <Select value={mapType} onValueChange={(v) => setMapType(v as MapType)}>
          <SelectTrigger className="bg-card/95 backdrop-blur shadow-md border-border h-9">
             <div className="flex items-center gap-2">
                <config.icon className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Selecione" />
             </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="speed">Velocidade (km/h)</SelectItem>
            <SelectItem value="rpm">RPM Motor (rpm)</SelectItem>
            <SelectItem value="rate">Taxa Aplicação (L/ha)</SelectItem>
            <SelectItem value="flow">Vazão (L/min)</SelectItem>
            <SelectItem value="pressure">Pressão (kPa)</SelectItem>
            <SelectItem value="engine_load">Carga Motor (%)</SelectItem>
            <SelectItem value="engine_temp">Temp. Motor (°C)</SelectItem>
            <SelectItem value="oil_temp">Temp. Óleo (°C)</SelectItem>
            <SelectItem value="oil_pressure">Pressão Óleo (kPa)</SelectItem>
            <SelectItem value="elevation">Altitude (m)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <MapContainer 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false} 
        attributionControl={false} 
        zoom={13} 
        center={[0, 0]} 
        preferCanvas={true}
      >
        <AttributionControl position="bottomright" prefix={false} />
        <TileLayer url={googleHybridUrl} attribution='&copy; Google Maps' maxZoom={20} />
        <MapBounds geoJson={geoJson} />
        
        {/* Native Leaflet Layers - Maximum Performance */}
        <NativeLayers 
          filteredFeatures={filteredFeatures}
          mapType={mapType}
          activeRange={activeRange}
          config={config}
          maxSections={maxSections}
          onHover={handleHover}
        />
        
        {/* Start/End Markers */}
        {(function() {
            if (!filteredFeatures.length) return null;
            const start = filteredFeatures[0]?.properties;
            const end = filteredFeatures[filteredFeatures.length-1]?.properties;
            if (!start?.lat || !start?.lng) return null;
            
            return (
              <>
                <Marker position={[start.lat, start.lng]} icon={startMarkerIcon}>
                   <Popup>Início</Popup>
                </Marker>
                {end?.lat && end?.lng && (
                    <Marker position={[end.lat, end.lng]} icon={endMarkerIcon}>
                        <Popup>Fim</Popup>
                    </Marker>
                )}
              </>
            );
        })()}
        
      </MapContainer>
      
      {/* Simple Vertical Status Legend */}
      <div className="absolute bottom-6 left-4 bg-card/90 backdrop-blur rounded-md shadow-md p-3 z-[1000] text-xs space-y-2 min-w-[140px]">
        <div className="font-bold text-sm text-foreground mb-1">Legenda</div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded" style={{
            background: config.invertColor 
              ? 'linear-gradient(to right, #ef4444, #22c55e)' 
              : 'linear-gradient(to right, #22c55e, #ef4444)' 
          }} />
          <span className="text-muted-foreground font-medium">{config.label} ({config.unit})</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-accent" />
          <span className="text-muted-foreground">Deslocamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-warning" />
          <span className="text-muted-foreground">Manobra</span>
        </div>
         <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-destructive" />
          <span className="text-muted-foreground">Parado</span>
        </div>
      </div>

      {/* Heatmap Gradient Legend */}
      {legendData.length > 0 && (
        <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-3 pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto self-end">
             {/* Angle / Slope */}
             <div className="bg-white/90 backdrop-blur-sm shadow-md border border-gray-200 rounded-lg px-3 py-2 flex flex-col items-center justify-center min-w-[70px]">
                <Mountain className="w-5 h-5 text-gray-600 mb-1" />
                <span className="font-bold text-red-600 text-lg">
                  {(() => {
                    const val = Number(averagePitch);
                    if (!isNaN(val) && val > 0) {
                       return val.toFixed(1).replace('.', ',');
                    }
                    return "0,0";
                  })()}°
                </span>
             </div>

             {/* Fuel Rate Avg */}
             <div className="bg-white/90 backdrop-blur-sm shadow-md border border-gray-200 rounded-lg px-3 py-2 flex flex-col items-center justify-center min-w-[70px]">
                <Gauge className="w-5 h-5 text-gray-600 mb-1" />
                <span className="font-bold text-red-600 text-lg">
                   {(() => {
                      if (averageFuel !== undefined && averageFuel !== null) {
                         return averageFuel.toFixed(1).replace('.', ',');
                      }
                      return "0,0";
                   })()} L/h
                </span>
             </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 pointer-events-auto">
            <div className="flex items-center gap-1 mb-2">
              <config.icon className="w-3 h-3 text-gray-900" />
              <span className="text-xs font-bold text-gray-900">{config.unit}</span>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col justify-between text-xs h-[140px] py-1">
                {legendData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className="font-bold text-gray-900 w-10 text-right">{d.label}</span>
                    <span className="text-gray-600 w-8 text-right font-mono">{d.percentage}%</span>
                  </div>
                ))}
              </div>
              <div className="relative w-4 h-[140px] rounded ring-1 ring-border overflow-hidden">
                <div className="w-full h-full" style={{
                  background: config.invertColor 
                    ? 'linear-gradient(to bottom, #ef4444, #eab308, #22c55e)' 
                    : 'linear-gradient(to bottom, #22c55e, #eab308, #ef4444)' 
                }} />
                
                {/* Hover Indicator */}
                {hoverFeature && (() => {
                  if (activeRange) {
                    const val = getValue(hoverFeature.properties, mapType);
                    if (val !== undefined) {
                      let t = (val - activeRange.min) / (activeRange.max - activeRange.min);
                      t = Math.max(0, Math.min(1, t)); 
                      const topPerc = (1 - t) * 100;
                      
                      return (
                        <div 
                          className="absolute right-0 w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-gray-900 translate-x-[2px]"
                          style={{ top: `calc(${topPerc}% - 5px)` }}
                        />
                      );
                    }
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {hoverFeature && (() => {
        const hoverPoint = hoverFeature.properties;
        const conf = getConfig(mapType);
        const val = getValue(hoverPoint, mapType);
        
        const getEffectiveWidth = (props: TelemetryProperties): number => {
            const rawWidth = props.actualWorkingWidth ?? 30;
            const sections = props.sections as boolean[] | undefined;
            if (!Array.isArray(sections) || maxSections === 0) return rawWidth;
            const activeCount = sections.filter(s => s).length;
            return (activeCount / maxSections) * rawWidth;
        };
        const effectiveWidth = getEffectiveWidth(hoverPoint);
        
        const dateStr = hoverPoint.localPositionDateTime as string || '-';
        const [datePart, timePart] = dateStr.includes(' ') ? dateStr.split(' ') : [dateStr, '-'];
        
        return (
        <div className="absolute top-16 right-4 z-[1000] flex flex-col gap-2 pointer-events-none w-[220px]">
          <div className="bg-card/95 backdrop-blur rounded-lg p-3 shadow-xl border border-border">
            <div className="text-sm font-bold text-foreground mb-2 border-b border-border pb-1">
              {hoverPoint.working ? 'Trabalhando' : hoverPoint.dislocating ? 'Deslocando' : 'Parado'}
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center bg-primary/20 border border-primary/30 p-1.5 rounded-md shadow-sm">
                <span className="font-bold text-foreground">{conf.label}:</span>
                <span className="font-mono font-bold text-primary">{val?.toFixed(conf.decimals) ?? '-'} {conf.unit}</span>
              </div>
              
              <div className="flex justify-between items-center px-1">
                <span className="text-muted-foreground">Velocidade:</span>
                <span className="font-mono font-bold text-foreground">{hoverPoint.speed?.toFixed(1) ?? '-'} km/h</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-muted-foreground">RPM:</span>
                <span className="font-mono font-bold text-foreground">{hoverPoint.rpm?.toFixed(0) ?? '-'}</span>
              </div>
               <div className="flex justify-between items-center px-1">
                <span className="text-muted-foreground">Largura do trabalho:</span>
                <span className="font-mono font-bold text-foreground">
                    {effectiveWidth && effectiveWidth > 0 ? `${effectiveWidth.toFixed(1)} m` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border mt-1 px-1">
                 <span className="text-[10px] text-muted-foreground">Data/Hora:</span>
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-medium text-foreground">{datePart}</span>
                    <span className="text-[10px] font-medium text-foreground">{timePart}</span>
                 </div>
              </div>
            </div>

            {/* Sections Grid */}
            {maxSections > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="text-[10px] text-muted-foreground mb-1.5 font-medium">Seções de Pulverização</div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: maxSections }).map((_, i) => {
                    const isActive = hoverPoint.sections ? hoverPoint.sections[i] : false;
                    return (
                    <div 
                      key={i} 
                      className={`
                        w-5 h-5 rounded-[4px] text-[10px] flex items-center justify-center font-bold shadow-sm transition-all
                        ${isActive ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground/50'}
                      `}
                    >
                      {i + 1}
                    </div>
                    );
                })}
              </div>
            </div>
            )}
          </div>
        </div>
        );
      })()} 
    </div>
  );
};

export default HistoryMap;
