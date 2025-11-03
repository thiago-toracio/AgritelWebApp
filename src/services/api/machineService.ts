import { MachineData } from '@/types/machine';
import { mockMachines } from '@/data/mockMachines';
import { apiClient } from './apiClient';

/**
 * Machine Service
 * Handles fetching machine data from either mock or real API
 * based on VITE_MOCK_DISABLED environment variable
 */

const isMockEnabled = import.meta.env.VITE_MOCK_DISABLED == 'false';

console.log('🔍 VITE_MOCK_DISABLED value:', import.meta.env.VITE_MOCK_DISABLED);
console.log('🔍 Mode:', import.meta.env.MODE);

export class MachineService {
  async getMachines(startTime?: string): Promise<MachineData[]> {
    if (isMockEnabled) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockMachines;
    }

    console.log('🌐 Fetching machines from REAL API');
    const params = startTime ? `?startAt=${encodeURIComponent(startTime)}` : '';
    return apiClient.get<MachineData[]>(`/machines${params}`);
  }

  /**
   * Fetch a single machine by ID
   */
  async getMachineById(id: string): Promise<MachineData | null> {
    if (isMockEnabled) {
      console.log(`🔧 Using MOCK data for machine ${id}`);
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockMachines.find(m => m.vehicleInfo.id === id) || null;
    }

    console.log(`🌐 Fetching machine ${id} from REAL API`);
    return apiClient.get<MachineData>(`/machines/${id}`);
  }

  /**
   * Update machine data
   */
  async updateMachine(id: string, data: Partial<MachineData>): Promise<MachineData> {
    if (isMockEnabled) {
      console.log(`🔧 MOCK: Would update machine ${id}`, data);
      await new Promise(resolve => setTimeout(resolve, 300));
      const machine = mockMachines.find(m => m.vehicleInfo.id === id);
      if (!machine) {
        throw new Error(`Machine ${id} not found`);
      }
      return { ...machine, ...data };
    }

    console.log(`🌐 Updating machine ${id} via REAL API`);
    return apiClient.put<MachineData>(`/machines/${id}`, data);
  }
}

export const machineService = new MachineService();