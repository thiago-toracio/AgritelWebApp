import React from 'react';
import { MachineData, MachineAlertData } from '@/types/machine';
import { AlertTriangle, Gauge, Fuel, Clock, MapPin, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import MachineIcon from './MachineIcons';
import { machineDataAdapter } from '@/utils/machineDataAdapter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MachineMarkerProps {
  machine: MachineData;
  isSelected: boolean;
  onClick: () => void;
  alerts: MachineAlertData[];
}

const MachineMarker: React.FC<MachineMarkerProps> = ({ machine, isSelected, onClick, alerts }) => {
  const statusColor = machineDataAdapter.getStatusColor(machine);
  const statusTooltip = machineDataAdapter.getStatusTooltip(machine);
  const hasAlert = alerts.length > 0;
  const heading = machineDataAdapter.getHeading(machine);
  const icon = machineDataAdapter.getIcon(machine);
  const name = machineDataAdapter.getName(machine);

  return (
    <div
      className="cursor-pointer group transition-all duration-200"
      onClick={onClick}
    >
      {/* Active status pulse animation */}
      {statusColor === 'green' && (
        <div className="absolute inset-0 rounded-full animate-pulse-green" />
      )}
      
      {/* Main machine icon container */}
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-300",
          "shadow-lg hover:shadow-xl hover:scale-110",
          isSelected && "scale-125 shadow-glow"
        )}
      >
        <MachineIcon 
          icon={icon}
          heading={heading}
          size={48}
        />
        
        {/* Alert warning indicator */}
        {hasAlert && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
            <AlertTriangle className="w-3 h-3 text-background" />
          </div>
        )}
      </div>
      
      {/* Hover tooltip with machine details */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[10000]">
        <div className="bg-card border border-border rounded-lg px-3 py-2.5 shadow-overlay backdrop-blur-sm min-w-[200px]">
          <div className="text-sm font-medium text-card-foreground mb-1">{name}</div>
          <div className="text-xs text-muted-foreground mb-2">{statusTooltip}</div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-card-foreground">{machineDataAdapter.getSpeed(machine)} km/h</span>
            </div>
            
            {machine.telemetry?.fuelLevel !== undefined && machine.telemetry.fuelLevel > 0 && (
              <div className="flex items-center gap-1.5">
                <Fuel className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-card-foreground">{machine.telemetry.fuelLevel.toFixed(1)}L</span>
              </div>
            )}
            
            {machine.telemetry?.odometer !== undefined && machine.telemetry.odometer > 0 && (
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-card-foreground">{machine.telemetry.odometer.toFixed(1)} km</span>
              </div>
            )}
            
            {machine.telemetry?.operationHours !== undefined && machine.telemetry.operationHours > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-card-foreground">{machine.telemetry.operationHours.toFixed(1)}h</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 pt-1 mt-1 border-t border-border">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {machine.deviceMessage.gps.latitude.toFixed(6)}, {machine.deviceMessage.gps.longitude.toFixed(6)}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            Atualizado em: {format(new Date(machine.deviceMessage.lastUpdate), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineMarker;