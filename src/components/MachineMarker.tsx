import React from 'react';
import { MachineData, MachineAlertData } from '@/types/machine';
import { AlertTriangle, Gauge, Fuel, Clock, MapPin, Activity, User, FileText } from 'lucide-react';
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
  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const hasUnreadAlerts = unreadAlerts.length > 0;
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
          "shadow-lg hover:shadow-2xl hover:scale-125 hover:brightness-110",
          "hover:ring-4 hover:ring-primary/30",
          isSelected && "scale-125 shadow-glow ring-4 ring-primary/50"
        )}
      >
        <MachineIcon 
          icon={icon}
          heading={heading}
          size={48}
        />
        
        {/* Alert warning indicator with count */}
        {hasUnreadAlerts && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-warning rounded-full flex items-center justify-center px-1 gap-0.5">
            <AlertTriangle className="w-3 h-3 text-background flex-shrink-0" />
            <span className="text-[10px] font-bold text-background">{unreadAlerts.length}</span>
          </div>
        )}
      </div>
      
      {/* Hover tooltip with machine details */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[10000] scale-95 group-hover:scale-100">
        <div className="bg-card border-2 border-primary/20 rounded-lg px-3 py-2.5 shadow-2xl backdrop-blur-md min-w-[200px] group-hover:min-w-[240px] transition-all duration-300 ring-1 ring-primary/10">
          <div className="text-sm font-semibold text-card-foreground mb-1">{name}</div>
          <div className="text-xs text-muted-foreground mb-2">{statusTooltip}</div>
          
          <div className="space-y-1">
            {machine.deviceMessage.operator && (
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-card-foreground">{machine.deviceMessage.operator}</span>
              </div>
            )}

            {machineDataAdapter.getNotation(machine) && (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-semibold text-card-foreground">
                    {machineDataAdapter.getNotation(machine)?.code} - {machineDataAdapter.getNotation(machine)?.name}
                  </span>
                </div>
                {machineDataAdapter.getNotation(machine)?.localRegistrationTime && (
                  <div className="text-[11px] text-muted-foreground pl-5">
                    {format(new Date(machineDataAdapter.getNotation(machine)!.localRegistrationTime!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                )}
              </div>
            )}

            {hasUnreadAlerts && (
              <div className="flex items-center gap-1.5 text-warning">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-semibold">{unreadAlerts.length} alerta{unreadAlerts.length > 1 ? 's' : ''} não lido{unreadAlerts.length > 1 ? 's' : ''}</span>
              </div>
            )}

            {machine.deviceMessage.area && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-card-foreground">{machine.deviceMessage.area}</span>
              </div>
            )}

            {(machine.deviceMessage.operator || machineDataAdapter.getNotation(machine) || machine.deviceMessage.area) && (
              <div className="border-t border-border pt-1 mt-1" />
            )}

            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-semibold text-card-foreground">{machineDataAdapter.getSpeed(machine)} km/h</span>
            </div>
            
            {machine.telemetry?.fuelLevel !== undefined && machine.telemetry.fuelLevel > 0 && (
              <div className="flex items-center gap-1.5">
                <Fuel className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-card-foreground">{machine.telemetry.fuelLevel.toFixed(1)}L</span>
              </div>
            )}
            
            {machine.telemetry?.odometer !== undefined && machine.telemetry.odometer > 0 && (
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-card-foreground">{machine.telemetry.odometer.toFixed(1)} km</span>
              </div>
            )}
            
            {machine.telemetry?.operationHours !== undefined && machine.telemetry.operationHours > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-card-foreground">{machine.telemetry.operationHours.toFixed(1)}h</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 pt-1 mt-1 border-t border-border">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                {machine.deviceMessage.gps.latitude.toFixed(6)}, {machine.deviceMessage.gps.longitude.toFixed(6)}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            Atualizado: {format(new Date(machine.deviceMessage.lastUpdate), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineMarker;