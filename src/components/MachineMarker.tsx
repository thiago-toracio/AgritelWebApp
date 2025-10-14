import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MachineData } from '@/types/machine';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import MachineIcon from './MachineIcons';

interface MachineMarkerProps {
  machine: MachineData;
  isSelected: boolean;
  onClick: () => void;
  map: mapboxgl.Map;
}

const MachineMarker: React.FC<MachineMarkerProps> = ({ machine, isSelected, onClick, map }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Convert geographic coordinates to screen pixels
  useEffect(() => {
    const updatePosition = () => {
      const point = map.project([machine.location.longitude, machine.location.latitude]);
      setPosition({ x: point.x, y: point.y });
    };

    // Initial position
    updatePosition();

    // Update position when map moves/zooms
    map.on('move', updatePosition);
    map.on('zoom', updatePosition);
    map.on('rotate', updatePosition);

    return () => {
      map.off('move', updatePosition);
      map.off('zoom', updatePosition);
      map.off('rotate', updatePosition);
    };
  }, [map, machine.location.longitude, machine.location.latitude]);

  const hasAlert = machine.status === 'maintenance' || machine.fuel < 20;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-200"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        pointerEvents: 'auto'
      }}
      onClick={onClick}
    >
      {/* Active status pulse animation */}
      {machine.status === 'active' && (
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
          type={machine.type} 
          status={machine.status} 
          direction={machine.direction || 0}
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
          <div className="text-xs text-muted-foreground capitalize">{machine.status}</div>
          <div className="text-xs text-muted-foreground">{machine.speed} km/h</div>
        </div>
      </div>
    </div>
  );
};

export default MachineMarker;