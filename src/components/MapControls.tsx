import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Grid2X2, 
  Map,
  Settings,
  AlertTriangle,
  CornerDownRight,
  StopCircle,
  ArrowRightLeft,
  RefreshCw
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { MachineData, MachineAlert } from '@/types/machine';
import { getMachineStatus } from '@/utils/machineStatus';

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
  const [countdown, setCountdown] = useState(60);
  const alertsCount = alerts.filter(alert => !alert.resolved).length;

  // Timer de atualização automática
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh]);

  const mapStyles: { value: MapStyle; label: string }[] = [
    { value: 'satellite', label: 'Satélite' },
    { value: 'streets', label: 'Ruas' },
    { value: 'outdoors', label: 'Outdoor' },
    { value: 'dark', label: 'Escuro' }
  ];

  // Categorização das máquinas usando getMachineStatus
  const statusCounts = useMemo(() => {
    return machines.reduce((acc, machine) => {
      const status = getMachineStatus(machine);
      acc[status.color] = (acc[status.color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [machines]);

  const trabalhando = statusCounts.green || 0;
  const manobrando = statusCounts.yellow || 0;
  const parada = statusCounts.red || 0;
  const deslocando = statusCounts.blue || 0;

  return (
    <>
      {/* Status Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 max-w-5xl">
        <Card className="bg-gradient-overlay border-border/50 shadow-overlay backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3 md:space-x-4 overflow-x-auto scrollbar-hide whitespace-nowrap justify-center px-2">
              <div className="flex items-center space-x-1.5">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {countdown}s
                </span>
              </div>
              
              <button
                onClick={() => onToggleStatus('green')}
                className="flex items-center space-x-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
                <Badge variant="secondary" className="bg-green-500/20 text-green-500 font-semibold hover:bg-green-500/30">
                  {trabalhando}
                </Badge>
                <span className="text-sm text-card-foreground whitespace-nowrap">
                  trabalhando
                </span>
              </button>
              
              <button
                onClick={() => onToggleStatus('yellow')}
                className="flex items-center space-x-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <CornerDownRight className="w-5 h-5 text-muted-foreground" />
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 font-semibold hover:bg-yellow-500/30">
                  {manobrando}
                </Badge>
                <span className="text-sm text-card-foreground whitespace-nowrap">
                  manobrando
                </span>
              </button>
              
              <button
                onClick={() => onToggleStatus('red')}
                className="flex items-center space-x-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <StopCircle className="w-5 h-5 text-muted-foreground" />
                <Badge variant="secondary" className="bg-red-500/20 text-red-500 font-semibold hover:bg-red-500/30">
                  {parada}
                </Badge>
                <span className="text-sm text-card-foreground whitespace-nowrap">
                  parada
                </span>
              </button>
              
              <button
                onClick={() => onToggleStatus('blue')}
                className="flex items-center space-x-1.5 hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 font-semibold hover:bg-blue-500/30">
                  {deslocando}
                </Badge>
                <span className="text-sm text-card-foreground whitespace-nowrap">
                  deslocando
                </span>
              </button>
              
              {alertsCount > 0 && (
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <Badge 
                    variant="destructive" 
                    className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onToggleAlerts}
                  >
                    {alertsCount} alertas
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
          className="hover:opacity-90 shadow-agricultural"
          style={{ backgroundColor: 'hsl(103, 65%, 50%)' }}
          size="lg"
        >
          <Grid2X2 className="w-6 h-6 mr-2" />
          Ver Grid
        </Button>
      </div>
    </>
  );
};

export default MapControls;