# API Services Architecture

## 📁 Estrutura

```
src/services/api/
├── apiClient.ts          # Cliente HTTP base
├── machineService.ts     # Serviço de máquinas
└── README.md            # Esta documentação
```

## 🔧 Modo Mock vs API Real

A aplicação suporta dois modos de operação controlados pela variável de ambiente `VITE_MOCK_ENABLED`:

### **Desenvolvimento (default: MOCK)**
```bash
npm run dev
# Usa dados mock automaticamente
```

### **Produção (default: API REAL)**
```bash
npm run build
# Usa API real automaticamente
```

### **Forçar modo específico**
Crie um arquivo `.env` na raiz:

```env
# Usar mock em desenvolvimento
VITE_MOCK_ENABLED=true

# Ou usar API real em desenvolvimento
VITE_MOCK_ENABLED=false
```

## 📝 Como Usar

### Buscar Máquinas
```typescript
import { machineService } from '@/services/api/machineService';

const machines = await machineService.getMachines();
```

### Buscar Máquina Específica
```typescript
const machine = await machineService.getMachineById('COL-001');
```

### Atualizar Máquina
```typescript
const updated = await machineService.updateMachine('COL-001', {
  status: 'maintenance',
  fuel: 45
});
```

## ➕ Adicionar Novos Endpoints

### 1. Criar novo serviço (ex: `alertService.ts`)
```typescript
import { MachineAlert } from '@/types/machine';
import { apiClient } from './apiClient';
import { mockAlerts } from '@/data/mockAlerts'; // criar mock data

const isMockEnabled = import.meta.env.VITE_MOCK_ENABLED === 'true';

export class AlertService {
  async getAlerts(): Promise<MachineAlert[]> {
    if (isMockEnabled) {
      console.log('🔧 Using MOCK data for alerts');
      return mockAlerts;
    }

    console.log('🌐 Fetching alerts from REAL API');
    return apiClient.get<MachineAlert[]>('/alerts');
  }
}

export const alertService = new AlertService();
```

### 2. Usar no componente
```typescript
import { alertService } from '@/services/api/alertService';

const alerts = await alertService.getAlerts();
```

## 🎯 Benefícios

- ✅ **Desacoplado**: View não conhece detalhes de implementação
- ✅ **Testável**: Fácil alternar entre mock e API real
- ✅ **Escalável**: Adicionar novos endpoints é simples
- ✅ **Type-safe**: TypeScript garante tipos corretos
- ✅ **Reutilizável**: Serviços podem ser usados em qualquer componente
