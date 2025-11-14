import { useState, useMemo, useEffect, useCallback } from 'react';
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

const validMapStyles: MapStyle[] = ["roadmap", "satellite", "hybrid", "terrain"];

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
  
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  
  const getDefaultJourneyStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return formatDateTimeLocal(today);
  };
  
  const [journeyStartTime, setJourneyStartTime] = useState<string>(getDefaultJourneyStart());
  
  const [mapStyle, setMapStyle] = useState<MapStyle>(() => {
    const saved = localStorage.getItem('mapStyle');
    if (saved && validMapStyles.includes(saved as MapStyle)) {
      return saved as MapStyle;
    }
    return 'satellite'; 
  });

  const [refreshInterval, setRefreshInterval] = useState<number>(() => {
    const saved = localStorage.getItem("refreshInterval");
    return saved ? parseInt(saved) : 30;
  });
  const [countdown, setCountdown] = useState(refreshInterval);
  
  const loadMachines = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      }
      const data = await machineService.getMachines(journeyStartTime);
      
      const readAlertIds = cookieManager.getReadAlerts();
      
      const machinesWithReadState = data.map(machine => ({
        ...machine,
        alerts: machine.alerts.map(alert => ({
          ...alert,
          machineName: machine.vehicleInfo.name,
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
  }, [journeyStartTime]);

  const handleRefresh = useCallback(() => {
    loadMachines();
  }, [loadMachines]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleRefresh, refreshInterval]);
  
  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
    setCountdown(interval);
    localStorage.setItem("refreshInterval", interval.toString());
  };

  useEffect(() => {
    localStorage.setItem('mapStyle', mapStyle);
  }, [mapStyle]);

  useEffect(() => {
    loadMachines(true);
  }, [loadMachines]);

  const consolidatedAlerts = useMemo(() => {
    const allAlerts: MachineAlertData[] = [];
    machines.forEach(machine => {
      if (machine.alerts && machine.alerts.length > 0) {
        allAlerts.push(...machine.alerts);
      }
    });
    return allAlerts;
  }, [machines]);

  useEffect(() => {
    const readAlertIds = cookieManager.getReadAlerts();
    const alertsWithReadState = consolidatedAlerts.map(alert => ({
      ...alert,
      isRead: alert.isRead || readAlertIds.includes(alert.id)
    }));
    setAlerts(alertsWithReadState);
  }, [consolidatedAlerts]);

  const handleMachineSelect = useCallback((machineId: string) => {
    setSelectedMachine(machineId);
    setIsSidebarOpen(true);
    setFocusOnMachine(machineId);
    setTimeout(() => {
      setFocusOnMachine(undefined);
    }, 2000);
  }, []);

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
    if (isStatusPanelOpen && statusPanelFilter === filter) {
      setIsStatusPanelOpen(false);
      setStatusPanelFilter(undefined);
    } else {
      setStatusPanelFilter(filter);
      setIsStatusPanelOpen(true);
    }
  };

  const handleCloseStatus = () => {
    setIsStatusPanelOpen(false);
    setStatusPanelFilter(undefined);
  };

  const handleMarkAsRead = (alertId: string) => {
    cookieManager.saveReadAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const handleViewMachineFromAlert = useCallback((machineId: string) => {
    setSelectedMachine(machineId);
    setIsSidebarOpen(true);
    setFocusOnMachine(machineId);
    setTimeout(() => {
      setFocusOnMachine(undefined);
    }, 2000);
  }, []);

  const selectedMachineData = selectedMachine 
    ? machines.find(m => m.vehicleInfo.id === selectedMachine) 
    : null;

  const handleMapStyleChange = (style: MapStyle) => {
    setMapStyle(style);
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold">Carregando máquinas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <MachineMap
        machines={machines}
        selectedMachine={selectedMachine}
        onMachineSelect={handleMachineSelect}
        focusOnMachine={focusOnMachine}
        mapStyle={mapStyle}
        alerts={alerts}
      />

      <MapControls
        machines={machines}
        alerts={alerts}
        onToggleGrid={handleToggleGrid}
        onToggleAlerts={handleToggleAlerts}
        onToggleStatus={handleToggleStatus}
        onMapStyleChange={handleMapStyleChange}
        currentMapStyle={mapStyle}
        onRefresh={handleRefresh}
        onJourneyStartChange={setJourneyStartTime}
        countdown={countdown}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={handleRefreshIntervalChange}
      />

      <MachineGrid
        machines={machines}
        isOpen={isGridOpen}
        onClose={handleCloseGrid}
        onMachineSelect={handleMachineSelect}
        selectedMachine={selectedMachine}
        journeyStartTime={journeyStartTime}
        countdown={countdown}
      />

      <AlertsPanel
        alerts={alerts}
        isOpen={isAlertsPanelOpen}
        onClose={handleCloseAlerts}
        onMarkAsRead={handleMarkAsRead}
        onViewMachine={handleViewMachineFromAlert}
      />

      <MachineStatusPanel
        machines={machines}
        isOpen={isStatusPanelOpen}
        onClose={handleCloseStatus}
        onViewMachine={handleViewMachineFromAlert}
        initialFilter={statusPanelFilter}
      />

      <MachineSidebar
        machine={selectedMachineData}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
};

export default Index;