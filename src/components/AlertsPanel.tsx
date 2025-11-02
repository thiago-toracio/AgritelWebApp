import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  X, 
  AlertTriangle, 
  Wrench, 
  Clock,
  CheckCircle,
  Eye,
  MapPin,
  Search
} from 'lucide-react';
import { MachineAlertData } from '@/types/machine';

interface AlertsPanelProps {
  alerts: MachineAlertData[];
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtrar alertas por busca
  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    
    const query = searchQuery.toLowerCase();
    return alerts.filter(alert => 
      alert.machineId.toLowerCase().includes(query) ||
      alert.messageReason.toLowerCase().includes(query) ||
      (alert.messageDetails && alert.messageDetails.toLowerCase().includes(query))
    );
  }, [alerts, searchQuery]);

  const unreadAlerts = filteredAlerts.filter(alert => !alert.isRead);
  const readAlerts = filteredAlerts.filter(alert => alert.isRead);
  
  if (!isOpen) return null;

  // Determinar tipo de alerta baseado no alertType
  const getAlertType = (alertType: number): 'maintenance' | 'warning' | 'error' => {
    // Mapeamento de alertType para tipo visual
    if (alertType === 1) return 'maintenance';
    if (alertType === 2 || alertType === 3) return 'warning';
    return 'error';
  };

  const getAlertIcon = (alertType: number) => {
    const type = getAlertType(alertType);
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

  const getAlertVariant = (alertType: number) => {
    const type = getAlertType(alertType);
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

  const getAlertColor = (alertType: number) => {
    const type = getAlertType(alertType);
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

  return (
    <div className="fixed top-0 left-0 h-full w-96 bg-gradient-overlay border-r border-border shadow-overlay backdrop-blur-sm z-50 animate-slide-left">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
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
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar máquina..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
                        <div className={getAlertColor(alert.alertType)}>
                          {getAlertIcon(alert.alertType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getAlertVariant(alert.alertType)} className="text-xs">
                              {getAlertType(alert.alertType) === 'maintenance' ? 'Manutenção' : 
                               getAlertType(alert.alertType) === 'warning' ? 'Aviso' : 'Erro'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Máquina {alert.machineId}
                            </span>
                          </div>
                          <p className="text-sm text-card-foreground font-medium mb-1">{alert.messageReason}</p>
                          {alert.messageDetails && (
                            <p className="text-xs text-muted-foreground mb-2">{alert.messageDetails}</p>
                          )}
                          <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.startDateTime).toLocaleString('pt-BR')}
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
                              {getAlertType(alert.alertType) === 'maintenance' ? 'Manutenção' : 
                               getAlertType(alert.alertType) === 'warning' ? 'Aviso' : 'Erro'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Máquina {alert.machineId}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">{alert.messageReason}</p>
                          {alert.messageDetails && (
                            <p className="text-xs text-muted-foreground/70 mb-2">{alert.messageDetails}</p>
                          )}
                          <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.startDateTime).toLocaleString('pt-BR')}
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
            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery ? 'Nenhum alerta encontrado' : 'Nenhum alerta'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'Tente buscar por outro nome de máquina'
                      : 'Todas as máquinas estão funcionando normalmente.'
                    }
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