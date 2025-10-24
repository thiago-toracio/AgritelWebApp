import React from 'react';
import { MachineData } from '@/types/machine';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MachineIcon from './MachineIcons';
import { machineDataAdapter } from '@/utils/machineDataAdapter';

interface FallbackMachineMarkerProps {
  machine: MachineData;
  isSelected: boolean;
  onClick: () => void;
}

const FallbackMachineMarker: React.FC<FallbackMachineMarkerProps> = ({ machine, isSelected, onClick }) => {
  const machineId = machineDataAdapter.getId(machine);
  const demoPosition = {
    left: `${Math.abs(machineId.charCodeAt(0) % 80) + 10}%`,
    top: `${Math.abs(machineId.charCodeAt(1) % 70) + 15}%`
  };

  const statusColor = machineDataAdapter.getStatusColor(machine);
  const statusTooltip = machineDataAdapter.getStatusTooltip(machine);
  const hasAlert = machine.deviceState.status === 'maintenance' || machineDataAdapter.getFuel(machine) < 20;
  const heading = machineDataAdapter.getHeading(machine);
  const icon = machineDataAdapter.getIcon(machine);
  const name = machineDataAdapter.getName(machine);

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={demoPosition}
      onClick={onClick}
    >
      {statusColor === 'green' && (
        <div className="absolute inset-0 rounded-full animate-pulse-green" />
      )}
      
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
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-overlay whitespace-nowrap">
          <div className="text-sm font-medium text-card-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{statusTooltip}</div>
          <div className="text-xs text-muted-foreground">{machineDataAdapter.getSpeed(machine)} km/h</div>
        </div>
      </div>
    </div>
  );
};

export default FallbackMachineMarker;