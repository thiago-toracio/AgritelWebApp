import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MachineData } from '@/types/machine';
import MachineMarker from './MachineMarker';
import MachineIcon from './MachineIcons';
import { AlertTriangle } from 'lucide-react';
import { getMapboxToken, PARANA_BOUNDS } from '@/lib/mapbox';

interface MachineMapProps {
  machines: MachineData[];
  selectedMachine?: string;
  onMachineSelect: (machineId: string) => void;
  focusOnMachine?: string;
}

const MachineMap = ({ machines, selectedMachine, onMachineSelect, focusOnMachine }: MachineMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxError, setMapboxError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) {
        setMapboxError('Container não encontrado');
        setMapLoaded(true);
        return;
      }
      
      try {
        const token = "pk.eyJ1IjoicmFmYWVsb3Jhc21vIiwiYSI6ImNtZWlrMjBhaDAzNzgybHEwaWl5OTZjYjIifQ.XJKLRgv-kKSvUGkPRsChEQ";
        
        if (!token) {
          setMapboxError('Token do Mapbox não configurado');
          setMapLoaded(true);
          return;
        }

        mapboxgl.accessToken = token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: PARANA_BOUNDS.center,
          zoom: PARANA_BOUNDS.zoom,
          maxBounds: PARANA_BOUNDS.bounds,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
          setMapLoaded(true);
        });

        map.current.on('error', () => {
          setMapboxError('Erro ao carregar mapa do Mapbox');
          setMapLoaded(true);
        });

      } catch (error) {
        setMapboxError('Erro ao carregar mapa');
        setMapLoaded(true);
      }
    };

    if (!mapContainer.current) {
      setMapboxError('Usando modo de demonstração');
      setMapLoaded(true);
    } else {
      initializeMap();
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Focus on machine when focusOnMachine changes
  useEffect(() => {
    if (focusOnMachine && map.current && mapLoaded && !mapboxError) {
      const machine = machines.find(m => m.id === focusOnMachine);
      if (machine) {
        map.current.flyTo({
          center: [machine.location.longitude, machine.location.latitude],
          zoom: 15,
          duration: 1000
        });
      }
    }
  }, [focusOnMachine, machines, mapLoaded, mapboxError]);

  return (
    <div className="relative w-full h-full bg-background">
      {/* Mapbox container - sempre presente */}
      <div ref={mapContainer} className="absolute inset-0 z-0" />
      
      {/* Fallback for when Mapbox fails */}
      {mapboxError && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900 to-slate-800"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, hsl(var(--agriculture-green) / 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, hsl(var(--agriculture-blue) / 0.1) 0%, transparent 50%)
            `
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="absolute top-4 left-4 bg-agriculture-blue/10 border border-agriculture-blue/20 text-agriculture-blue px-4 py-3 rounded-lg text-sm max-w-md">
            <p className="font-medium">Mapa do Paraná configurado!</p>
            <p className="text-xs mt-1 opacity-90">
              Para ver o mapa real, adicione seu token do Mapbox nas configurações do Supabase.
              <br />
              <span className="text-xs opacity-75">Obtenha em: mapbox.com → Tokens</span>
            </p>
          </div>
        </div>
      )}
      
      {/* Machine markers overlay - sempre visível quando carregado */}
      {mapLoaded && map.current && !mapboxError && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {machines.map((machine) => (
            <MachineMarker
              key={machine.id}
              machine={machine}
              isSelected={selectedMachine === machine.id}
              onClick={() => onMachineSelect(machine.id)}
              map={map.current!}
            />
          ))}
        </div>
      )}
      
      {/* Fallback markers for demo mode */}
      {mapLoaded && mapboxError && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {machines.map((machine) => {
            // Simplified demo positioning when Mapbox is not available
            const demoPosition = {
              left: `${Math.abs(machine.id.charCodeAt(0) % 80) + 10}%`,
              top: `${Math.abs(machine.id.charCodeAt(1) % 70) + 15}%`
            };
            
            const hasAlert = machine.status === 'maintenance' || machine.fuel < 20;
            
            return (
              <div
                key={machine.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto"
                style={demoPosition}
                onClick={() => onMachineSelect(machine.id)}
              >
                {machine.status === 'active' && (
                  <div className="absolute inset-0 rounded-full animate-pulse-green" />
                )}
                
                <div className={`relative flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 ${selectedMachine === machine.id ? 'scale-125 shadow-glow' : ''}`}>
                  <MachineIcon 
                    type={machine.type} 
                    status={machine.status} 
                    direction={machine.direction || 0}
                    size={48}
                  />
                  
                  {hasAlert && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-background" />
                    </div>
                  )}
                </div>
                
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-overlay whitespace-nowrap">
                    <div className="text-sm font-medium text-card-foreground">{machine.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{machine.status}</div>
                    <div className="text-xs text-muted-foreground">{machine.speed} km/h</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando mapa...</p>
          </div>
        </div>
      )}
      
      {/* Map attribution */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Monitoramento Agrícola - Paraná
      </div>
    </div>
  );
};

export default MachineMap;