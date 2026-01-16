import { useState, useEffect, useMemo, useCallback } from "react";
import { MachineData, DeviceState } from "@/types/machine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Grid,
  X,
  Fuel,
  Clock,
  MapPin,
  Calendar,
  Gauge,
  Grid as GridIcon,
  Droplets,
  User,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Timer,
  Settings,
  Grid3x3,
  Route,
  FileText,
  AlertTriangle,
  CornerDownRight,
  StopCircle,
  ArrowRightLeft,
  HelpCircle,
  RefreshCw,
  Activity,
  Boxes,
  MoreHorizontal,
  History,
  TrendingUp,
  Fuel as FuelIcon,
  Wrench,
} from "lucide-react";
import MachineIcon from "@/components/MachineIcons";
import { cn } from "@/lib/utils";
import { machineDataAdapter } from "@/utils/machineDataAdapter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MachineGridProps {
  machines: MachineData[];
  isOpen: boolean;
  onClose: () => void;
  onMachineSelect: (machineId: string) => void;
  selectedMachine?: string;
  journeyStartTime?: string;
  countdown: number;
  onViewHistory: (machine: MachineData) => void;
}

const MachineGrid = ({
  machines,
  isOpen,
  onClose,
  onMachineSelect,
  selectedMachine,
  journeyStartTime,
  countdown,
  onViewHistory,
}: MachineGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.vehicleInfo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      machineDataAdapter
        .getType(machine)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (machine.deviceMessage.operator &&
        machine.deviceMessage.operator
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = machine.deviceState.color === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  // --- ESTADO: Tipo de Agrupamento com Persistência ---
  const [groupBy, setGroupBy] = useState<"area" | "group">(() => {
    // Carrega do localStorage ou define "group" como padrão
    const saved = localStorage.getItem("machineGridGroupBy");
    return saved === "area" || saved === "group" ? saved : "group";
  });

  // Salva a preferência sempre que mudar
  useEffect(() => {
    localStorage.setItem("machineGridGroupBy", groupBy);
  }, [groupBy]);

  // --- LÓGICA DE AGRUPAMENTO ---
  const groupedMachines = useMemo(() => {
    return filteredMachines.reduce((groups, machine) => {
      let key = "";

      if (groupBy === "area") {
        key = machine.deviceMessage.area || "Sem Frente";
      } else {
        // Padrão: Agrupar por Device Group Name
        key = machine.vehicleInfo.deviceGroupName || "Sem Grupo";
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(machine);
      return groups;
    }, {} as Record<string, MachineData[]>);
  }, [filteredMachines, groupBy]);

  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>(
    {}
  );

  // Expande tudo quando o agrupamento muda para facilitar a visualização
  useEffect(() => {
    expandAll();
  }, [groupBy]);

  const getGroupStats = (machines: MachineData[]) => {
    const total = machines.length;
    return {
      total,
    };
  };

  const statusCounts = useMemo(() => {
    const counts = {
      green: 0,
      blue: 0,
      yellow: 0,
      red: 0,
      gray: 0,
    };
    for (const machine of machines) {
      const color = machine.deviceState.color;
      if (color in counts) {
        counts[color as keyof typeof counts]++;
      }
    }
    return counts;
  }, [machines]);

  const unreadAlertsCount = useMemo(() => {
    return machines.reduce((total, machine) => {
      const machineAlerts = machine.alerts.filter(
        (alert) => !alert.isRead
      ).length;
      return total + machineAlerts;
    }, 0);
  }, [machines]);

  const statusDisplayInfo = {
    green: {
      label: "Trabalhando",
      color: "text-status-active",
      Icon: Settings,
    },
    yellow: {
      label: "Manobrando",
      color: "text-status-maneuvering",
      Icon: CornerDownRight,
    },
    red: { label: "Parado", color: "text-status-idle", Icon: StopCircle },
    blue: {
      label: "Deslocando",
      color: "text-status-moving",
      Icon: ArrowRightLeft,
    },
    gray: {
      label: "Sem Sinal",
      color: "text-status-offline",
      Icon: HelpCircle,
    },
  };

  const statusDisplayOrder: (keyof typeof statusDisplayInfo)[] = [
    "green",
    "yellow",
    "red",
    "blue",
    "gray",
  ];

  const getAreaDisplayName = (area: string) => {
    return area;
  };

  const toggleArea = (area: string) => {
    setExpandedAreas((prev) => ({
      ...prev,
      [area]: !prev[area],
    }));
  };

  const expandAll = useCallback(() => {
    const allAreas = Object.keys(groupedMachines).reduce((acc, area) => {
      acc[area] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedAreas(allAreas);
  }, [groupedMachines]);

  const collapseAll = useCallback(() => {
    setExpandedAreas({});
  }, []);

  useEffect(() => {
    if (searchTerm) {
      expandAll();
    }
  }, [searchTerm, expandAll]);

  useEffect(() => {
    expandAll();
  }, [statusFilter]);

  const areAllExpanded =
    Object.keys(groupedMachines).length > 0 &&
    Object.keys(groupedMachines).every((area) => expandedAreas[area]);

  const getStatusBadgeVariant = (color: string) => {
    switch (color) {
      case "green":
        return "default";
      case "blue":
        return "secondary";
      case "yellow":
        return "secondary";
      case "red":
        return "destructive";
      case "gray":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusBgClass = (machine: MachineData) => {
    const color = machine.deviceState.color;

    switch (color) {
      case "green":
        return "bg-status-active/10 border-status-active/30";
      case "blue":
        return "bg-status-moving/10 border-status-moving/30";
      case "yellow":
        return "bg-status-maneuvering/10 border-status-maneuvering/30";
      case "red":
        return "bg-status-idle/10 border-status-idle/30";
      case "gray":
        return "bg-status-offline/10 border-status-offline/30";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-50 animate-slide-up">
      <Card className="bg-gradient-overlay border-border/50 shadow-overlay backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Grid className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Máquinas Agrícolas
              </h2>
              <Badge variant="outline">Total: {machines.length}</Badge>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative cursor-help ml-2">
                      <RefreshCw className="w-5 h-5 text-muted-foreground" />
                      <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none shadow-sm">
                        {countdown}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Próxima atualização em {countdown}s</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex flex-1 items-center justify-center gap-4">
              <TooltipProvider>
                {statusDisplayOrder.map((statusKey) => {
                  const count = statusCounts[statusKey];
                  const info = statusDisplayInfo[statusKey];
                  return (
                    <Tooltip key={statusKey}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-1.5 cursor-help">
                          <info.Icon className={cn("w-5 h-5", info.color)} />
                          <span
                            className={cn("text-sm font-semibold", info.color)}
                          >
                            {count}
                          </span>
                          <span className="text-sm text-card-foreground">
                            {info.label}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {count} {info.label}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1.5 cursor-help">
                      <AlertTriangle
                        className={cn(
                          "w-5 h-5",
                          unreadAlertsCount > 0
                            ? "text-warning"
                            : "text-muted-foreground"
                        )}
                      />
                      <Badge
                        variant={
                          unreadAlertsCount > 0 ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {unreadAlertsCount}{" "}
                        {unreadAlertsCount === 1 ? "Alerta" : "Alertas"}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {unreadAlertsCount}{" "}
                      {unreadAlertsCount === 1
                        ? "alerta não lido"
                        : "alertas não lidos"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {journeyStartTime && (
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-md border border-primary/30">
                  <span className="text-[10px] text-primary uppercase tracking-wide font-semibold whitespace-nowrap">
                    Início da Jornada
                  </span>
                  <span className="text-xs text-card-foreground font-medium">
                    {format(new Date(journeyStartTime), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mb-6 w-full">
            {/* Container com largura máxima de 60% */}
            <div className="flex items-center gap-4 max-w-[60%] flex-1">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, tipo ou motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filtro de Status */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as string | "all")
                  }
                  className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">Todos os Status</option>
                  <option value="green">Trabalhando</option>
                  <option value="blue">Deslocando</option>
                  <option value="yellow">Manobrando</option>
                  <option value="red">Parado</option>
                  <option value="gray">Sem Sinal</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Agrupamento */}
              <div className="flex items-center space-x-3 hidden md:flex">
                <span className="text-sm text-muted-foreground mr-1">
                  Agrupar por:
                </span>

                <div className="flex items-center bg-background border border-border rounded-lg p-0.5 shadow-sm">
                  <button
                    onClick={() => setGroupBy("area")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                      groupBy === "area"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Área
                  </button>

                  <div className="w-px h-4 bg-border mx-1" />

                  <button
                    onClick={() => setGroupBy("group")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                      groupBy === "group"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    Grupo
                  </button>
                </div>
              </div>

              {Object.keys(groupedMachines).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={areAllExpanded ? collapseAll : expandAll}
                  className="text-xs flex-shrink-0"
                >
                  {areAllExpanded ? (
                    <>
                      <Minimize2 className="w-3 h-3 mr-1" />
                      Recolher Tudo
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3 h-3 mr-1" />
                      Expandir Tudo
                    </>
                  )}
                </Button>
              )}
            </div>
          </div >

          <div className="space-y-4 max-h-96 overflow-y-auto pl-1 pr-2">
            {Object.entries(groupedMachines).map(([area, groupMachines]) => {
              const stats = getGroupStats(groupMachines);
              return (
                <div key={area} className="space-y-2">
                  <div
                    className="bg-card/50 border border-border/30 rounded-lg p-4 cursor-pointer hover:bg-card/70 transition-colors"
                    onClick={() => toggleArea(area)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {groupBy === "area" ? (
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Boxes className="w-5 h-5 text-muted-foreground" />
                        )}
                        <h3 className="text-lg font-semibold text-card-foreground">
                          {getAreaDisplayName(area)}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {stats.total}{" "}
                          {stats.total === 1 ? "máquina" : "máquinas"}
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

                  {expandedAreas[area] && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-1">
                      {groupMachines.map((machine) => (
                        <Card
                          key={machine.vehicleInfo.id}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:shadow-lg border-2 w-full h-[280px]",
                            getStatusBgClass(machine),
                            selectedMachine === machine.vehicleInfo.id &&
                            "ring-2 ring-primary shadow-glow"
                          )}
                          onClick={() => {
                            onMachineSelect(machine.vehicleInfo.id);
                            onClose();
                          }}
                        >
                          <CardContent className="p-2.5 h-full flex flex-col relative">
                            <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-border/30">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <div className="flex-shrink-0 relative">
                                  <MachineIcon
                                    icon={machineDataAdapter.getIcon(machine)}
                                    size={36}
                                  />
                                  {machine.alerts.filter(
                                    (alert) => !alert.isRead
                                  ).length > 0 && (
                                      <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-warning rounded-full flex items-center justify-center px-1">
                                        <AlertTriangle className="w-2.5 h-2.5 text-background flex-shrink-0" />
                                        <span className="text-[9px] font-bold text-background ml-0.5">
                                          {
                                            machine.alerts.filter(
                                              (alert) => !alert.isRead
                                            ).length
                                          }
                                        </span>
                                      </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-base text-card-foreground line-clamp-2">
                                  {machine.vehicleInfo.name}
                                </h3>
                              </div>

                              <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                                {/* Context Menu */}
                                <div onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-muted" >
                                        <span className="sr-only">Abrir menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => onViewHistory(machine)}>
                                        <History className="mr-2 h-4 w-4" />
                                        <span>Map / Histórico</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem disabled>
                                         <TrendingUp className="mr-2 h-4 w-4" />
                                         <span>Gráfico</span>
                                      </DropdownMenuItem>
                                       <DropdownMenuItem disabled>
                                         <FuelIcon className="mr-2 h-4 w-4" />
                                         <span>Consumo</span>
                                      </DropdownMenuItem>
                                       <DropdownMenuItem disabled>
                                         <Wrench className="mr-2 h-4 w-4" />
                                         <span>Manutenção</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <Badge
                                  variant={getStatusBadgeVariant(
                                    machineDataAdapter.getStatusColor(machine)
                                  )}
                                  className="text-xs px-1.5 py-0.5 h-5"
                                >
                                  {machineDataAdapter.getStatusTooltip(machine)}
                                </Badge>

                                <div className="flex items-center gap-1 whitespace-nowrap">
                                  {machine.deviceMessage.networkSource && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1 py-0 h-4"
                                    >
                                      {machine.deviceMessage.networkSource}
                                    </Badge>
                                  )}
                                  {machine.deviceMessage.lastUpdate && (
                                    <span className="text-[11px] text-muted-foreground">
                                      {format(
                                        new Date(
                                          machine.deviceMessage.lastUpdate
                                        ),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: ptBR }
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                                <Activity className="w-5 h-5 text-status-active flex-shrink-0" />
                                <div>
                                  <div className="text-[10px] font-medium uppercase text-muted-foreground">
                                    Velocidade
                                  </div>
                                  <div className="text-sm font-semibold text-card-foreground">
                                    {machineDataAdapter
                                      .getSpeed(machine)
                                      .toFixed(1)}{" "}
                                    km/h
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                                <Gauge className="w-5 h-5 text-status-active flex-shrink-0" />
                                <div>
                                  <div className="text-[10px] font-medium uppercase text-muted-foreground">
                                    RPM
                                  </div>
                                  <div className="text-sm font-semibold text-card-foreground">
                                    {machineDataAdapter
                                      .getRpm(machine)
                                      .toFixed(0)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-2 flex-1">
                              <div className="flex-1 min-w-0 space-y-1.5">
                                {machine.deviceMessage.operator && (
                                  <div className="flex items-center space-x-1.5 text-xs">
                                    <User className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-card-foreground">
                                      {machine.deviceMessage.operator}
                                    </span>
                                  </div>
                                )}

                                {machineDataAdapter.getNotation(machine) && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs text-card-foreground font-medium truncate">
                                      {
                                        machineDataAdapter.getNotation(machine)
                                          ?.code
                                      }
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      -
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                      {
                                        machineDataAdapter.getNotation(machine)
                                          ?.name
                                      }
                                    </span>
                                  </div>
                                )}

                                {machineDataAdapter.getNotation(machine)
                                  ?.registrationTime && (
                                    <div className="text-xs">
                                      <span className="text-muted-foreground">
                                        Apontamento às{" "}
                                      </span>
                                      <span className="text-card-foreground font-medium">
                                        {format(
                                          new Date(
                                            machineDataAdapter.getNotation(
                                              machine
                                            )?.registrationTime || new Date()
                                          ),
                                          "dd/MM/yyyy HH:mm",
                                          { locale: ptBR }
                                        )}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>

                            <div className="mt-auto pt-2 border-t border-foreground/20 relative">
                              <span
                                className={cn(
                                  "absolute -top-[7px] left-1/2 -translate-x-1/2 px-1.5 text-xs font-medium uppercase tracking-wide rounded-sm",
                                  "bg-[#00b359] text-white",
                                  "dark:bg-card dark:text-yellow-400"
                                )}
                              >
                                Jornada
                              </span>
                              <TooltipProvider>
                                <div className="grid grid-cols-5 gap-0.5 pt-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex flex-col items-center cursor-help min-w-0">
                                        <Timer className="w-4 h-4 text-muted-foreground mb-0.5 flex-shrink-0" />
                                        <span className="text-sm font-medium text-card-foreground whitespace-nowrap truncate max-w-full">
                                          {machine.tripJourney
                                            .hourmeterTotalFormatted || "0:00"}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Tempo ligado (aproximadamente)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex flex-col items-center cursor-help min-w-0">
                                        <Settings className="w-4 h-4 text-muted-foreground mb-0.5 flex-shrink-0" />
                                        <span className="text-xs font-medium text-card-foreground whitespace-nowrap truncate max-w-full">
                                          {machine.tripJourney
                                            .hourmeterWorkedFormatted || "0:00"}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Tempo de trabalho (aproximadamente)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex flex-col items-center cursor-help min-w-0">
                                        <Grid3x3 className="w-4 h-4 text-muted-foreground mb-0.5 flex-shrink-0" />
                                        <span className="text-xs font-medium text-card-foreground whitespace-nowrap truncate max-w-full">
                                          {machine.tripJourney.area.toFixed(1)}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Área aplicada em hectares</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex flex-col items-center cursor-help min-w-0">
                                        <Droplets className="w-4 h-4 text-muted-foreground mb-0.5 flex-shrink-0" />
                                        <span className="text-xs font-medium text-card-foreground whitespace-nowrap truncate max-w-full">
                                          {machine.tripJourney.fuelConsumption.toFixed(
                                            0
                                          )}
                                          L
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Combustível em litros</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex flex-col items-center cursor-help min-w-0">
                                        <Route className="w-4 h-4 text-muted-foreground mb-0.5 flex-shrink-0" />
                                        <span className="text-xs font-medium text-card-foreground whitespace-nowrap truncate max-w-full">
                                          {machine.tripJourney.odometer.toFixed(
                                            0
                                          )}{" "}
                                          km
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

          {
            Object.keys(groupedMachines).length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma máquina encontrada
                </p>
              </div>
            )
          }
        </CardContent >
      </Card >
    </div >
  );
};

export default MachineGrid;
