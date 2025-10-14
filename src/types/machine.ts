export interface MachineLocation {
  latitude: number;
  longitude: number;
}

export interface MachineData {
  id: string;
  name: string;
  type: string; // e.g., "sugar-cane-harvester", "loader-sugar-cane", "truck"
  direction?: number; // degrees (0-360)
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  location: MachineLocation;
  speed: number; // km/h
  fuel: number; // percentage
  operationHours: number;
  lastUpdate: Date;
  operator?: string;
  area?: string;
  task?: string;
  // Telemetry data
  telemetry: {
    engineTemp: number;
    oilPressure: number;
    hydraulicPressure: number;
    batteryVoltage: number;
    workingWidth?: number; // meters
    seedLevel?: number; // percentage
    fertilizerLevel?: number; // percentage
  };
  // Device message data for status determination
  deviceMessage?: {
    hasLostConnection?: boolean;
    transmissionReason?: string;
    flag?: {
      working?: boolean;
      dislocating?: boolean;
      maneuvering?: boolean;
      idling?: boolean;
      ignition?: boolean;
    };
    gps?: {
      heading?: number; // degrees (0-360)
    };
  };
}

export interface MachineAlert {
  id: string;
  machineId: string;
  type: 'warning' | 'error' | 'maintenance';
  message: string;
  timestamp: Date;
  resolved: boolean;
}