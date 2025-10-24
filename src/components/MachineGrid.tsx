import { useState } from 'react';
import { MachineData, DeviceState } from '@/types/machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, X, Fuel, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { machineDataAdapter } from '@/utils/machineDataAdapter';

interface MachineGridProps {
  machines: MachineData[];
  isOpen: boolean;
  onClose: () => void;
  onMachineSelect: (machineId: string) => void;
  selectedMachine?: string;
}

const MachineGrid = ({ machines, isOpen, onClose, onMachineSelect, selectedMachine }: MachineGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceState['status'] | 'all'>('all');

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.vehicleInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          machineDataAdapter.getType(machine).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.deviceState.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Agrupar máquinas por frente de colheita
  const groupedMachines = filteredMachines.reduce((groups, machine) => {
    const area = machine.deviceMessage.area || 'Sem Frente';
    if (!groups[area]) {
      groups[area] = [];
    }
    groups[area].push(machine);
    return groups;
  }, {} as Record<string, MachineData[]>);

  // Calcular estatísticas por grupo
  const getGroupStats = (machines: MachineData[]) => {
    const total = machines.length;
    const productiveMachines = machines.filter(m => m.deviceState.status === 'active');
    const nonproductiveMachines = machines.filter(m => m.deviceState.status !== 'active');
    
    const avgProductiveHours = productiveMachines.length > 0 
      ? Math.round(productiveMachines.reduce((sum, m) => sum + machineDataAdapter.getOperationHours(m), 0) / productiveMachines.length)
      : 0;
    
    const avgNonproductiveHours = nonproductiveMachines.length > 0
      ? Math.round(nonproductiveMachines.reduce((sum, m) => sum + machineDataAdapter.getOperationHours(m), 0) / nonproductiveMachines.length)
      : 0;
    
    return {
      total,
      avgProductiveHours,
      avgNonproductiveHours
    };
  };

  const getAreaDisplayName = (area: string) => {
    return area;
  };

  const getStatusBadgeVariant = (status: DeviceState['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'idle':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      case 'offline':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: DeviceState['status']) => {
    switch (status) {
      case 'active':
        return 'text-status-active';
      case 'idle':
        return 'text-status-idle';
      case 'maintenance':
        return 'text-status-maintenance';
      case 'offline':
        return 'text-status-offline';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-50 animate-slide-up">
      <Card className="bg-gradient-overlay border-border/50 shadow-overlay backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Grid className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Máquinas Agrícolas ({filteredMachines.length})
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DeviceState['status'] | 'all')}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="idle">Parado</option>
                <option value="maintenance">Manutenção</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Groups */}
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {Object.entries(groupedMachines).map(([area, groupMachines]) => {
              const stats = getGroupStats(groupMachines);
              return (
                <div key={area} className="space-y-3">
                  {/* Group Header */}
                  <div className="bg-card/50 border border-border/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {getAreaDisplayName(area)}
                      </h3>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-status-active font-semibold text-base">{stats.avgProductiveHours}h</p>
                          <p className="text-muted-foreground text-xs">Média Produtiva</p>
                        </div>
                        <div className="text-center">
                          <p className="text-status-idle font-semibold text-base">{stats.avgNonproductiveHours}h</p>
                          <p className="text-muted-foreground text-xs">Média Improdutiva</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {stats.total} {stats.total === 1 ? 'máquina' : 'máquinas'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Group Machines Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupMachines.map((machine) => (
                      <Card
                        key={machine.vehicleInfo.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                          selectedMachine === machine.vehicleInfo.id && "ring-2 ring-primary shadow-glow"
                        )}
                        onClick={() => onMachineSelect(machine.vehicleInfo.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-sm text-card-foreground">{machine.vehicleInfo.name}</h3>
                              <p className="text-xs text-muted-foreground capitalize">{machineDataAdapter.getType(machine)}</p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(machine.deviceState.status)} className="text-xs">
                              {machine.deviceState.status}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Localização</span>
                              </div>
                              <span className="text-card-foreground">
                                {machine.deviceMessage.gps.latitude.toFixed(4)}, {machine.deviceMessage.gps.longitude.toFixed(4)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1">
                                <Fuel className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Combustível</span>
                              </div>
                              <span className={cn(
                                "font-medium",
                                machineDataAdapter.getFuel(machine) < 20 ? "text-warning" : "text-card-foreground"
                              )}>
                                {machineDataAdapter.getFuel(machine)}%
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Velocidade</span>
                              </div>
                              <span className={cn("font-medium", getStatusColor(machine.deviceState.status))}>
                                {machineDataAdapter.getSpeed(machine)} km/h
                              </span>
                            </div>
                          </div>

                          {machine.deviceMessage.operator && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground">
                                Operador: <span className="text-card-foreground">{machine.deviceMessage.operator}</span>
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {Object.keys(groupedMachines).length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma máquina encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineGrid;