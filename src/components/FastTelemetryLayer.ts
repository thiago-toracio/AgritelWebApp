
import L from 'leaflet';
import { TelemetryProperties } from '@/services/api/telemetryService';

// Interfaces duplicated from HistoryMap for standalone usage or merging later
interface Range { min: number; max: number; avg: number }
interface Config { invertColor: boolean; decimals: number; unit: string; label: string }
type MapType = 'speed' | 'rpm' | 'elevation' | 'rate' | 'flow' | 'pressure' | 'engine_load' | 'engine_temp' | 'oil_temp' | 'oil_pressure';

// Helper for color interpolation (same as current)
const getColor = (value: number | undefined, range: Range | undefined, invert: boolean): string => {
  if (value === undefined || value === null || !range) return '#78716c';
  if (range.max === range.min) return 'hsl(120, 85%, 45%)'; 
  let t = (value - range.min) / (range.max - range.min);
  t = Math.max(0, Math.min(1, t)); 
  const hue = invert ? (1 - t) * 120 : t * 120;
  return `hsl(${hue}, 85%, 50%)`;
};

// Main Class
export class FastTelemetryLayer extends L.Layer {
  private _layerMap: L.Map | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _features: any[] = [];
  private _mapType: MapType = 'speed';
  private _activeRange: Range = { min: 0, max: 100, avg: 50 };
  private _config: Config = { invertColor: false, decimals: 1, unit: '', label: '' };
  private _maxSections: number = 7;
  private _getValue: (props: TelemetryProperties, type: MapType) => number;
  private _onHover: (f: any | null) => void;
  
  // Cache for projected points to avoid re-projecting on every hover check (optional, but good for heavy data)
  // For now, we project on draw.

  constructor(options: any) {
    super(options);
    this._features = options.features || [];
    this._mapType = options.mapType;
    this._activeRange = options.activeRange;
    this._config = options.config;
    this._maxSections = options.maxSections;
    this._getValue = options.getValue;
    this._onHover = options.onHover;
  }

  onAdd(map: L.Map) {
    this._layerMap = map;
    
    if (!this._canvas) {
      this._canvas = L.DomUtil.create('canvas', 'leaflet-zoom-animated');
      // @ts-ignore
      L.DomUtil.addClass(this._canvas, 'leaflet-interactive');
      this._ctx = this._canvas!.getContext('2d');
    }

    map.getPanes().overlayPane.appendChild(this._canvas!);
    
    map.on('moveend zoomend', this._reset, this);
    map.on('mousemove', this._handleMouseMove, this);
    map.on('mouseout', this._handleMouseOut, this);
    
    this._reset();
    return this;
  }

  onRemove(map: L.Map) {
    map.getPanes().overlayPane.removeChild(this._canvas!);
    map.off('moveend zoomend', this._reset, this);
    map.off('mousemove', this._handleMouseMove, this);
    map.off('mouseout', this._handleMouseOut, this);
    this._layerMap = null;
    return this;
  }

  setOptions(options: any) {
    let needsRedraw = false;
    if (options.features !== undefined) { this._features = options.features; needsRedraw = true; }
    if (options.mapType !== undefined) { this._mapType = options.mapType; needsRedraw = true; }
    if (options.activeRange !== undefined) { this._activeRange = options.activeRange; needsRedraw = true; }
    if (options.config !== undefined) { this._config = options.config; needsRedraw = true; }
    
    if (needsRedraw) this._reset();
  }

  private _reset() {
    if (!this._layerMap || !this._canvas) return;
    
    const topLeft = this._layerMap.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);

    const size = this._layerMap.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    
    this._draw();
  }

  private _draw() {
    if (!this._ctx || !this._layerMap) return;
    
    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._canvas!.width, this._canvas!.height);
    
    const mapBounds = this._layerMap.getBounds();
    const zoom = this._layerMap.getZoom();
    
    // Batching: Key -> Path2D
    // Key format: "color|width|lineCap"
    const batches = new Map<string, Path2D>();
    
    // Helper to add segment to batch
    const addToBatch = (p1: L.Point, p2: L.Point, color: string, width: number, cap: CanvasLineCap) => {
        const key = `${color}|${width.toFixed(2)}|${cap}`;
        let path = batches.get(key);
        if (!path) {
            path = new Path2D();
            batches.set(key, path);
        }
        path.moveTo(p1.x, p1.y);
        path.lineTo(p2.x, p2.y);
    };

    // Pre-calculate meters per pixel for center of map (approximation is good enough for width)
    // Calculating per-segment is too expensive and visual difference is negligible
    const centerLat = mapBounds.getCenter().lat;
    const metersPerPixel = 40075016.686 * Math.cos(centerLat * Math.PI / 180) / Math.pow(2, zoom + 8);

    this._features.forEach(f => {
      const coords = f.geometry.coordinates;
      if (coords.length < 2) return;
      
      const p1Lat = coords[0][1];
      const p1Lng = coords[0][0];
      
      // Frustum culling
      if (!mapBounds.contains(L.latLng(p1Lat, p1Lng))) return;

      const props = f.properties;
      const isWorking = props?.working === true || props?.transmissionReason === 155;
      const isDislocating = props?.dislocating === true 
        || props?.transmissionReason === 153 
        || props?.transmissionReason === 154;

      const p1Point = this._layerMap!.latLngToContainerPoint([p1Lat, p1Lng]);
      const p2Point = this._layerMap!.latLngToContainerPoint([coords[1][1], coords[1][0]]);
      
      if (isWorking) {
        const widthM = this._getEffectiveWidth(props);
        if (widthM <= 0.1) return;
        
        const widthPx = widthM / metersPerPixel;
        const value = this._getValue(props, this._mapType);
        const color = getColor(value, this._activeRange, this._config.invertColor);
        
        addToBatch(p1Point, p2Point, color, widthPx, 'butt');

      } else {
        const color = isDislocating ? 'hsl(200, 85%, 55%)' : (props?.maneuvering ? 'hsl(45, 85%, 55%)' : 'hsl(0, 0%, 50%)');
        const weight = isDislocating ? 4 : 2;
        addToBatch(p1Point, p2Point, color, weight, 'round');
      }
    });

    // Execute batches
    batches.forEach((path, key) => {
        const [color, widthStr, cap] = key.split('|');
        ctx.strokeStyle = color;
        ctx.lineWidth = parseFloat(widthStr);
        ctx.lineCap = cap as CanvasLineCap;
        ctx.stroke(path);
    });
  }
  
  private _getEffectiveWidth(props: TelemetryProperties): number {
    const rawWidth = props.actualWorkingWidth ?? 30;
    const sections = props.sections as boolean[] | undefined;
    if (!Array.isArray(sections) || this._maxSections === 0) return rawWidth;
    const activeCount = sections.filter(s => s).length;
    return (activeCount / this._maxSections) * rawWidth;
  }

  // Hit Detection
  // This is the expensive part if naive.
  // Optimization: Only check distance to line segment if near mouse.
  private _handleMouseMove(e: L.LeafletMouseEvent) {
    if (!this._layerMap) return;
    
    const mousePoint = e.containerPoint;
    const hitDistance = 10; // px
    
    // Reverse loop to hit top object first
    let found = null;
    
    // Optimization: convert mouse latlng to bounds check
    const mouseLatLng = e.latlng;
    const buffer = 0.0005; // approx 50m
    
    // Bounds check first (cheaper)
    const candidates = this._features.filter(f => {
        const lat = f.geometry.coordinates[0][1];
        const lng = f.geometry.coordinates[0][0];
        return Math.abs(lat - mouseLatLng.lat) < buffer && Math.abs(lng - mouseLatLng.lng) < buffer;
    });

    for (let i = candidates.length - 1; i >= 0; i--) {
        const f = candidates[i];
        const coords = f.geometry.coordinates;
        const p1 = this._layerMap.latLngToContainerPoint([coords[0][1], coords[0][0]]);
        const p2 = this._layerMap.latLngToContainerPoint([coords[1][1], coords[1][0]]);
        
        if (this._distToSegment(mousePoint, p1, p2) < hitDistance) {
            found = f;
            break;
        }
    }
    
    if (found) {
        L.DomUtil.addClass(this._canvas!, 'cursor-pointer');
        this._onHover(found);
    } else {
        L.DomUtil.removeClass(this._canvas!, 'cursor-pointer');
        this._onHover(null);
    }
  }

  private _handleMouseOut() {
    this._onHover(null);
  }

  // Distance squared from point P to segment VW
  private _distToSegment(p: L.Point, v: L.Point, w: L.Point) {
     const l2 = this._dist2(v, w);
     if (l2 === 0) return this._dist2(p, v);
     let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
     t = Math.max(0, Math.min(1, t));
     const projection = L.point(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
     return Math.sqrt(this._dist2(p, projection));
  }
  
  private _dist2(v: L.Point, w: L.Point) {
      return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  }
}
