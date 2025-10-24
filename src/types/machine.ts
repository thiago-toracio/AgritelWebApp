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

export interface DeviceState {
  color: string;
  tooltip: string;
  status: string;
}

export interface TelemetryData {
  speed?: number;
  odometer?: number;
  fuelLevel?: number;
  engineTemp?: number;
  operationHours?: number;
  operationHoursUpdatedTime?: Date | string;
}

export interface VehicleInfoView {
  id: string;
  name: string;
  brand: string;
  model: string;
  yearModel?: number
  plate: string;
  color: string;
  vehicleType: string;
}

export interface GpsData {
  heading: number;
  latitude: number;
  longitude: number;
  direction: number;
  locationData: LocationData;
}

export interface DeviceMessage {
  lastUpdate: Date | string;
  hasLostConnection: boolean;
  transmissionReason: string;
  flag: DeviceFlags;
  gps: GpsData;
  operator: string; 
  area: string; 
  task: string;
}

export interface MachineData {
  vehicleInfo: VehicleInfoView;
  telemetry: TelemetryData;
  deviceMessage: DeviceMessage;
  deviceState: DeviceState;
  icon: string;
}

export interface MachineLocation extends LocationData {}

export interface MachineAlert {
  id: string;
  machineId: string;
  type: 'warning' | 'error' | 'maintenance';
  message: string;
  timestamp: Date;
  resolved: boolean;
}