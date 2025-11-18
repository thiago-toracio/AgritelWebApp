import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  GoogleMap,
  useLoadScript,
  OverlayViewF,
  OverlayView,
} from "@react-google-maps/api";
import useSupercluster from "use-supercluster";
import { MachineData, MachineAlertData } from "@/types/machine";
import MachineMarker from "./MachineMarker";
import FallbackMachineMarker from "./FallbackMachineMarker";
import { PARANA_BOUNDS } from "@/lib/mapbox";
import { MapStyle } from "./MapControls";
import { machineDataAdapter } from "@/utils/machineDataAdapter";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

const containerStyle = {
  width: "100%",
  height: "100%",
};

const googleCenter = {
  lat: PARANA_BOUNDS.center[1],
  lng: PARANA_BOUNDS.center[0],
};

const CLUSTER_RADIUS = 100;
const MAX_ZOOM_CLUSTER = 11;

interface MachineMapProps {
  machines: MachineData[];
  selectedMachine?: string;
  onMachineSelect: (machineId: string) => void;
  focusOnMachine?: string;
  mapStyle: MapStyle;
  alerts: MachineAlertData[];
  isClustering: boolean;
}

const MachineMap = ({
  machines,
  selectedMachine,
  onMachineSelect,
  focusOnMachine,
  mapStyle,
  alerts,
  isClustering,
}: MachineMapProps) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const hasAdjustedInitialBounds = useRef(false);

  const [bounds, setBounds] = useState<number[] | null>(null);
  const [zoom, setZoom] = useState<number>(PARANA_BOUNDS.zoom);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    handleMapIdle(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && mapStyle) {
      map.setMapTypeId(mapStyle);
    }
  }, [map, mapStyle]);

  useEffect(() => {
    if (!map || !isLoaded || hasAdjustedInitialBounds.current) return;

    const validMachines = machines.filter((machine) =>
      machineDataAdapter.hasValidCoordinates(machine)
    );

    if (validMachines.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      validMachines.forEach((machine) => {
        bounds.extend(
          new window.google.maps.LatLng(
            machine.deviceMessage.gps.latitude,
            machine.deviceMessage.gps.longitude
          )
        );
      });

      map.fitBounds(bounds, { top: 100, bottom: 100, left: 100, right: 100 });

      hasAdjustedInitialBounds.current = true;
    }
  }, [map, machines, isLoaded]);

  useEffect(() => {
    if (focusOnMachine && map && isLoaded) {
      const machine = machines.find((m) => m.vehicleInfo.id === focusOnMachine);
      if (machine && machineDataAdapter.hasValidCoordinates(machine)) {
        const position = {
          lat: machine.deviceMessage.gps.latitude,
          lng: machine.deviceMessage.gps.longitude,
        };
        map.panTo(position);
        map.setZoom(16);
      }
    }
  }, [focusOnMachine, map, machines, isLoaded]);

  const handleMapIdle = (mapInstance?: google.maps.Map) => {
    const currentMap = mapInstance || map;
    if (!currentMap) return;

    const newZoom = currentMap.getZoom();
    if (newZoom) setZoom(newZoom);

    const newBounds = currentMap.getBounds();
    if (newBounds) {
      const ne = newBounds.getNorthEast();
      const sw = newBounds.getSouthWest();
      setBounds([sw.lng(), sw.lat(), ne.lng(), ne.lat()]);
    }
  };

  const points = useMemo(
    () =>
      machines
        .filter((m) => machineDataAdapter.hasValidCoordinates(m))
        .map((machine) => ({
          type: "Feature",
          properties: {
            cluster: false,
            machine: machine,
            machineId: machine.vehicleInfo.id,
          },
          geometry: {
            type: "Point",
            coordinates: [
              machine.deviceMessage.gps.longitude,
              machine.deviceMessage.gps.latitude,
            ],
          },
        })),
    [machines]
  );

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: {
      radius: CLUSTER_RADIUS,
      maxZoom: MAX_ZOOM_CLUSTER,
    },
  });

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

  return (
    <TooltipProvider>
      <div className="relative w-full h-full bg-background">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={googleCenter}
          zoom={PARANA_BOUNDS.zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          mapTypeId={mapStyle}
          onIdle={handleMapIdle}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
              position: window.google.maps.ControlPosition.TOP_RIGHT,
            },
            mapTypeControl: false,
            streetViewControl: false,
            clickableIcons: false,
          }}
        >
          {isClustering
            ? clusters.map((cluster) => {
                const [longitude, latitude] = cluster.geometry.coordinates;
                const {
                  cluster: isCluster,
                  point_count: pointCount,
                  machine,
                } = cluster.properties;

                if (isCluster) {
                  const size = 35 + (pointCount / points.length) * 20;
                  const tooltipText = `${pointCount} ${
                    pointCount > 1 ? "máquinas agrupadas" : "máquina agrupada"
                  } nesta região`;

                  return (
                    <OverlayViewF
                      key={`cluster-${cluster.id}`}
                      position={{ lat: latitude, lng: longitude }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="relative"
                            style={{
                              width: `${size}px`,
                              height: `${size}px`,
                              transform: "translate(-50%, -50%)",
                            }}
                            onClick={() => {
                              if (!map) return;
                              const zoomParaDesagrupar = MAX_ZOOM_CLUSTER + 1;
                              map.setZoom(zoomParaDesagrupar);
                              map.panTo({ lat: latitude, lng: longitude });
                            }}
                          >
                            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping z-0"></span>
                            <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-blue-500 text-white border-2 border-white/50 shadow-lg cursor-pointer transition-all hover:scale-110">
                              <span className="text-sm font-bold">
                                {pointCount}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    </OverlayViewF>
                  );
                }

                const machineAlerts = alerts.filter(
                  (alert) =>
                    alert.machineId === machine.vehicleInfo.id && !alert.isRead
                );
                const isSelected = machine.vehicleInfo.id === selectedMachine;

                let z = 1;
                if (isSelected) z = 1000;

                return (
                  <OverlayViewF
                    key={machine.vehicleInfo.id}
                    position={{ lat: latitude, lng: longitude }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    zIndex={z}
                  >
                    <div
                      style={{
                        transform: "translate(-50%, -50%)",
                        outline: "none",
                      }}
                    >
                      <MachineMarker
                        machine={machine}
                        isSelected={isSelected}
                        onClick={() => onMachineSelect(machine.vehicleInfo.id)}
                        alerts={machineAlerts}
                      />
                    </div>
                  </OverlayViewF>
                );
              })
            : machines
                .filter((machine) =>
                  machineDataAdapter.hasValidCoordinates(machine)
                )
                .map((machine) => {
                  const machineAlerts = alerts.filter(
                    (alert) =>
                      alert.machineId === machine.vehicleInfo.id &&
                      !alert.isRead
                  );
                  const isSelected = machine.vehicleInfo.id === selectedMachine;

                  let z = 1;
                  if (isSelected) z = 1000;

                  return (
                    <OverlayViewF
                      key={machine.vehicleInfo.id}
                      position={{
                        lat: machine.deviceMessage.gps.latitude,
                        lng: machine.deviceMessage.gps.longitude,
                      }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                      zIndex={z}
                    >
                      <div
                        style={{
                          transform: "translate(-50%, -50%)",
                          outline: "none",
                        }}
                      >
                        <MachineMarker
                          machine={machine}
                          isSelected={
                            selectedMachine === machine.vehicleInfo.id
                          }
                          onClick={() =>
                            onMachineSelect(machine.vehicleInfo.id)
                          }
                          alerts={machineAlerts}
                        />
                      </div>
                    </OverlayViewF>
                  );
                })}
        </GoogleMap>
      </div>
    </TooltipProvider>
  );
};

export default React.memo(MachineMap);