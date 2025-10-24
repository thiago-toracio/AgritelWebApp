export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface DeviceFlags {
  working: boolean;
  dislocating: boolean;
  maneuvering: boolean;
  idling: boolean;
  ignition: boolean;
}

export interface GpsData {
  heading: number; // degrees (0-360)
  latitude: number;
  longitude: number;
  direction: number;
}

export interface DeviceMessage {
  hasLostConnection: boolean;
  transmissionReason: string;
  flag: DeviceFlags;
  gps: GpsData;
}

export interface TelemetryData {
  speed?: number; // km/h
  odometer?: number;
  fuelLevel?: number; // percentage
  engineTemp?: number;
  operationHours?: number;
  operationHoursUpdatedTime?: Date;
}

export interface DeviceState {
  color: string; // "gray" | "green" | "blue" | "yellow" | "red"
  tooltip: string;
}

export interface VehicleInfoView {
  id?: string;
  brand?: string;
  model?: string;
  yearModel?: number;
  plate?: string;
  color?: string;
  vehicleType?: string;
}

export interface MachineData {
  id: string;
  name: string;
  vehicleType: string; // e.g., "sugar-cane-harvester", "loader-sugar-cane", "truck"
  status: string;
  location: LocationData | null;
  lastUpdate: Date;
  operator: string;
  area: string;
  task: string;
  telemetry: TelemetryData | null;
  deviceMessage: DeviceMessage | null;
  deviceState: DeviceState | null;
  vehicleInfo: VehicleInfoView | null;
}

// Keep legacy interface name for backward compatibility
export interface MachineLocation extends LocationData {}

export interface MachineAlert {
  id: string;
  machineId: string;
  type: 'warning' | 'error' | 'maintenance';
  message: string;
  timestamp: Date;
  resolved: boolean;
}