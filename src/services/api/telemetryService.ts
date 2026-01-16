import { apiClient } from './apiClient';

// ==================== Simple History Types ====================
export interface TelemetryPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
  rpm: number;
  ignition: boolean;
  heading: number;
  statusColor: string;
  statusLabel: string;
}

export interface HistorySummary {
  maxSpeed: number;
  averageSpeed: number;
  totalDistance: number;
  totalArea: number;
  totalFuel: number;
  timeWorking: string;
  timeIdling: string;
  timeDislocating: string;
  timeTotal: string;
}

export interface HistoryResponse {
  deviceId: string;
  points: TelemetryPoint[];
  summary: HistorySummary;
}

// ==================== Active Days Types ====================
export interface ActiveDaysResponse {
  activeDays: ActiveDayInfo[];
}

export interface ActiveDayInfo {
  date: string;
  type: 'Working' | 'Dislocating';
  summary: string;
}

// ==================== Full Map Report Types (Legacy Compatible) ====================
export interface MapReportResponse {
  geoJson: GeoJsonFeatureCollection;
  range: TelemetryRanges;
  total: TripTotals;
  hourmeter: number;
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: GeoJsonGeometry;
  properties: TelemetryProperties;
}

export interface GeoJsonGeometry {
  type: 'LineString';
  coordinates: [number, number][]; // [lng, lat]
}

export interface TelemetryProperties {
  lat: number;
  lng: number;
  localPositionDateTime: string;
  timeElapsed: number;
  
  // Core telemetry
  speed?: number;
  rpm?: number;
  heading?: number;
  
  // Status flags
  ignitionOn?: boolean;
  moving?: boolean;
  working?: boolean;
  dislocating?: boolean;
  maneuvering?: boolean;
  transmissionReason?: number;
  
  // Engine data
  engineCoolantTemperature?: number;
  engineOilTemperature?: number;
  engineOilPressure?: number;
  engineLoad?: number;
  engineFuelRate?: number;
  
  // Application/Spray
  actualApplicationRate?: number;
  applicationFlowRate?: number;
  actualApplicationPressure?: number;
  actualWorkingWidth?: number;
  sections?: boolean[];
  
  // Harvest
  elevatorRpm?: number;
  slicerRpm?: number;
  cuttingPressure?: number;
  cuttingHeight?: number;
  
  // Area
  workedArea?: number;
  alt?: number;
}

export interface TelemetryRanges {
  speed: RangeInfo;
  rpm: RangeInfo;
  engineCoolantTemperature: RangeInfo;
  engineOilTemperature: RangeInfo;
  engineOilPressure: RangeInfo;
  engineLoad: RangeInfo;
  engineFuelRate: RangeInfo;
  actualApplicationRate: RangeInfo;
  actualApplicationPressure: RangeInfo;
  elevatorRpm: RangeInfo;
  cuttingPressure: RangeInfo;
  alt: RangeInfo;
}

export interface RangeInfo {
  min: number;
  max: number;
  avg: number;
}

export interface TripTotals {
  hourmeterIgnition: string; // "Xh Ym" format
  hourmeterWorked: string;   // "X.XX" format
  odometer: number;          // km
  fuelConsumption: number;   // liters
  applicationTotal: number;  // liters applied
  totalArea: number;         // hectares
  averageFuelConsumption?: number; // L/h
  averagePitch?: number; // Sum of averages (legacy logic)
}

// ==================== Service ====================
export const telemetryService = {
  /** Simple history data for basic map display */
  getHistory: async (deviceId: string, start: Date, end: Date): Promise<HistoryResponse> => {
    const startStr = start.toISOString();
    const endStr = end.toISOString();
    return apiClient.get<HistoryResponse>(
      `/telemetry/${deviceId}/history?start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}`
    );
  },

  /** Get active days with type (Working/Dislocating) for calendar display */
  getActiveDays: async (deviceId: string, year: number, month: number): Promise<ActiveDaysResponse> => {
    return apiClient.get<ActiveDaysResponse>(
      `/telemetry/${deviceId}/active-days?year=${year}&month=${month}`
    );
  },

  /** 
   * Full map report with GeoJSON, value ranges, and totals.
   * Matches legacy MapTelemetryDataProvider structure for complete map functionality.
   */
  getMapReport: async (deviceId: string, start: Date, end: Date): Promise<MapReportResponse> => {
    const startStr = start.toISOString();
    const endStr = end.toISOString();
    return apiClient.get<MapReportResponse>(
      `/telemetry/${deviceId}/map-report?start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}`
    );
  }
};
