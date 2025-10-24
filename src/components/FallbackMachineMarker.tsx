import React from 'react';
import { MachineData } from '@/types/machine';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MachineIcon from './MachineIcons';
import { getMachineStatus } from '@/utils/machineStatus';
import { machineDataAdapter } from '@/utils/machineDataAdapter';

interface FallbackMachineMarkerProps {
  machine: MachineData;
  isSelected: boolean;
  onClick: () => void;
}

const FallbackMachineMarker: React.FC<FallbackMachineMarkerProps> = ({ machine, isSelected, onClick }) => {
  // Simplified demo positioning when Mapbox is not available
  const demoPosition = {
    left: `${Math.abs(machine.id.charCodeAt(0) % 80) + 10}%`,
    top: `${Math.abs(machine.id.charCodeAt(1) % 70) + 15}%`
  };

  const status = getMachineStatus(machine);
  const hasAlert = machine.status === 'maintenance' || machineDataAdapter.getFuel(machine) < 20;
  const heading = machineDataAdapter.getHeading(machine);

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={demoPosition}
      onClick={onClick}
    >
      {/* Active status pulse animation */}
      {status.color === 'green' && (
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
          type={machineDataAdapter.getType(machine)} 
          color={status.color}
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
          <div className="text-sm font-medium text-card-foreground">{machine.name}</div>
          <div className="text-xs text-muted-foreground">{status.label}</div>
          <div className="text-xs text-muted-foreground">{machineDataAdapter.getSpeed(machine)} km/h</div>
        </div>
      </div>
    </div>
  );
};

export default FallbackMachineMarker;
