import { MachineData } from '@/types/machine';
import { mockMachines } from '@/data/mockMachines';
import { apiClient } from './apiClient';

/**
 * Machine Service
 * Handles fetching machine data from either mock or real API
 * based on VITE_MOCK_ENABLED environment variable
 */

const isMockEnabled = import.meta.env.VITE_MOCK_ENABLED === 'true';

console.log('🔍 VITE_MOCK_ENABLED value:', import.meta.env.VITE_MOCK_ENABLED);
console.log('🔍 isMockEnabled:', isMockEnabled);
console.log('🔍 Mode:', import.meta.env.MODE);

export class MachineService {
  /**
   * Fetch all machines
   * Returns mock data if VITE_MOCK_ENABLED=true, otherwise calls real API
   */
  async getMachines(): Promise<MachineData[]> {
    if (isMockEnabled) {
      console.log('🔧 Using MOCK data for machines');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockMachines;
    }

    console.log('🌐 Fetching machines from REAL API');
    return apiClient.get<MachineData[]>('/machines');
  }

  /**
   * Fetch a single machine by ID
   */
  async getMachineById(id: string): Promise<MachineData | null> {
    if (isMockEnabled) {
      console.log(`🔧 Using MOCK data for machine ${id}`);
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockMachines.find(m => m.id === id) || null;
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
      const machine = mockMachines.find(m => m.id === id);
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
