import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MachineData } from '@/types/machine';
import MachineMarker from './MachineMarker';
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
    console.log('🗺️ MachineMap montado');
    const initializeMap = async () => {
      console.log('🚀 Iniciando inicialização do mapa...');
      
      if (!mapContainer.current) {
        console.error('❌ Container do mapa não encontrado');
        setMapboxError('Container não encontrado');
        setMapLoaded(true);
        return;
      }
      
      console.log('✅ Container encontrado');
      
      try {
        const token = "pk.eyJ1IjoicmFmYWVsb3Jhc21vIiwiYSI6ImNtZWlrMjBhaDAzNzgybHEwaWl5OTZjYjIifQ.XJKLRgv-kKSvUGkPRsChEQ";
        console.log('🔑 Token configurado:', token ? 'SIM' : 'NÃO');
        
        if (!token) {
          console.log('⚠️ Sem token, mostrando fallback');
          setMapboxError('Token do Mapbox não configurado');
          setMapLoaded(true);
          return;
        }

        console.log('🌍 Inicializando Mapbox...');
        mapboxgl.accessToken = token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: PARANA_BOUNDS.center,
          zoom: PARANA_BOUNDS.zoom,
          maxBounds: PARANA_BOUNDS.bounds,
        });

        console.log('🎮 Adicionando controles...');
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
          console.log('✅ Mapa carregado com sucesso!');
          setMapLoaded(true);
        });

        map.current.on('error', (e) => {
          console.error('❌ Erro do Mapbox:', e);
          setMapboxError('Erro ao carregar mapa do Mapbox');
          setMapLoaded(true);
        });

      } catch (error) {
        console.error('❌ Erro ao inicializar mapa:', error);
        setMapboxError('Erro ao carregar mapa');
        setMapLoaded(true);
      }
    };

    // Usar fallback imediatamente se não houver container
    if (!mapContainer.current) {
      setMapboxError('Usando modo de demonstração');
      setMapLoaded(true);
    } else {
      initializeMap();
    }

    return () => {
      console.log('🧹 Limpando mapa...');
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

  console.log('🎨 Renderizando MachineMap', { mapLoaded, mapboxError, machinesCount: machines.length });

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
      {mapLoaded && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {machines.map((machine) => (
            <div key={machine.id} className="pointer-events-auto">
              <MachineMarker
                machine={machine}
                isSelected={selectedMachine === machine.id}
                onClick={() => onMachineSelect(machine.id)}
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
      
      {/* Map attribution */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Monitoramento Agrícola - Paraná
      </div>
    </div>
  );
};

export default MachineMap;