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

export interface NotationData {
  code: string;
  name: string;
  localRegistrationTime?: Date | string;
}

export interface TelemetryData {
  speed?: number;
  odometer?: number;
  fuelLevel?: number;
  engineTemp?: number;
  operationHours?: number;
  operationHoursUpdatedTime?: Date | string;
  notation?: NotationData;
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

export interface TripJourneyData {
  hourmeterIgnition: number;
  hourmeterWorked: number;
  hourmeterIgnitionFormatted: string;
  hourmeterWorkedFormatted: string;
  hourmeterTotalFormatted: string;
  fuelConsumption: number;
  applicationTotal: number;
  area: number;
  odometer: number;
  journeyStartsAt: string | null;
}

export interface MachineAlertData {
  id: string;
  alertType: number;
  reachedValue: number | null;
  timeSpanExceeded: string | null;
  configuredMaxValue: number | null;
  configuredMinValue: number | null;
  startDateTime: string;
  endDateTime: string;
  machineId: string;
  usedMessagesIds: string[];
  flagWhatsAppNotified: boolean;
  flagAppNotified: boolean;
  whatsAppNotificationCount: number | null;
  isInvalid: boolean | null;
  customAlertReason: string | null;
  customAlertDetails: string | null;
  messageReason: string;
  messageDetails: string;
  isRead: boolean;
}

export interface MachineData {
  vehicleInfo: VehicleInfoView;
  telemetry: TelemetryData;
  deviceMessage: DeviceMessage;
  deviceState: DeviceState;
  tripJourney: TripJourneyData;
  alerts: MachineAlertData[];
  icon: string;
}

export interface MachineLocation extends LocationData {}