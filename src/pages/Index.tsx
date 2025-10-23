import { useState, useMemo, useEffect } from 'react';
import { MachineData, MachineAlert } from '@/types/machine';
import { machineService } from '@/services/api/machineService';
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
  const [alerts, setAlerts] = useState<MachineAlert[]>([]);
  const [focusOnMachine, setFocusOnMachine] = useState<string | undefined>();
  const [mapStyle, setMapStyle] = useState<MapStyle>('satellite');

  // Fetch machines on mount
  useEffect(() => {
    loadMachines(true);
  }, []);

  const loadMachines = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      }
      const data = await machineService.getMachines();
      setMachines(data);
      console.log('✅ Máquinas carregadas:', data.length);
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
    const newAlerts: MachineAlert[] = [];
    
    machines.forEach(machine => {
      // Alerta de manutenção
      if (machine.status === 'maintenance') {
        newAlerts.push({
          id: `maintenance-${machine.id}`,
          machineId: machine.id,
          type: 'maintenance',
          message: `${machine.name} requer manutenção programada`,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          resolved: Math.random() > 0.7
        });
      }
      
      // Alerta de combustível baixo
      if (machine.fuel < 20) {
        newAlerts.push({
          id: `fuel-${machine.id}`,
          machineId: machine.id,
          type: 'warning',
          message: `Combustível baixo em ${machine.name} (${machine.fuel}%)`,
          timestamp: new Date(Date.now() - Math.random() * 1800000),
          resolved: Math.random() > 0.8
        });
      }
      
      // Alertas de telemetria
      if (machine.telemetry.engineTemp > 90) {
        newAlerts.push({
          id: `temp-${machine.id}`,
          machineId: machine.id,
          type: 'error',
          message: `Temperatura do motor alta em ${machine.name} (${machine.telemetry.engineTemp}°C)`,
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

  const handleToggleStatus = () => {
    setIsStatusPanelOpen(!isStatusPanelOpen);
  };

  const handleCloseStatus = () => {
    setIsStatusPanelOpen(false);
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
    ? machines.find(m => m.id === selectedMachine) 
    : null;

  const handleMapStyleChange = (style: MapStyle) => {
    setMapStyle(style);
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