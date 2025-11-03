import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { MachineData, MachineAlertData } from '@/types/machine';
import MachineMarker from './MachineMarker';
import FallbackMachineMarker from './FallbackMachineMarker';
import { getMapboxToken, PARANA_BOUNDS } from '@/lib/mapbox';
import { MapStyle } from './MapControls';
import { machineDataAdapter } from '@/utils/machineDataAdapter';

const MAP_STYLES: Record<MapStyle, string> = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  dark: 'mapbox://styles/mapbox/dark-v11'
};

interface MachineMapProps {
  machines: MachineData[];
  selectedMachine?: string;
  onMachineSelect: (machineId: string) => void;
  focusOnMachine?: string;
  mapStyle: MapStyle;
  alerts: MachineAlertData[];
}

const MachineMap = ({ machines, selectedMachine, onMachineSelect, focusOnMachine, mapStyle, alerts }: MachineMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: { marker: mapboxgl.Marker; root: ReactDOM.Root } }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxError, setMapboxError] = useState<string | null>(null);
  const hasAdjustedInitialBounds = useRef(false);

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
          style: MAP_STYLES[mapStyle],
          center: PARANA_BOUNDS.center,
          zoom: PARANA_BOUNDS.zoom,
          attributionControl: false,
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
      // Clean up markers
      Object.values(markers.current).forEach(({ marker, root }) => {
        root.unmount();
        marker.remove();
      });
      markers.current = {};
      map.current?.remove();
    };
  }, []); // Removido 'machines' da dependência para não recriar o mapa

  // Update map style when mapStyle prop changes
  useEffect(() => {
    if (map.current && mapLoaded && !mapboxError) {
      map.current.setStyle(MAP_STYLES[mapStyle]);
      
      // Re-add markers after style loads
      map.current.once('style.load', () => {
        Object.values(markers.current).forEach(({ marker }) => {
          marker.addTo(map.current!);
        });
      });
    }
  }, [mapStyle, mapLoaded, mapboxError]);

  // Create and update Mapbox GL markers
  useEffect(() => {
    if (!map.current || !mapLoaded || mapboxError) return;

    // Filter machines with valid coordinates
    const validMachines = machines.filter(machine => machineDataAdapter.hasValidCoordinates(machine));

    // Remove old markers that no longer exist
    Object.keys(markers.current).forEach(id => {
      if (!validMachines.find(m => m.vehicleInfo.id === id)) {
        const { marker, root } = markers.current[id];
        root.unmount();
        marker.remove();
        delete markers.current[id];
      }
    });

    // Add or update markers
    validMachines.forEach(machine => {
      const existing = markers.current[machine.vehicleInfo.id];
      const machineAlerts = alerts.filter(alert => alert.machineId === machine.vehicleInfo.id && !alert.isRead);
      
      if (existing) {
        // Update existing marker position and content
        existing.marker.setLngLat([machine.deviceMessage.gps.longitude, machine.deviceMessage.gps.latitude]);
        existing.root.render(
          <MachineMarker
            machine={machine}
            isSelected={selectedMachine === machine.vehicleInfo.id}
            onClick={() => onMachineSelect(machine.vehicleInfo.id)}
            alerts={machineAlerts}
          />
        );
      } else {
        // Create new marker
        const el = document.createElement('div');
        const root = ReactDOM.createRoot(el);
        
        root.render(
          <MachineMarker
            machine={machine}
            isSelected={selectedMachine === machine.vehicleInfo.id}
            onClick={() => onMachineSelect(machine.vehicleInfo.id)}
            alerts={machineAlerts}
          />
        );

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([machine.deviceMessage.gps.longitude, machine.deviceMessage.gps.latitude])
          .addTo(map.current);

        markers.current[machine.vehicleInfo.id] = { marker, root };
      }
    });
  }, [machines, mapLoaded, mapboxError, selectedMachine, onMachineSelect, alerts]);

  // Ajustar bounds para mostrar todas as máquinas na primeira carga
  useEffect(() => {
    if (!map.current || !mapLoaded || mapboxError || hasAdjustedInitialBounds.current) return;
    
    // Filter machines with valid coordinates
    const validMachines = machines.filter(machine => machineDataAdapter.hasValidCoordinates(machine));
    
    if (validMachines.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      validMachines.forEach(machine => {
        bounds.extend([machine.deviceMessage.gps.longitude, machine.deviceMessage.gps.latitude]);
      });
      
      // Ajustar mapa para mostrar todas as máquinas
      map.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        maxZoom: 14,
        duration: 1000
      });
      
      hasAdjustedInitialBounds.current = true;
    }
  }, [machines, mapLoaded, mapboxError]);

  // Focus on machine when focusOnMachine changes
  useEffect(() => {
    if (focusOnMachine && map.current && mapLoaded && !mapboxError) {
      const machine = machines.find(m => m.vehicleInfo.id === focusOnMachine);
      if (machine) {
        map.current.flyTo({
          center: [machine.deviceMessage.gps.longitude, machine.deviceMessage.gps.latitude],
          zoom: 16,
          duration: 1500,
          essential: true
        });
      }
    }
  }, [focusOnMachine, mapLoaded, mapboxError]);

  return (
    <div className="relative w-full h-full bg-background">
      {/* Mapbox container - interativo */}
      <div ref={mapContainer} className="absolute inset-0 z-0" style={{ pointerEvents: 'auto' }} />
      
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
      
      
      {/* Fallback demo markers quando Mapbox falha */}
      {mapboxError && mapLoaded && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {machines.map((machine) => (
            <div key={machine.vehicleInfo.id} className="pointer-events-auto">
              <FallbackMachineMarker
                machine={machine}
                isSelected={selectedMachine === machine.vehicleInfo.id}
                onClick={() => onMachineSelect(machine.vehicleInfo.id)}
              />
            </div>
          ))}
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
      
    </div>
  );
};

export default MachineMap;