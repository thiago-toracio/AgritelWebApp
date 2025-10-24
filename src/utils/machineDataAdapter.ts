import { MachineData } from '@/types/machine';

/**
 * Adapter para acessar dados de máquina com compatibilidade entre estruturas antiga e nova
 */
export const machineDataAdapter = {
  /**
   * Obtém o tipo de veículo
   */
  getType: (machine: MachineData): string => {
    return machine.vehicleType || 'truck';
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
    return machine.location?.latitude ?? 0;
  },

  /**
   * Obtém a longitude
   */
  getLongitude: (machine: MachineData): number => {
    return machine.location?.longitude ?? 0;
  },

  /**
   * Obtém o status visual (color)
   */
  getStatusColor: (machine: MachineData): string => {
    return machine.deviceState?.color ?? 'gray';
  },

  /**
   * Obtém o tooltip do status
   */
  getStatusTooltip: (machine: MachineData): string => {
    return machine.deviceState?.tooltip ?? 'Estado desconhecido';
  }
};
