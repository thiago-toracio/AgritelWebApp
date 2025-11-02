import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Grid2X2, 
  Map,
  Settings,
  AlertTriangle,
  CornerDownRight,
  StopCircle,
  ArrowRightLeft,
  RefreshCw,
  Calendar
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { MachineData, MachineAlert } from '@/types/machine';
import { machineDataAdapter } from '@/utils/machineDataAdapter';
import { format, subHours, startOfHour } from 'date-fns';

export type MapStyle = 'satellite' | 'streets' | 'outdoors' | 'dark';

interface MapControlsProps {
  machines: MachineData[];
  alerts: MachineAlert[];
  onToggleGrid: () => void;
  onToggleAlerts: () => void;
  onToggleStatus: (filter?: string) => void;
  onMapStyleChange: (style: MapStyle) => void;
  currentMapStyle: MapStyle;
  onRefresh: () => void;
}

const MapControls = ({ 
  machines, 
  alerts,
  onToggleGrid,
  onToggleAlerts,
  onToggleStatus,
  onMapStyleChange,
  currentMapStyle,
  onRefresh
}: MapControlsProps) => {
  const [showMapStyles, setShowMapStyles] = useState(false);
  const [openRefreshPopover, setOpenRefreshPopover] = useState(false);
  
  // Load refresh interval from localStorage or default to 30s
  const [refreshInterval, setRefreshInterval] = useState<number>(() => {
    const saved = localStorage.getItem('refreshInterval');
    return saved ? parseInt(saved) : 30;
  });
  
  const [countdown, setCountdown] = useState(refreshInterval);
  const alertsCount = alerts.filter(alert => !alert.resolved).length;

  const refreshIntervals = [
    { value: 15, label: '15s' },
    { value: 30, label: '30s' },
    { value: 60, label: '60s' },
    { value: 180, label: '180s' }
  ];

  // Generate hourly options for the last 48 hours
  const journeyStartOptions = useMemo(() => {
    const now = new Date();
    const currentHour = startOfHour(now);
    const options = [];
    
    for (let i = 0; i <= 48; i++) {
      const hourDate = subHours(currentHour, i);
      options.push({
        value: hourDate.toISOString(),
        label: `A partir das ${format(hourDate, 'dd/MM/yyyy HH:00')}`
      });
    }
    
    return options;
  }, []);

  const [selectedJourneyStart, setSelectedJourneyStart] = useState(journeyStartOptions[0].value);

  // Timer de atualização automática
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh, refreshInterval]);

  // Handle refresh interval change
  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
    setCountdown(interval);
    localStorage.setItem('refreshInterval', interval.toString());
    setOpenRefreshPopover(false);
  };

  const mapStyles: { value: MapStyle; label: string }[] = [
    { value: 'satellite', label: 'Satélite' },
    { value: 'streets', label: 'Ruas' },
    { value: 'outdoors', label: 'Outdoor' },
    { value: 'dark', label: 'Escuro' }
  ];

  // Categorização das máquinas usando machineDataAdapter
  const statusCounts = useMemo(() => {
    return machines.reduce((acc, machine) => {
      const statusColor = machineDataAdapter.getStatusColor(machine);
      acc[statusColor] = (acc[statusColor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [machines]);

  const trabalhando = statusCounts.green || 0;
  const manobrando = statusCounts.yellow || 0;
  const parada = statusCounts.red || 0;
  const deslocando = statusCounts.blue || 0;

  return (
    <>
      <TooltipProvider>
        {/* Status Bar */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 max-w-5xl">
        <Card className="bg-gradient-overlay border-border/50 shadow-overlay backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 md:space-x-3 overflow-x-auto scrollbar-hide whitespace-nowrap justify-center px-2">
              <Popover open={openRefreshPopover} onOpenChange={setOpenRefreshPopover}>
                <PopoverTrigger asChild>
                  <button className="flex items-center space-x-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {countdown}s
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-card border-border/50 shadow-lg" align="start">
                  <div className="flex flex-col space-y-1">
                    {refreshIntervals.map((interval) => (
                      <Button
                        key={interval.value}
                        variant={refreshInterval === interval.value ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleRefreshIntervalChange(interval.value)}
                        className="w-full justify-start text-sm"
                      >
                        {interval.label}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <button
                onClick={() => onToggleStatus('green')}
                className="flex items-center space-x-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <Settings className="w-5 h-5 text-[#22c55e]" />
                <span className="text-sm font-semibold text-[#22c55e] whitespace-nowrap">
                  {trabalhando}
                </span>
                <span className="text-sm text-card-foreground whitespace-nowrap">
                  trabalhando
                </span>
              </button>
              
              <button
                onClick={() => onToggleStatus('yellow')}
                className="flex items-center space-x-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <CornerDownRight className="w-5 h-5 text-[#eab308]" />
                <span className="text-sm font-semibold text-[#eab308] whitespace-nowrap">
                  {manobrando}
                </span>
                <span className="text-sm text-card-foreground whitespace-nowrap">
                  manobrando
                </span>
              </button>
              
              <button
                onClick={() => onToggleStatus('red')}
                className="flex items-center space-x-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <StopCircle className="w-5 h-5 text-[#ef4444]" />
                <span className="text-sm font-semibold text-[#ef4444] whitespace-nowrap">
                  {parada}
                </span>
                <span className="text-sm text-card-foreground whitespace-nowrap">
                  parada
                </span>
              </button>
              
              <button
                onClick={() => onToggleStatus('blue')}
                className="flex items-center space-x-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-5 h-5 text-[#3b82f6]" />
                <span className="text-sm font-semibold text-[#3b82f6] whitespace-nowrap">
                  {deslocando}
                </span>
                <span className="text-sm text-card-foreground whitespace-nowrap">
                  deslocando
                </span>
              </button>
              
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <Badge 
                  variant={alertsCount > 0 ? "destructive" : "secondary"}
                  className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={onToggleAlerts}
                >
                  {alertsCount} {alertsCount === 1 ? 'alerta' : 'alertas'}
                </Badge>
              </div>

              <div className="flex items-center space-x-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Início da Jornada</p>
                  </TooltipContent>
                </Tooltip>
                <Select value={selectedJourneyStart} onValueChange={setSelectedJourneyStart}>
                  <SelectTrigger className="w-[200px] h-7 text-xs bg-[#00b359] text-white border-[#00b359] hover:bg-[#00a04f]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {journeyStartOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
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

      {/* Map Controls */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40">
        <Card className="bg-gradient-overlay border-border/50 shadow-overlay backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMapStyles(!showMapStyles)}
                  className="w-10 h-10 p-0"
                  title="Alterar Mapa"
                >
                  <Map className="w-6 h-6" />
                </Button>
                
                {showMapStyles && (
                  <Card className="absolute left-14 top-0 min-w-[140px] bg-gradient-overlay border-border/50 shadow-overlay backdrop-blur-sm">
                    <CardContent className="p-2">
                      <div className="flex flex-col space-y-1">
                        {mapStyles.map((style) => (
                          <Button
                            key={style.value}
                            variant={currentMapStyle === style.value ? "default" : "ghost"}
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
              
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Toggle Button - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-40">
        <Button
          onClick={onToggleGrid}
          className="bg-[#00b359] hover:bg-[#00a04f] text-white dark:bg-black dark:text-yellow-400 dark:hover:bg-gray-900 border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
          size="lg"
        >
          <Grid2X2 className="w-6 h-6 mr-2" />
          Agrupado por Áreas
        </Button>
      </div>
    </>
  );
};

export default MapControls;