import { useState, useMemo, useEffect } from 'react';
import { X, Search, MapPin, Gauge, Fuel, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MachineData } from '@/types/machine';
import { getMachineStatus } from '@/utils/machineStatus';

interface MachineStatusPanelProps {
  machines: MachineData[];
  isOpen: boolean;
  onClose: () => void;
  onViewMachine: (machineId: string) => void;
  initialFilter?: string;
}

const MachineStatusPanel = ({ 
  machines, 
  isOpen, 
  onClose,
  onViewMachine,
  initialFilter
}: MachineStatusPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Update filter when initialFilter changes
  useEffect(() => {
    if (isOpen && initialFilter) {
      setStatusFilter(initialFilter);
    } else if (!isOpen) {
      setStatusFilter(null);
    }
  }, [isOpen, initialFilter]);

  // Filtrar máquinas por busca
  const filteredMachines = useMemo(() => {
    if (!searchQuery.trim()) return machines;
    
    const query = searchQuery.toLowerCase();
    return machines.filter(machine => 
      machine.name.toLowerCase().includes(query) ||
      machine.type.toLowerCase().includes(query) ||
      machine.operator?.toLowerCase().includes(query) ||
      machine.area?.toLowerCase().includes(query)
    );
  }, [machines, searchQuery]);

  // Categorizar máquinas
  const categorizedMachines = useMemo(() => {
    const categories = {
      green: [] as MachineData[],  // Trabalhando
      yellow: [] as MachineData[], // Manobra
      blue: [] as MachineData[],   // Deslocando
      red: [] as MachineData[],    // Parado
      gray: [] as MachineData[]    // Sem sinal
    };

    filteredMachines.forEach(machine => {
      const status = getMachineStatus(machine);
      
      // Apply status filter if set
      if (statusFilter && status.color !== statusFilter) {
        return;
      }
      
      categories[status.color].push(machine);
    });

    return categories;
  }, [filteredMachines, statusFilter]);

  const getStatusLabel = (color: string) => {
    const labels: Record<string, string> = {
      green: 'Trabalhando',
      yellow: 'Manobra',
      blue: 'Deslocando',
      red: 'Parado',
      gray: 'Sem Sinal'
    };
    return labels[color] || color;
  };

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-500',
      yellow: 'text-yellow-500',
      blue: 'text-blue-500',
      red: 'text-red-500',
      gray: 'text-gray-500'
    };
    return colors[color] || 'text-gray-500';
  };

  const getStatusBgColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500/10 border-green-500/20',
      yellow: 'bg-yellow-500/10 border-yellow-500/20',
      blue: 'bg-blue-500/10 border-blue-500/20',
      red: 'bg-red-500/10 border-red-500/20',
      gray: 'bg-gray-500/10 border-gray-500/20'
    };
    return colors[color] || 'bg-gray-500/10 border-gray-500/20';
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMachineCard = (machine: MachineData) => {
    const status = getMachineStatus(machine);
    
    return (
      <Card 
        key={machine.id}
        className={`mb-3 border ${getStatusBgColor(status.color)} hover:shadow-md transition-shadow`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-base">{machine.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">
                {machine.type.replace(/-/g, ' ')}
              </p>
            </div>
            <Badge variant="secondary" className={`bg-muted ${getStatusColor(status.color)}`}>
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span>{machine.speed.toFixed(1)} km/h</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Fuel className="w-4 h-4 text-muted-foreground" />
              <span>{machine.fuel}%</span>
            </div>

            {machine.operator && (
              <div className="flex items-center space-x-2 col-span-2">
                <span className="text-muted-foreground">Operador:</span>
                <span className="font-medium">{machine.operator}</span>
              </div>
            )}

            {machine.area && (
              <div className="flex items-center space-x-2 col-span-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{machine.area}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 col-span-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Atualizado: {formatTime(machine.lastUpdate)}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onViewMachine(machine.id)}
          >
            Ver no Mapa
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderCategory = (color: string, machines: MachineData[]) => {
    if (machines.length === 0) return null;

    return (
      <div key={color} className="mb-6">
        <div className="flex items-center space-x-2 mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
          <h3 className={`font-semibold text-lg ${getStatusColor(color)}`}>
            {getStatusLabel(color)}
          </h3>
          <Badge variant="secondary">{machines.length}</Badge>
        </div>
        
        <div className="space-y-2">
          {machines.map(machine => renderMachineCard(machine))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-background border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold">Status das Máquinas</h2>
            <Badge variant="secondary">{filteredMachines.length}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar and Filters */}
        <div className="p-4 border-b border-border bg-card space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar máquina..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Status Filter Buttons */}
          {statusFilter && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtro:</span>
              <Badge 
                variant="secondary"
                className={`cursor-pointer ${getStatusColor(statusFilter)}`}
              >
                {getStatusLabel(statusFilter)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter(null)}
                className="h-6 px-2 text-xs"
              >
                Limpar filtro
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {filteredMachines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? 'Nenhuma máquina encontrada' : 'Nenhuma máquina disponível'}
                </p>
              </div>
            ) : (
              <>
                {renderCategory('green', categorizedMachines.green)}
                {renderCategory('blue', categorizedMachines.blue)}
                {renderCategory('yellow', categorizedMachines.yellow)}
                {renderCategory('red', categorizedMachines.red)}
                {renderCategory('gray', categorizedMachines.gray)}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MachineStatusPanel;