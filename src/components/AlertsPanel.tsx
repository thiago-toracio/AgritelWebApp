import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  AlertTriangle, 
  Wrench, 
  Clock,
  CheckCircle,
  Eye,
  MapPin
} from 'lucide-react';
import { MachineAlert } from '@/types/machine';

interface AlertsPanelProps {
  alerts: MachineAlert[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (alertId: string) => void;
  onViewMachine: (machineId: string) => void;
}

const AlertsPanel = ({ 
  alerts, 
  isOpen, 
  onClose, 
  onMarkAsRead, 
  onViewMachine 
}: AlertsPanelProps) => {
  if (!isOpen) return null;

  const getAlertIcon = (type: MachineAlert['type']) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <X className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertVariant = (type: MachineAlert['type']) => {
    switch (type) {
      case 'maintenance':
        return 'secondary';
      case 'warning':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getAlertColor = (type: MachineAlert['type']) => {
    switch (type) {
      case 'maintenance':
        return 'text-blue-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.resolved);
  const readAlerts = alerts.filter(alert => alert.resolved);

  return (
    <div className="fixed top-0 left-0 h-full w-96 bg-gradient-overlay border-r border-border shadow-overlay backdrop-blur-sm z-50 animate-slide-left">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h2 className="text-xl font-semibold text-card-foreground">Alertas</h2>
              {unreadAlerts.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadAlerts.length}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ direction: 'rtl' }}>
          <div style={{ direction: 'ltr' }}>
            {/* Alertas não lidos */}
            {unreadAlerts.length > 0 && (
              <div className="mb-6">
                <div className="mb-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Não Lidos ({unreadAlerts.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {unreadAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 bg-card/50 hover:bg-muted/50 transition-colors rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className={getAlertColor(alert.type)}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                              {alert.type === 'maintenance' ? 'Manutenção' : 
                               alert.type === 'warning' ? 'Aviso' : 'Erro'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Máquina {alert.machineId}
                            </span>
                          </div>
                          <p className="text-sm text-card-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {alert.timestamp.toLocaleString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewMachine(alert.machineId)}
                              className="h-8 px-3 text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver Máquina
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onMarkAsRead(alert.id)}
                              className="h-8 px-3 text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Marcar Lido
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separador */}
            {unreadAlerts.length > 0 && readAlerts.length > 0 && (
              <Separator className="my-6" />
            )}

            {/* Alertas lidos */}
            {readAlerts.length > 0 && (
              <div className="mb-6">
                <div className="mb-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Lidos ({readAlerts.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {readAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 bg-muted/20 opacity-70 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-green-500">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {alert.type === 'maintenance' ? 'Manutenção' : 
                               alert.type === 'warning' ? 'Aviso' : 'Erro'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Máquina {alert.machineId}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {alert.timestamp.toLocaleString('pt-BR')}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewMachine(alert.machineId)}
                            className="h-8 px-3 text-xs opacity-70 hover:opacity-100"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            Ver Máquina
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado vazio */}
            {alerts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">Nenhum alerta</h3>
                  <p className="text-muted-foreground">
                    Todas as máquinas estão funcionando normalmente.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;