import { useEffect, useRef, useState, useCallback } from 'react';
// 1. Use 'OverlayViewF' para melhor performance
import { GoogleMap, useLoadScript, OverlayViewF, OverlayView } from '@react-google-maps/api'
import { MachineData, MachineAlertData } from '@/types/machine';
import MachineMarker from './MachineMarker';
import FallbackMachineMarker from './FallbackMachineMarker';
import { PARANA_BOUNDS } from '@/lib/mapbox'; 
import { MapStyle } from './MapControls';
import { machineDataAdapter } from '@/utils/machineDataAdapter';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

const containerStyle = {
  width: '100%',
  height: '100%'
};

const googleCenter = {
  lat: PARANA_BOUNDS.center[1],
  lng: PARANA_BOUNDS.center[0]
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
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  console.log('entrou:', mapStyle)

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const hasAdjustedInitialBounds = useRef(false);
  const [hoveredMachine, setHoveredMachine] = useState<string | undefined>();

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && mapStyle) {
      map.setMapTypeId(mapStyle);
    }
  }, [map, mapStyle]);

  // Efeito para ajustar os limites (fitBounds) na carga inicial
  useEffect(() => {
    if (!map || !isLoaded || hasAdjustedInitialBounds.current) return;
    
    const validMachines = machines.filter(machine => machineDataAdapter.hasValidCoordinates(machine));
    
    if (validMachines.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      validMachines.forEach(machine => {
        bounds.extend(new window.google.maps.LatLng(
          machine.deviceMessage.gps.latitude,
          machine.deviceMessage.gps.longitude
        ));
      });
      
      map.fitBounds(bounds, { top: 100, bottom: 100, left: 100, right: 100 });
      
      hasAdjustedInitialBounds.current = true;
    }
  }, [map, machines, isLoaded]);

  useEffect(() => {
    if (focusOnMachine && map && isLoaded) {
      const machine = machines.find(m => m.vehicleInfo.id === focusOnMachine);
      if (machine && machineDataAdapter.hasValidCoordinates(machine)) {
        const position = {
          lat: machine.deviceMessage.gps.latitude,
          lng: machine.deviceMessage.gps.longitude
        };
        map.panTo(position);
        map.setZoom(16);
      }
    }
  }, [focusOnMachine, map, machines, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  // Estado de Erro (seu fallback)
  if (loadError) {
    return (
      <div className="relative w-full h-full bg-background">
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
            <p className="font-medium">Erro ao carregar mapa!</p>
            <p className="text-xs mt-1 opacity-90">
              Para ver o mapa real, verifique sua chave da Google Maps API e as restrições no Google Cloud.
              <br />
              <span className="text-xs opacity-75">Obtenha em: console.cloud.google.com</span>
            </p>
          </div>
        </div>
        
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
      </div>
    );
  }

  // Renderização Principal do Mapa
  return (
    <div className="relative w-full h-full bg-background">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={googleCenter}
        zoom={PARANA_BOUNDS.zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        mapTypeId={mapStyle} // Usa a prop 'mapStyle' diretamente
        options={{
          disableDefaultUI: true,       // Remove todos os controles padrão
          zoomControl: true,          // Adiciona apenas o controle de zoom
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT // Posição igual ao Mapbox
          },
          mapTypeControl: false,      // Remove seletor de tipo de mapa (já temos o nosso)
          streetViewControl: false,   // Remove Street View
        }}
      >
        {/* Renderização dos marcadores */}
        {machines
          .filter(machine => machineDataAdapter.hasValidCoordinates(machine))
          .map(machine => {
            const machineAlerts = alerts.filter(alert => alert.machineId === machine.vehicleInfo.id && !alert.isRead);
            const isSelected = machine.vehicleInfo.id === selectedMachine;
            const isHovered = machine.vehicleInfo.id === hoveredMachine;
            let z = 1;
            if (isHovered) z = 500;
            if (isSelected) z = 1000;
            return (

              <OverlayViewF
                key={machine.vehicleInfo.id}
                position={{
                  lat: machine.deviceMessage.gps.latitude,
                  lng: machine.deviceMessage.gps.longitude
                }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                zIndex={z}
              >
                {/* 4. Adicione esta 'div' para centralizar o marcador */}
                <div style={{ transform: 'translate(-50%, -50%)', outline: 'none' }}>
                  <MachineMarker
                    machine={machine}
                    isSelected={selectedMachine === machine.vehicleInfo.id}
                    onClick={() => onMachineSelect(machine.vehicleInfo.id)}
                    alerts={machineAlerts}
                  />
                </div>
              </OverlayViewF>
            );
          })
        }
      </GoogleMap>
    </div>
  );
};

export default MachineMap;