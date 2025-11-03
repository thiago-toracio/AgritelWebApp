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
import { cookieManager } from '@/utils/cookieManager';

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
  
  // Helper to format date without timezone (no Z)
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  
  // Initialize with today at 00:00 as default
  const getDefaultJourneyStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return formatDateTimeLocal(today);
  };
  
  const [journeyStartTime, setJourneyStartTime] = useState<string>(getDefaultJourneyStart());
  
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
    loadMachines();
  }, [journeyStartTime]);

  const loadMachines = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      }
      const data = await machineService.getMachines(journeyStartTime);
      
      // Aplicar estado de leitura dos cookies aos alertas
      const readAlertIds = cookieManager.getReadAlerts();
      
      const machinesWithReadState = data.map(machine => ({
        ...machine,
        alerts: machine.alerts.map(alert => ({
          ...alert,
          isRead: alert.isRead || readAlertIds.includes(alert.id)
        }))
      }));
      
      setMachines(machinesWithReadState);
    } catch (error) {
      console.error('Failed to load machines:', error);
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      }
    }
  };

  // Consolidar alertas de todas as máquinas
  const consolidatedAlerts = useMemo(() => {
    const allAlerts: MachineAlertData[] = [];
    
    machines.forEach(machine => {
      if (machine.alerts && machine.alerts.length > 0) {
        allAlerts.push(...machine.alerts);
      }
    });
    
    return allAlerts;
  }, [machines]);

  // Atualizar alertas quando as máquinas mudarem e aplicar estado de leitura dos cookies
  useEffect(() => {
    const readAlertIds = cookieManager.getReadAlerts();
    const alertsWithReadState = consolidatedAlerts.map(alert => ({
      ...alert,
      isRead: alert.isRead || readAlertIds.includes(alert.id)
    }));
    setAlerts(alertsWithReadState);
  }, [consolidatedAlerts]);

  const handleMachineSelect = (machineId: string) => {
    setSelectedMachine(machineId);
    setIsSidebarOpen(true);
    
    // Focar na máquina no mapa
    setFocusOnMachine(machineId);
    
    // Limpar o foco após um tempo para não ficar preso
    setTimeout(() => {
      setFocusOnMachine(undefined);
    }, 2000);
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
    // Salvar no localStorage (50h)
    cookieManager.saveReadAlert(alertId);
    
    // Atualizar estado local
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const handleViewMachineFromAlert = (machineId: string) => {
    // Selecionar a máquina e abrir o sidebar
    setSelectedMachine(machineId);
    setIsSidebarOpen(true);
    
    // Focar na máquina no mapa
    setFocusOnMachine(machineId);
    
    // Limpar o foco após um tempo para não ficar preso
    setTimeout(() => {
      setFocusOnMachine(undefined);
    }, 2000);
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
        onJourneyStartChange={setJourneyStartTime}
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