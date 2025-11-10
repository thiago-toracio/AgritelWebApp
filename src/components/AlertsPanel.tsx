import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { X, AlertTriangle, CheckCircle, Eye, Search } from 'lucide-react';
import { MachineAlertData } from '@/types/machine';

interface AlertsPanelProps {
  alerts: MachineAlertData[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (alertId: string) => void;
  onViewMachine: (machineId: string) => void;
}

const AlertsPanel = ({ alerts, isOpen, onClose, onMarkAsRead, onViewMachine }: AlertsPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar alertas por busca
  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    const query = searchQuery.toLowerCase();
    return alerts.filter(alert =>
      alert.machineName.toLowerCase().includes(query) ||
      alert.messageReason.toLowerCase().includes(query) ||
      (alert.messageDetails && alert.messageDetails.toLowerCase().includes(query))
    );
  }, [alerts, searchQuery]);

  const unreadAlerts = filteredAlerts.filter(alert => !alert.isRead);
  const readAlerts = filteredAlerts.filter(alert => alert.isRead);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg font-semibold">Alertas</CardTitle>
          {unreadAlerts.length > 0 && (
            <Badge variant="destructive" className="px-2 py-0.5 text-xs">
              {unreadAlerts.length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 relative">
        <div className="absolute left-7 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
        <Input
          placeholder="Buscar alertas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Alertas não lidos */}
        {unreadAlerts.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground">
              Não Lidos ({unreadAlerts.length})
            </div>
            {unreadAlerts.map((alert) => (
              <Card key={alert.id} className="border-yellow-500">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium">Alerta</span>
                    </div>
                    <Badge variant="destructive" className="px-2 py-0.5 text-xs">
                      Novo
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Máquina {alert.machineName}</p>
                    <p className="text-sm">{alert.messageReason}</p>
                    {alert.messageDetails && (
                      <p className="text-sm text-muted-foreground">{alert.messageDetails}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.startDateTime).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewMachine(alert.machineId)}
                      className="h-8 px-3 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Máquina
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onMarkAsRead(alert.id)}
                      className="h-8 px-3 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Marcar Lido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Separador */}
        {unreadAlerts.length > 0 && readAlerts.length > 0 && (
          <Separator className="my-4" />
        )}

        {/* Alertas lidos */}
        {readAlerts.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground">
              Lidos ({readAlerts.length})
            </div>
            {readAlerts.map((alert) => (
              <Card key={alert.id} className="opacity-70 hover:opacity-100 transition-opacity">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">Alerta</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{alert.machineName}</p>
                    <p className="text-sm">{alert.messageReason}</p>
                    {alert.messageDetails && (
                      <p className="text-sm text-muted-foreground">{alert.messageDetails}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.startDateTime).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewMachine(alert.machineId)}
                      className="h-8 px-3 text-xs opacity-70 hover:opacity-100"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Máquina
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {filteredAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            <p className="font-medium">
              {searchQuery ? 'Nenhum alerta encontrado' : 'Nenhum alerta'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? 'Tente buscar por outro nome de máquina'
                : 'Todas as máquinas estão funcionando normalmente.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;