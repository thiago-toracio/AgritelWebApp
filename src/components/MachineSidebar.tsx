import { toast } from 'sonner';
import { MachineData, DeviceState } from '@/types/machine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  MapPin, 
  Fuel, 
  Clock, 
  User, 
  Settings, 
  Gauge,
  Droplets,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { machineDataAdapter } from '@/utils/machineDataAdapter';

interface MachineSidebarProps {
  machine: MachineData | null;
  isOpen: boolean;
  onClose: () => void;
}

const MachineSidebar = ({ machine, isOpen, onClose }: MachineSidebarProps) => {
  if (!isOpen || !machine) return null;

  const getStatusColorClass = (color: string) => {
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

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-gradient-overlay border-l border-border shadow-overlay backdrop-blur-sm z-50 animate-slide-right overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">{machine.vehicleInfo.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">{machineDataAdapter.getType(machine)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Card */}
        <Card className={cn("mb-6 border-2", getStatusBgClass(machine.deviceState.color))}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Status Atual
              <Badge variant={getStatusBadgeVariant(machine.deviceState.color)}>
                {machine.deviceState.tooltip}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Velocidade</span>
                </div>
                <span className={cn("font-medium", getStatusColorClass(machine.deviceState.color))}>
                  {machineDataAdapter.getSpeed(machine)} km/h
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fuel className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Nível de Combustível</span>
                </div>
                <span className="text-sm text-card-foreground font-medium">
                  {machineDataAdapter.getFuel(machine).toFixed(1)}L
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Última atualização</span>
                </div>
                <span className="text-sm text-card-foreground">
                  {formatDistanceToNow(new Date(machine.deviceMessage.lastUpdate), { addSuffix: true, locale: ptBR })}
                </span>
              </div>

              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                onClick={() => {
                  const coords = `${machine.deviceMessage.gps.latitude.toFixed(6)}, ${machine.deviceMessage.gps.longitude.toFixed(6)}`;
                  navigator.clipboard.writeText(coords);
                  toast.success('Coordenadas copiadas para a área de transferência');
                }}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Copiar Coordenadas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operator & Task */}
        {(machine.deviceMessage.operator || machine.deviceMessage.task || machine.deviceMessage.area) && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Operação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {machine.deviceMessage.operator && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Operador:</span>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-card-foreground font-medium">{machine.deviceMessage.operator}</span>
                  </div>
                </div>
              )}
              {machine.deviceMessage.task && (
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tarefa:</span>
                  <span className="text-sm text-card-foreground">{machine.deviceMessage.task}</span>
                </div>
              )}
              {machine.deviceMessage.area && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Área:</span>
                  <span className="text-sm text-card-foreground">{machine.deviceMessage.area}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Trip Journey Information */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Informações da Jornada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {machine.tripJourney.hourmeterWorkedFormatted && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Horímetro Trabalhado</span>
                </div>
                <span className="text-sm text-card-foreground font-medium">
                  {machine.tripJourney.hourmeterWorkedFormatted}
                </span>
              </div>
            )}

            {machine.tripJourney.hourmeterTotalFormatted && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Horímetro Total</span>
                </div>
                <span className="text-sm text-card-foreground font-medium">
                  {machine.tripJourney.hourmeterTotalFormatted}
                </span>
              </div>
            )}

            {machine.tripJourney.fuelConsumption > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fuel className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Consumo de Combustível</span>
                </div>
                <span className="text-sm text-card-foreground font-medium">
                  {machine.tripJourney.fuelConsumption.toFixed(1)}L
                </span>
              </div>
            )}

            {machine.tripJourney.applicationTotal > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Aplicação Total</span>
                </div>
                <span className="text-sm text-card-foreground font-medium">
                  {machine.tripJourney.applicationTotal.toFixed(1)}L
                </span>
              </div>
            )}

            {machine.tripJourney.area > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Área Trabalhada</span>
                </div>
                <span className="text-sm text-card-foreground font-medium">
                  {machine.tripJourney.area.toFixed(2)} ha
                </span>
              </div>
            )}

            {machine.tripJourney.odometer > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Odômetro</span>
                </div>
                <span className="text-sm text-card-foreground font-medium">
                  {machine.tripJourney.odometer.toFixed(1)} km
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MachineSidebar;