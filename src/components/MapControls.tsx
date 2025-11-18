import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Grid2X2,
  Map,
  Settings,
  AlertTriangle,
  CornerDownRight,
  StopCircle,
  ArrowRightLeft,
  RefreshCw,
  Calendar,
  HelpCircle,
  GroupIcon
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { MachineData, MachineAlertData } from "@/types/machine";
import { machineDataAdapter } from "@/utils/machineDataAdapter";
import { format, subHours, startOfHour } from "date-fns";

export type MapStyle = "roadmap" | "satellite" | "hybrid" | "terrain";

interface MapControlsProps {
  machines: MachineData[];
  alerts: MachineAlertData[];
  onToggleGrid: () => void;
  onToggleAlerts: () => void;
  onToggleStatus: (filter?: string) => void;
  onMapStyleChange: (style: MapStyle) => void;
  currentMapStyle: MapStyle;
  onRefresh: () => void;
  onJourneyStartChange?: (startTime: string) => void;
  countdown: number;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  isClustering: boolean;
  onToggleClustering: () => void;
}

const MapControls = ({
  machines,
  alerts,
  onToggleGrid,
  onToggleAlerts,
  onToggleStatus,
  onMapStyleChange,
  currentMapStyle,
  onRefresh,
  onJourneyStartChange,
  countdown,
  refreshInterval,
  onRefreshIntervalChange,
  isClustering,
  onToggleClustering,
}: MapControlsProps) => {
  const [showMapStyles, setShowMapStyles] = useState(false);
  const [openRefreshPopover, setOpenRefreshPopover] = useState(false);

  const alertsCount = alerts.filter((alert) => !alert.isRead).length;

  const refreshIntervals = [
    { value: 15, label: "15s" },
    { value: 30, label: "30s" },
    { value: 60, label: "60s" },
  ];

  const [currentHourKey, setCurrentHourKey] = useState(() =>
    startOfHour(new Date()).getTime()
  );

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const journeyStartOptions = useMemo(() => {
    const now = new Date();
    const currentHour = startOfHour(now);
    const options = [];

    for (let i = 0; i <= 47; i++) {
      const hourDate = subHours(currentHour, i);
      options.push({
        value: formatDateTimeLocal(hourDate),
        label: `A partir das ${format(hourDate, "dd/MM/yyyy HH:00")}`,
      });
    }

    return options;
  }, [currentHourKey]);

  useEffect(() => {
    const checkHourChange = () => {
      const currentHourTime = startOfHour(new Date()).getTime();
      if (currentHourTime !== currentHourKey) {
        setCurrentHourKey(currentHourTime);
      }
    };

    const interval = setInterval(checkHourChange, 60000);

    return () => clearInterval(interval);
  }, [currentHourKey]);

  const getDefaultJourneyStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFormatted = formatDateTimeLocal(today);
    return (
      journeyStartOptions.find((option) => option.value === todayFormatted)
        ?.value || journeyStartOptions[0].value
    );
  };

  const [selectedJourneyStart, setSelectedJourneyStart] = useState(
    getDefaultJourneyStart()
  );

  const handleJourneyStartChange = (value: string) => {
    setSelectedJourneyStart(value);
    onJourneyStartChange?.(value);
  };

  const handleRefreshIntervalChange = (interval: number) => {
    onRefreshIntervalChange(interval);
    setOpenRefreshPopover(false);
  };

  const mapStyles: { value: MapStyle; label: string }[] = [
    { value: "satellite", label: "Satélite" },
    { value: "roadmap", label: "Estradas" },
    { value: "hybrid", label: "Híbrido" },
    { value: "terrain", label: "Terreno" },
  ];

  const statusCounts = useMemo(() => {
    return machines.reduce((acc, machine) => {
      const statusColor = machineDataAdapter.getStatusColor(machine);
      acc[statusColor] = (acc[statusColor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [machines]);

  const trabalhando = statusCounts.green || 0;
  const manobrando = statusCounts.yellow || 0;
  const parado = statusCounts.red || 0;
  const deslocando = statusCounts.blue || 0;
  const indefinido = statusCounts.gray || 0;

  return (
    <>
      <TooltipProvider>
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 max-w-5xl">
          <Card className="bg-gradient-overlay border-border/50 shadow-overlay backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center space-x-0.5 md:space-x-1.5 overflow-x-auto scrollbar-hide whitespace-nowrap justify-center px-2">

                <button
                  onClick={() => onToggleStatus("green")}
                  className="flex items-center space-x-1 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  <Settings className="w-5 h-5 text-[#22c55e]" />
                  <span className="text-sm font-semibold text-[#22c55e] whitespace-nowrap">
                    {trabalhando}
                  </span>
                  <span className="text-sm text-card-foreground whitespace-nowrap">
                    Trabalhando
                  </span>
                </button>

                <button
                  onClick={() => onToggleStatus("yellow")}
                  className="flex items-center space-x-1 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  <CornerDownRight className="w-5 h-5 text-[#eab308]" />
                  <span className="text-sm font-semibold text-[#eab308] whitespace-nowrap">
                    {manobrando}
                  </span>
                  <span className="text-sm text-card-foreground whitespace-nowrap">
                    Manobrando
                  </span>
                </button>

                <button
                  onClick={() => onToggleStatus("red")}
                  className="flex items-center space-x-1 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  <StopCircle className="w-5 h-5 text-[#ef4444]" />
                  <span className="text-sm font-semibold text-[#ef4444] whitespace-nowrap">
                    {parado}
                  </span>
                  <span className="text-sm text-card-foreground whitespace-nowrap">
                    Parado
                  </span>
                </button>

                <button
                  onClick={() => onToggleStatus("blue")}
                  className="flex items-center space-x-1 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-5 h-5 text-[#3b82f6]" />
                  <span className="text-sm font-semibold text-[#3b82f6] whitespace-nowrap">
                    {deslocando}
                  </span>
                  <span className="text-sm text-card-foreground whitespace-nowrap">
                    Deslocando
                  </span>
                </button>

                <button
                  onClick={() => onToggleStatus("gray")}
                  className="flex items-center space-x-1 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-400 whitespace-nowrap">
                    {indefinido}
                  </span>
                  <span className="text-sm text-card-foreground whitespace-nowrap">
                    Sem Sinal
                  </span>
                </button>

                <div className="flex items-center space-x-1">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <Badge
                    variant={alertsCount > 0 ? "destructive" : "secondary"}
                    className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onToggleAlerts}
                  >
                    {alertsCount} {alertsCount === 1 ? "Alerta" : "Alertas"}
                  </Badge>
                </div>

                <div className="flex items-center space-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center cursor-pointer">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Início da Jornada (esta data atua sobre informações da
                        jornada e alertas)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Select
                    value={selectedJourneyStart}
                    onValueChange={handleJourneyStartChange}
                  >
                    <SelectTrigger className="w-[200px] h-7 text-xs bg-[#00b359] text-white border-[#00b359] hover:bg-[#00a04f] cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {journeyStartOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-xs"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>

      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40">
        <Card className="bg-gradient-overlay border-border/50 shadow-overlay backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="flex flex-col space-y-2">
              <Popover
                open={openRefreshPopover}
                onOpenChange={setOpenRefreshPopover}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-10 h-10 p-0 relative group"
                      >
                        <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-45" />
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold leading-none shadow-sm">
                          {countdown}
                        </div>
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    <p>Intervalo de Atualização</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent
                  className="w-auto p-2 bg-card border-border/50 shadow-lg"
                  align="start"
                >
                  <div className="flex flex-col space-y-1">
                    <div className="px-2 py-1 text-xs text-muted-foreground border-b border-border/50 mb-1">
                      Atualizar a cada:
                    </div>
                    {refreshIntervals.map((interval) => (
                      <Button
                        key={interval.value}
                        variant={
                          refreshInterval === interval.value
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        onClick={() =>
                          handleRefreshIntervalChange(interval.value)
                        }
                        className="w-full justify-start text-sm"
                      >
                        {interval.label}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isClustering ? "default" : "ghost"}
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={onToggleClustering}
                  >
                    <GroupIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="start">
                  <p>
                    {isClustering
                      ? "Desagrupar veículos próximos"
                      : "Agrupar veículos próximos"}
                  </p>
                </TooltipContent>
              </Tooltip>

              <div className="w-full h-px bg-border my-1" />

              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMapStyles(!showMapStyles)}
                      className="w-10 h-10 p-0"
                    >
                      <Map className="w-6 h-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    <p>Alterar Estilo do Mapa</p>
                  </TooltipContent>
                </Tooltip>

                {showMapStyles && (
                  <Card className="absolute left-14 top-0 min-w-[140px] bg-gradient-overlay border-border/50 shadow-overlay backdrop-blur-sm">
                    <CardContent className="p-2">
                      <div className="flex flex-col space-y-1">
                        {mapStyles.map((style) => (
                          <Button
                            key={style.value}
                            variant={
                              currentMapStyle === style.value
                                ? "default"
                                : "ghost"
                            }
                            size="sm"
                            onClick={() => {
                              onMapStyleChange(style.value);
                              setShowMapStyles(false);
                            }}
                            className="w-full justify-start text-sm"
                          >
                            {style.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="w-full h-px bg-border my-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Assumindo que ThemeToggle renderiza um botão */}
                  <div className="flex items-center justify-center">
                    <ThemeToggle />
                  </div>
                </TooltipTrigger>
                <TooltipContent align="start">
                  <p>Alterar Tema</p>
                </TooltipContent>
              </Tooltip>

            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-4 left-4 z-40">
        <Button
          onClick={onToggleGrid}
          className="bg-[#00b359] hover:bg-[#00a04f] text-white dark:bg-black dark:text-yellow-400 dark:hover:bg-gray-900 border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
          size="lg"
        >
          <Grid2X2 className="w-6 h-6 mr-2" />
          Informações da Jornada
        </Button>
      </div>
    </>
  );
};

export default MapControls;