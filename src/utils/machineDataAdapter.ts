import { MachineData, LocationData } from '@/types/machine';

/**
 * Adapter para acessar dados de máquina com compatibilidade entre estruturas antiga e nova
 */
export const machineDataAdapter = {
  /**
   * Obtém o ID da máquina
   */
  getId: (machine: MachineData): string => {
    return machine.vehicleInfo?.id ?? '';
  },

  /**
   * Obtém o nome da máquina
   */
  getName: (machine: MachineData): string => {
    return machine.vehicleInfo?.name ?? '';
  },

  /**
   * Obtém o tipo de veículo
   */
  getType: (machine: MachineData): string => {
    return machine.vehicleInfo?.vehicleType ?? 'truck';
  },

  /**
   * Obtém o ícone completo (ex: "sugar-cane-harvester-green.svg")
   */
  getIcon: (machine: MachineData): string => {
    return machine.icon || 'truck-gray.svg';
  },

  /**
   * Obtém a velocidade
   */
  getSpeed: (machine: MachineData): number => {
    return machine.telemetry?.speed ?? 0;
  },

  /**
   * Obtém o nível de combustível (porcentagem)
   */
  getFuel: (machine: MachineData): number => {
    return machine.telemetry?.fuelLevel ?? 0;
  },

  /**
   * Obtém as horas de operação
   */
  getOperationHours: (machine: MachineData): number => {
    return machine.telemetry?.operationHours ?? 0;
  },

  /**
   * Obtém o heading/direção
   */
  getHeading: (machine: MachineData): number => {
    return machine.deviceMessage?.gps?.heading ?? 0;
  },

  /**
   * Obtém a latitude
   */
  getLatitude: (machine: MachineData): number => {
    return machine.deviceMessage?.gps?.locationData?.latitude 
        ?? machine.deviceMessage?.gps?.latitude 
        ?? 0;
  },

  /**
   * Obtém a longitude
   */
  getLongitude: (machine: MachineData): number => {
    return machine.deviceMessage?.gps?.locationData?.longitude 
        ?? machine.deviceMessage?.gps?.longitude 
        ?? 0;
  },

  /**
   * Obtém a localização completa
   */
  getLocation: (machine: MachineData): LocationData | null => {
    if (machine.deviceMessage?.gps?.locationData) {
      return machine.deviceMessage.gps.locationData;
    }
    const lat = machine.deviceMessage?.gps?.latitude ?? 0;
    const lng = machine.deviceMessage?.gps?.longitude ?? 0;
    if (lat !== 0 || lng !== 0) {
      return { latitude: lat, longitude: lng };
    }
    return null;
  },

  /**
   * Obtém a última atualização
   */
  getLastUpdate: (machine: MachineData): Date => {
    const lastUpdate = machine.deviceMessage?.lastUpdate;
    return lastUpdate ? new Date(lastUpdate) : new Date();
  },

  /**
   * Obtém o operador
   */
  getOperator: (machine: MachineData): string => {
    return machine.deviceMessage?.operator ?? '';
  },

  /**
   * Obtém a área
   */
  getArea: (machine: MachineData): string => {
    return machine.deviceMessage?.area ?? '';
  },

  /**
   * Obtém a tarefa
   */
  getTask: (machine: MachineData): string => {
    return machine.deviceMessage?.task ?? '';
  },

  /**
   * Obtém o status
   */
  getStatus: (machine: MachineData): string => {
    return machine.deviceState?.status ?? 'unknown';
  },

  /**
   * Obtém a cor do status
   */
  getStatusColor: (machine: MachineData): string => {
    return machine.deviceState?.color ?? 'gray';
  },

  /**
   * Obtém o tooltip do status
   */
  getStatusTooltip: (machine: MachineData): string => {
    return machine.deviceState?.tooltip ?? 'Estado desconhecido';
  },

  /**
   * Verifica se a ignição está ligada
   */
  getIgnition: (machine: MachineData): boolean => {
    return machine.deviceMessage?.flag?.ignition ?? false;
  },

  /**
   * Obtém os dados de notação
   */
  getNotation: (machine: MachineData) => {
    return machine.telemetry?.notation;
  }
};