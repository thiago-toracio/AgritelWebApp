import { MachineData } from '@/types/machine';

export type MachineStatusColor = 'gray' | 'green' | 'blue' | 'yellow' | 'red';

export interface MachineStatus {
  color: MachineStatusColor;
  label: string;
}

export const getMachineStatus = (machine: MachineData): MachineStatus => {
  const dm = machine.deviceMessage;

  if (!dm) {
    return { color: 'gray', label: 'Sem sinal - Estado indefinido' };
  }

  // Cinza (Sem sinal - Estado indefinido)
  if (dm.hasLostConnection || dm.transmissionReason === 'GALILEO_HEAD_PACK_EVENT') {
    return { color: 'gray', label: 'Sem sinal - Estado indefinido' };
  }

  // Verde (Trabalhando)
  if (dm.flag?.working) {
    return { color: 'green', label: 'Trabalhando' };
  }

  // Azul (Deslocando)
  if (dm.flag?.dislocating) {
    return { color: 'blue', label: 'Deslocando' };
  }

  // Amarelo (Manobra)
  if (dm.flag?.maneuvering) {
    return { color: 'yellow', label: 'Manobra' };
  }

  // Vermelho - Parado Desligado tem prioridade sobre Parado
  if (dm.flag?.ignition === false) {
    return { color: 'red', label: 'Parado Desligado' };
  }

  // Vermelho (Parado)
  if (dm.flag?.idling) {
    return { color: 'red', label: 'Parado' };
  }

  // Default: gray se nenhuma condição for atendida
  return { color: 'gray', label: 'Sem sinal - Estado indefinido' };
};
