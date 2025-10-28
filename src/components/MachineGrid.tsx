import { useState } from 'react';
import { MachineData, DeviceState } from '@/types/machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Search, Filter, Grid, X, Fuel, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { machineDataAdapter } from '@/utils/machineDataAdapter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MachineGridProps {
  machines: MachineData[];
  isOpen: boolean;
  onClose: () => void;
  onMachineSelect: (machineId: string) => void;
  selectedMachine?: string;
}

const MachineGrid = ({ machines, isOpen, onClose, onMachineSelect, selectedMachine }: MachineGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.vehicleInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          machineDataAdapter.getType(machine).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map status filter to device state status
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const statusMap: Record<string, string> = {
        'active': 'active',
        'moving': 'active',
        'maneuvering': 'active',
        'idle': 'idle',
        'offline': 'offline'
      };
      
      // Filter by tooltip instead of status
      const tooltipMap: Record<string, string> = {
        'active': 'Trabalhando',
        'moving': 'Deslocando',
        'maneuvering': 'Manobrando',
        'idle': 'Parado',
        'offline': 'Sem Sinal'
      };
      
      matchesStatus = machine.deviceState.tooltip === tooltipMap[statusFilter];
    }
    
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

  const getStatusBadgeVariant = (color: string) => {
    switch (color) {
      case 'green':
        return 'default';
      case 'blue':
        return 'secondary';
      case 'yellow':
        return 'secondary';
      case 'red':
        return 'destructive';
      case 'gray':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-status-active';
      case 'blue':
        return 'text-status-moving';
      case 'yellow':
        return 'text-status-maneuvering';
      case 'red':
        return 'text-status-idle';
      case 'gray':
        return 'text-status-offline';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBgClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-status-active/10 border-status-active/30';
      case 'blue':
        return 'bg-status-moving/10 border-status-moving/30';
      case 'yellow':
        return 'bg-status-maneuvering/10 border-status-maneuvering/30';
      case 'red':
        return 'bg-status-idle/10 border-status-idle/30';
      case 'gray':
        return 'bg-status-offline/10 border-status-offline/30';
      default:
        return '';
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
                <option value="active">Trabalhando</option>
                <option value="moving">Deslocando</option>
                <option value="maneuvering">Manobrando</option>
                <option value="idle">Parado</option>
                <option value="offline">Sem Sinal</option>
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
                      <HoverCard key={machine.vehicleInfo.id}>
                        <HoverCardTrigger asChild>
                          <Card
                            className={cn(
                              "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
                              getStatusBgClass(machine.deviceState.color),
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
                            <Badge variant={getStatusBadgeVariant(machine.deviceState.color)} className="text-xs">
                              {machine.deviceState.tooltip}
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
                              <span className={cn("font-medium", getStatusColor(machine.deviceState.color))}>
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
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">{machine.vehicleInfo.name}</h4>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <span className={getStatusColor(machine.deviceState.color)}>{machine.deviceState.tooltip}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Atualizado em:</span>
                                <span className="text-card-foreground">
                                  {format(new Date(machine.deviceMessage.lastUpdate), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
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