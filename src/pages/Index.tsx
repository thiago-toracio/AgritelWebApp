import { useState, useMemo, useEffect } from 'react';
import { MachineData, MachineAlertData } from '@/types/machine';
import { machineService } from '@/services/api/machineService';
import { machineDataAdapter } from '@/utils/machineDataAdapter';
import MachineMap from '@/components/MachineMap';
import MachineGrid from '@/components/MachineGrid';
import MachineSidebar from '@/components/MachineSidebar';
import MapControls, { MapStyle } from '@/components/MapControls';
import AlertsPanel from '@/components/AlertsPanel';
import MachineStatusPanel from '@/components/MachineStatusPanel';

const Index = () => {
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<string | undefined>();
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(false);
  const [isStatusPanelOpen, setIsStatusPanelOpen] = useState(false);
  const [statusPanelFilter, setStatusPanelFilter] = useState<string | undefined>();
  const [alerts, setAlerts] = useState<MachineAlertData[]>([]);
  const [focusOnMachine, setFocusOnMachine] = useState<string | undefined>();
  const [journeyStartDate, setJourneyStartDate] = useState<string | undefined>();
  
  // Load map style from localStorage or default to 'satellite'
  const [mapStyle, setMapStyle] = useState<MapStyle>(() => {
    const saved = localStorage.getItem('mapStyle');
    return (saved as MapStyle) || 'satellite';
  });

  // Fetch machines on mount and when journey start date changes
  useEffect(() => {
    loadMachines(true);
  }, []);

  useEffect(() => {
    if (journeyStartDate !== undefined) {
      loadMachines();
    }
  }, [journeyStartDate]);

  const loadMachines = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      }
      const data = await machineService.getMachines(journeyStartDate);
      setMachines(data);
      console.log('✅ Máquinas carregadas:', data.length, journeyStartDate ? `(desde ${journeyStartDate})` : '');
    } catch (error) {
      console.error('Failed to load machines:', error);
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      }
    }
  };

  // Gerar alertas com base nas máquinas
  const generatedAlerts = useMemo(() => {
    const newAlerts: MachineAlertData[] = [];
    
    machines.forEach(machine => {
      // Alerta de manutenção
      if (machine.deviceState.status === 'maintenance') {
        newAlerts.push({
          id: `maintenance-${machine.vehicleInfo.id}`,
          machineId: machine.vehicleInfo.id,
          type: 'maintenance',
          message: `${machine.vehicleInfo.name} requer manutenção programada`,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          resolved: Math.random() > 0.7
        });
      }
      
      // Alerta de combustível baixo
      const fuelLevel = machineDataAdapter.getFuel(machine);
      if (fuelLevel < 20) {
        newAlerts.push({
          id: `fuel-${machine.vehicleInfo.id}`,
          machineId: machine.vehicleInfo.id,
          type: 'warning',
          message: `Combustível baixo em ${machine.vehicleInfo.name} (${fuelLevel}%)`,
          timestamp: new Date(Date.now() - Math.random() * 1800000),
          resolved: Math.random() > 0.8
        });
      }
      
      // Alertas de telemetria
      if (machine.telemetry && machine.telemetry.engineTemp && machine.telemetry.engineTemp > 90) {
        newAlerts.push({
          id: `temp-${machine.vehicleInfo.id}`,
          machineId: machine.vehicleInfo.id,
          type: 'error',
          message: `Temperatura do motor alta em ${machine.vehicleInfo.name} (${machine.telemetry.engineTemp}°C)`,
          timestamp: new Date(Date.now() - Math.random() * 900000),
          resolved: Math.random() > 0.9
        });
      }
    });
    
    return newAlerts;
  }, [machines]);

  // Atualizar alertas quando as máquinas mudarem
  useMemo(() => {
    setAlerts(generatedAlerts);
  }, [generatedAlerts]);

  const handleMachineSelect = (machineId: string) => {
    setSelectedMachine(machineId);
    setIsSidebarOpen(true);
    
    // Focar na máquina no mapa
    setFocusOnMachine(machineId);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedMachine(undefined);
  };

  const handleToggleGrid = () => {
    setIsGridOpen(!isGridOpen);
  };

  const handleCloseGrid = () => {
    setIsGridOpen(false);
  };

  const handleToggleAlerts = () => {
    setIsAlertsPanelOpen(!isAlertsPanelOpen);
  };

  const handleCloseAlerts = () => {
    setIsAlertsPanelOpen(false);
  };

  const handleToggleStatus = (filter?: string) => {
    // Se o painel está aberto e clicamos no mesmo filtro, fecha
    if (isStatusPanelOpen && statusPanelFilter === filter) {
      setIsStatusPanelOpen(false);
      setStatusPanelFilter(undefined);
    } else {
      // Caso contrário, abre o painel (ou mantém aberto) e atualiza o filtro
      setStatusPanelFilter(filter);
      setIsStatusPanelOpen(true);
    }
  };

  const handleCloseStatus = () => {
    setIsStatusPanelOpen(false);
    setStatusPanelFilter(undefined);
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const handleViewMachineFromAlert = (machineId: string) => {
    // Selecionar a máquina e abrir o sidebar
    setSelectedMachine(machineId);
    setIsSidebarOpen(true);
    
    // Focar na máquina no mapa
    setFocusOnMachine(machineId);
    
    // TODO: Focar na máquina no mapa
    console.log(`Focando na máquina ${machineId} no mapa`);
  };

  const selectedMachineData = selectedMachine 
    ? machines.find(m => m.vehicleInfo.id === selectedMachine) 
    : null;

  const handleMapStyleChange = (style: MapStyle) => {
    setMapStyle(style);
    localStorage.setItem('mapStyle', style);
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold">Carregando máquinas...</div>
          <div className="text-muted-foreground">
            {import.meta.env.VITE_MOCK_DISABLED == 'false' ? '🔧 Modo Mock' : '🌐 API Real'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Full-screen Map */}
      <MachineMap
        machines={machines}
        selectedMachine={selectedMachine}
        onMachineSelect={handleMachineSelect}
        focusOnMachine={focusOnMachine}
        mapStyle={mapStyle}
        alerts={alerts}
      />

      {/* Map Controls */}
      <MapControls
        machines={machines}
        alerts={alerts}
        onToggleGrid={handleToggleGrid}
        onToggleAlerts={handleToggleAlerts}
        onToggleStatus={handleToggleStatus}
        onMapStyleChange={handleMapStyleChange}
        currentMapStyle={mapStyle}
        onRefresh={loadMachines}
        onJourneyStartChange={setJourneyStartDate}
      />

      {/* Machine Grid Overlay */}
      <MachineGrid
        machines={machines}
        isOpen={isGridOpen}
        onClose={handleCloseGrid}
        onMachineSelect={handleMachineSelect}
        selectedMachine={selectedMachine}
      />

      {/* Alerts Panel */}
      <AlertsPanel
        alerts={alerts}
        isOpen={isAlertsPanelOpen}
        onClose={handleCloseAlerts}
        onMarkAsRead={handleMarkAsRead}
        onViewMachine={handleViewMachineFromAlert}
      />

      {/* Machine Status Panel */}
      <MachineStatusPanel
        machines={machines}
        isOpen={isStatusPanelOpen}
        onClose={handleCloseStatus}
        onViewMachine={handleViewMachineFromAlert}
        initialFilter={statusPanelFilter}
      />

      {/* Machine Details Sidebar */}
      <MachineSidebar
        machine={selectedMachineData}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
};

export default Index;