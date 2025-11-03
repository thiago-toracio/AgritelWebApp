import { useState } from 'react';
import { MachineData, DeviceState } from '@/types/machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, X, Fuel, Clock, MapPin, Calendar, Gauge, Grid as GridIcon, Droplets, User, ChevronDown, ChevronUp, Maximize2, Minimize2, Timer, Settings, Grid3x3, Route, FileText } from 'lucide-react';
import MachineIcon from '@/components/MachineIcons';
import { cn } from '@/lib/utils';
import { machineDataAdapter } from '@/utils/machineDataAdapter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MachineGridProps {
  machines: MachineData[];
  isOpen: boolean;
  onClose: () => void;
  onMachineSelect: (machineId: string) => void;
  selectedMachine?: string;
  journeyStartTime?: string;
}

const MachineGrid = ({ machines, isOpen, onClose, onMachineSelect, selectedMachine, journeyStartTime }: MachineGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({});

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.vehicleInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          machineDataAdapter.getType(machine).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (machine.deviceMessage.operator && machine.deviceMessage.operator.toLowerCase().includes(searchTerm.toLowerCase()));
    
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

  const toggleArea = (area: string) => {
    setExpandedAreas(prev => ({
      ...prev,
      [area]: !prev[area]
    }));
  };

  const expandAll = () => {
    const allAreas = Object.keys(groupedMachines).reduce((acc, area) => {
      acc[area] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedAreas(allAreas);
  };

  const collapseAll = () => {
    setExpandedAreas({});
  };

  const areAllExpanded = Object.keys(groupedMachines).length > 0 && 
    Object.keys(groupedMachines).every(area => expandedAreas[area]);

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
                placeholder="Buscar por nome, tipo ou motorista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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

          {/* Expand/Collapse All Controls */}
          {Object.keys(groupedMachines).length > 0 && (
            <div className="flex justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={areAllExpanded ? collapseAll : expandAll}
                className="text-xs"
              >
                {areAllExpanded ? (
                  <>
                    <Minimize2 className="w-3 h-3 mr-1" />
                    Colapsar Todas
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3 mr-1" />
                    Expandir Todas
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Groups */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedMachines).map(([area, groupMachines]) => {
              const stats = getGroupStats(groupMachines);
              return (
                <div key={area} className="space-y-2">
                  {/* Group Header */}
                  <div 
                    className="bg-card/50 border border-border/30 rounded-lg p-4 cursor-pointer hover:bg-card/70 transition-colors"
                    onClick={() => toggleArea(area)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-card-foreground">
                          {getAreaDisplayName(area)}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {stats.total} {stats.total === 1 ? 'máquina' : 'máquinas'}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedAreas[area] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Group Machines Grid */}
                  {expandedAreas[area] && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {groupMachines.map((machine) => (
                      <Card
                        key={machine.vehicleInfo.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-lg border-2 w-full",
                          getStatusBgClass(machine.deviceState.color),
                          selectedMachine === machine.vehicleInfo.id && "ring-2 ring-primary shadow-glow"
                        )}
                        onClick={() => onMachineSelect(machine.vehicleInfo.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-2 flex-1">
                              <div className="flex-shrink-0 mt-0.5">
                                <MachineIcon 
                                  icon={machineDataAdapter.getIcon(machine)}
                                  size={32}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-card-foreground truncate">{machine.vehicleInfo.name}</h3>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant={getStatusBadgeVariant(machine.deviceState.color)} className="text-xs flex-shrink-0">
                                {machine.deviceState.tooltip}
                              </Badge>
                              {machine.deviceMessage.lastUpdate && (
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(machine.deviceMessage.lastUpdate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {machineDataAdapter.getNotation(machine)?.localRegistrationTime && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">Apontamento {machine.deviceMessage.area ? `${machine.deviceMessage.area} às ` : 'às '}</span>
                                <span className="text-card-foreground font-medium">
                                  {format(new Date(machineDataAdapter.getNotation(machine)!.localRegistrationTime!), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            )}

                            {machine.deviceMessage.operator && (
                              <div className="flex items-center space-x-1.5 text-xs">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <span className="text-card-foreground">{machine.deviceMessage.operator}</span>
                              </div>
                            )}

                            {machineDataAdapter.getNotation(machine) && (
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-card-foreground font-medium truncate">
                                  {machineDataAdapter.getNotation(machine)?.code}
                                </span>
                                <span className="text-xs text-muted-foreground">-</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {machineDataAdapter.getNotation(machine)?.name}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex justify-between items-center mb-2 bg-primary px-3 py-2 rounded-md -mx-2">
                              <span className="text-[10px] text-primary-foreground uppercase tracking-wide font-semibold">Jornada</span>
                              {journeyStartTime && (
                                <span className="text-[10px] text-primary-foreground font-medium">
                                  {format(new Date(journeyStartTime), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </span>
                              )}
                            </div>
                            <TooltipProvider>
                              <div className="grid grid-cols-5 gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center cursor-help">
                                      <Timer className="w-4 h-4 text-muted-foreground mb-1" />
                                      <span className="text-[11px] font-medium text-card-foreground">
                                        {machine.tripJourney.hourmeterTotalFormatted || '0:00'}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Tempo ligado (aproximadamente)</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center cursor-help">
                                      <Settings className="w-4 h-4 text-muted-foreground mb-1" />
                                      <span className="text-[11px] font-medium text-card-foreground">
                                        {machine.tripJourney.hourmeterWorkedFormatted || '0:00'}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Tempo de trabalho (aproximadamente)</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center cursor-help">
                                      <Grid3x3 className="w-4 h-4 text-muted-foreground mb-1" />
                                      <span className="text-[11px] font-medium text-card-foreground">
                                        {machine.tripJourney.area.toFixed(2)} ha
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Área aplicada em hectares</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center cursor-help">
                                      <Droplets className="w-4 h-4 text-muted-foreground mb-1" />
                                      <span className="text-[11px] font-medium text-card-foreground">
                                        {machine.tripJourney.fuelConsumption.toFixed(1)}L
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Combustível em litros</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center cursor-help">
                                      <Route className="w-4 h-4 text-muted-foreground mb-1" />
                                      <span className="text-[11px] font-medium text-card-foreground">
                                        {machine.tripJourney.odometer.toFixed(1)} km
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Distância percorrida</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    </div>
                  )}
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