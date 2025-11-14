import { useState, useMemo, useEffect } from "react";
import { X, Search, MapPin, Gauge, Fuel, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MachineData } from "@/types/machine";
import { machineDataAdapter } from "@/utils/machineDataAdapter";
import MachineIcon from "@/components/MachineIcons"; // <-- 1. IMPORTADO AQUI

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
  initialFilter,
}: MachineStatusPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
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
    return machines.filter(
      (machine) =>
        machineDataAdapter.getName(machine).toLowerCase().includes(query) ||
        machineDataAdapter.getType(machine).toLowerCase().includes(query) ||
        machineDataAdapter.getOperator(machine).toLowerCase().includes(query) ||
        machineDataAdapter.getArea(machine).toLowerCase().includes(query)
    );
  }, [machines, searchQuery]);

  // Categorizar máquinas
  const categorizedMachines = useMemo(() => {
    const categories = {
      green: [] as MachineData[], // Trabalhando
      yellow: [] as MachineData[], // Manobrando
      blue: [] as MachineData[], // Deslocando
      red: [] as MachineData[], // Parado
      gray: [] as MachineData[], // Sem sinal
    };

    filteredMachines.forEach((machine) => {
      const statusColor = machineDataAdapter.getStatusColor(machine);

      // Apply status filter if set
      if (statusFilter && statusColor !== statusFilter) {
        return;
      }

      categories[statusColor as keyof typeof categories].push(machine);
    });

    return categories;
  }, [filteredMachines, statusFilter]);

  const getStatusLabel = (color: string) => {
    const labels: Record<string, string> = {
      green: "Trabalhando",
      yellow: "Manobrando",
      blue: "Deslocando",
      red: "Parado",
      gray: "Sem Sinal",
    };
    return labels[color] || color;
  };

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      green: "text-green-500",
      yellow: "text-yellow-500",
      blue: "text-blue-500",
      red: "text-red-500",
      gray: "text-gray-500",
    };
    return colors[color] || "text-gray-500";
  };

  const getStatusBgColor = (color: string) => {
    const colors: Record<string, string> = {
      green: "bg-green-500/10 border-green-500/20",
      yellow: "bg-yellow-500/10 border-yellow-500/20",
      blue: "bg-blue-500/10 border-blue-500/20",
      red: "bg-red-500/10 border-red-500/20",
      gray: "bg-gray-500/10 border-gray-500/20",
    };
    return colors[color] || "bg-gray-500/10 border-gray-500/20";
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMachineCard = (machine: MachineData) => {
    const statusColor = machineDataAdapter.getStatusColor(machine);
    const statusTooltip = machineDataAdapter.getStatusTooltip(machine);
    const machineId = machineDataAdapter.getId(machine);
    const machineName = machineDataAdapter.getName(machine);
    const operator = machineDataAdapter.getOperator(machine);
    const area = machineDataAdapter.getArea(machine);
    const lastUpdate = machineDataAdapter.getLastUpdate(machine);

    return (
      <Card
        key={machineId}
        className={`mb-3 border ${getStatusBgColor(
          statusColor
        )} hover:shadow-md transition-shadow`}
      >
        <CardContent className="p-4">
          {/* MODIFICADO AQUI: Wrapper Flex Adicionado */}
          <div className="flex gap-3">
            
            {/* 2. Ícone adicionado */}
            <div className="flex-shrink-0">
              <MachineIcon
                icon={machineDataAdapter.getIcon(machine)}
                size={36}
              />
            </div>

            {/* 3. Conteúdo agrupado */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-base">{machineName}</h4>
                  {/* 4. TIPO REMOVIDO DAQUI */}
                </div>
                <Badge
                  variant="secondary"
                  className={`bg-muted ${getStatusColor(statusColor)}`}
                >
                  {statusTooltip}
                </Badge>
              </div>

              <TooltipProvider>
                <div className="space-y-3 text-sm mb-3">
                  {/* Telemetry data in one line */}
                  <div className="flex items-center justify-between gap-2 py-2 px-3 bg-muted/30 rounded-md">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-help">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {machineDataAdapter.getSpeed(machine).toFixed(1)} km/h
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Velocidade atual do veículo</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-help">
                          <Gauge className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {machineDataAdapter.getRpm(machine).toFixed(0)} RPM
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rotações por minuto do motor</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-help">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {machineDataAdapter
                              .getOperationHours(machine)
                              .toFixed(1)}
                            h
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Horas de operação acumuladas</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {operator && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-help">
                          <span className="text-muted-foreground">Operador:</span>
                          <span className="font-medium">{operator}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Operador responsável pela máquina</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {area && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-help">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{area}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Área de operação atual</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2 cursor-help">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Atualizado: {formatTime(lastUpdate)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Horário da última atualização dos dados</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onViewMachine(machineId)}
              >
                Ver no Mapa
              </Button>
            </div>
            {/* Fim do conteúdo agrupado */}
          </div>
          {/* Fim do Wrapper Flex */}
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
          {machines.map((machine) => renderMachineCard(machine))}
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
            <h2 className="text-xl font-bold">Status atual das Máquinas</h2>
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
                  {searchQuery
                    ? "Nenhuma máquina encontrada"
                    : "Nenhuma máquina disponível"}
                </p>
              </div>
            ) : (
              <>
                {renderCategory("green", categorizedMachines.green)}
                {renderCategory("blue", categorizedMachines.blue)}
                {renderCategory("yellow", categorizedMachines.yellow)}
                {renderCategory("red", categorizedMachines.red)}
                {renderCategory("gray", categorizedMachines.gray)}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MachineStatusPanel;