import { useState, useMemo } from 'react';
import { MachineData, MachineAlert } from '@/types/machine';
import { mockMachines } from '@/data/mockMachines';
import MachineMap from '@/components/MachineMap';
import MachineGrid from '@/components/MachineGrid';
import MachineSidebar from '@/components/MachineSidebar';
import MapControls from '@/components/MapControls';
import AlertsPanel from '@/components/AlertsPanel';

const Index = () => {
  const [machines] = useState<MachineData[]>(mockMachines);
  const [selectedMachine, setSelectedMachine] = useState<string | undefined>();
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(false);
  const [alerts, setAlerts] = useState<MachineAlert[]>([]);
  const [focusOnMachine, setFocusOnMachine] = useState<string | undefined>();

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

  // Mock map control handlers
  const handleMeasureDistance = () => console.log('Medir distância');
  const handleShowAreas = () => console.log('Mostrar áreas');
  const handleShowAreasList = () => console.log('Mostrar lista de áreas');
  const handleDrawPolygon = () => console.log('Desenhar polígono');
  const handleDrawCircle = () => console.log('Desenhar círculo');

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Full-screen Map */}
      <MachineMap
        machines={machines}
        selectedMachine={selectedMachine}
        onMachineSelect={handleMachineSelect}
        focusOnMachine={focusOnMachine}
      />

      {/* Map Controls */}
      <MapControls
        machines={machines}
        alerts={alerts}
        onToggleGrid={handleToggleGrid}
        onMeasureDistance={handleMeasureDistance}
        onShowAreas={handleShowAreas}
        onShowAreasList={handleShowAreasList}
        onDrawPolygon={handleDrawPolygon}
        onDrawCircle={handleDrawCircle}
        onToggleAlerts={handleToggleAlerts}
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