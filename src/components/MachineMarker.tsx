import React, { memo } from "react";
import { MachineData, MachineAlertData } from "@/types/machine";
import {
  AlertTriangle,
  Gauge,
  MapPin,
  Activity,
  User,
  FileText,
  Timer,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MachineIcon from "./MachineIcons";
import { machineDataAdapter } from "@/utils/machineDataAdapter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MachineMarkerProps {
  machine: MachineData;
  isSelected: boolean;
  onClick: () => void;
  alerts: MachineAlertData[];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const MachineMarker: React.FC<MachineMarkerProps> = ({
  machine,
  isSelected,
  onClick,
  alerts,
  onMouseEnter,
  onMouseLeave,
}) => {
  const statusColor = machineDataAdapter.getStatusColor(machine);
  const statusTooltip = machineDataAdapter.getStatusTooltip(machine);
  const unreadAlerts = alerts.filter((alert) => !alert.isRead);
  const hasUnreadAlerts = unreadAlerts.length > 0;
  const heading = machineDataAdapter.getHeading(machine);
  const icon = machineDataAdapter.getIcon(machine);
  const name = machineDataAdapter.getName(machine);

  const getStatusColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: "text-green-500",
      yellow: "text-yellow-500",
      blue: "text-blue-500",
      red: "text-red-500",
      gray: "text-gray-500",
    };
    return colors[color] || "text-gray-500";
  };

  const hasInfo =
    machine.deviceMessage.operator ||
    machineDataAdapter.getNotation(machine) ||
    machine.deviceMessage.area;

  const hasTelemetry =
    (machine.telemetry?.odometer !== undefined &&
      machine.telemetry.odometer > 0) ||
    (machine.telemetry?.operationHours !== undefined &&
      machine.telemetry.operationHours > 0);

  const IconWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-5 flex justify-center flex-shrink-0">{children}</div>
  );

  return (
    <div
      className="cursor-pointer group transition-all duration-200"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-300"
        )}
      >
        <MachineIcon
          icon={icon}
          heading={heading}
          size={48}
          className={cn(
            "transition-all duration-300",
            "shadow-lg hover:shadow-2xl hover:scale-125 hover:brightness-110",
            "hover:outline-none",
            isSelected && "scale-125 shadow-glow ring-4 ring-primary/50"
          )}
        />

        {hasUnreadAlerts && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-warning rounded-full flex items-center justify-center px-1 gap-0.5">
            <AlertTriangle className="w-3 h-3 text-background flex-shrink-0" />
            <span className="text-[10px] font-bold text-background">
              {unreadAlerts.length}
            </span>
          </div>
        )}
      </div>

      {/* Container de Posicionamento e Animação de Entrada/Saída */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-[10000] translate-y-2 group-hover:translate-y-0 delay-300 group-hover:delay-0">
        
        {/* CORREÇÃO AQUI:
            Removi o 'group-hover:min-w-[260px]' e fixei 'min-w-[260px]'.
            Assim ele não muda de tamanho quando o mouse sai.
        */}
        <div className="bg-card border-2 border-primary/20 rounded-lg px-4 py-3 shadow-2xl backdrop-blur-md min-w-[260px] max-w-[280px] transition-all duration-300 ring-1 ring-primary/10">
          
          <div className="flex items-start justify-between gap-3 mb-1">
            <div 
              className="text-sm font-bold text-card-foreground line-clamp-2 leading-tight" 
              title={name}
            >
              {name}
            </div>
            {hasUnreadAlerts && (
              <div className="flex items-center gap-1 text-warning flex-shrink-0 pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{unreadAlerts.length}</span>
              </div>
            )}
          </div>

          <div
            className={`text-xs font-semibold mb-3 ${getStatusColorClass(
              statusColor
            )}`}
          >
            {statusTooltip}
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-muted/50 rounded-lg px-2 py-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold">
                  Velocidade
                </div>
                <div className="text-sm font-bold text-card-foreground leading-none mt-0.5">
                  {machineDataAdapter.getSpeed(machine)} <span className="text-[10px] font-normal text-muted-foreground">km/h</span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-muted/50 rounded-lg px-2 py-2 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold">
                  RPM
                </div>
                <div className="text-sm font-bold text-card-foreground leading-none mt-0.5">
                  {machineDataAdapter.getRpm(machine).toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {machine.deviceMessage.operator && (
              <div className="flex items-center gap-2">
                <IconWrapper>
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </IconWrapper>
                <span className="text-xs font-medium text-card-foreground truncate">
                  {machine.deviceMessage.operator}
                </span>
              </div>
            )}

            {machineDataAdapter.getNotation(machine) && (
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <IconWrapper>
                    <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                  </IconWrapper>
                  <span className="text-xs font-medium text-card-foreground line-clamp-2 leading-tight">
                    {machineDataAdapter.getNotation(machine)?.code} -{" "}
                    {machineDataAdapter.getNotation(machine)?.name}
                  </span>
                </div>
                {machineDataAdapter.getNotation(machine)
                  ?.registrationTime && (
                  <div className="text-[10px] text-muted-foreground pl-9 -mt-0.5">
                    {format(
                      new Date(
                        machineDataAdapter.getNotation(
                          machine
                        )!.registrationTime!
                      ),
                      "dd/MM/yyyy 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </div>
                )}
              </div>
            )}

            {machine.deviceMessage.area && (
              <div className="flex items-center gap-2">
                <IconWrapper>
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                </IconWrapper>
                <span className="text-xs font-medium text-card-foreground truncate">
                  {machine.deviceMessage.area}
                </span>
              </div>
            )}

            {hasTelemetry && (
              <>
                {hasInfo && <div className="border-t border-border pt-1.5 mt-1.5" />}

                {machine.telemetry?.odometer !== undefined &&
                  machine.telemetry.odometer > 0 && (
                    <div className="flex items-center gap-2">
                      <IconWrapper>
                        <Route className="w-3.5 h-3.5 text-muted-foreground" />
                      </IconWrapper>
                      <span className="text-xs text-card-foreground">
                        <span className="font-medium text-muted-foreground">Odômetro:</span>{" "}
                        <span className="font-semibold">{machine.telemetry.odometer.toFixed(1)} km</span>
                      </span>
                    </div>
                  )}

                {machine.telemetry?.operationHours !== undefined &&
                  machine.telemetry.operationHours > 0 && (
                    <div className="flex items-center gap-2">
                      <IconWrapper>
                        <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                      </IconWrapper>
                      <span className="text-xs text-card-foreground">
                        <span className="font-medium text-muted-foreground">Horímetro:</span>{" "}
                        <span className="font-semibold">{machine.telemetry.operationHours.toFixed(1)} h</span>
                      </span>
                    </div>
                  )}
              </>
            )}

            <div
              className={cn(
                "flex items-center gap-2",
                (hasInfo || hasTelemetry) && "pt-1.5 mt-1.5 border-t border-border"
              )}
            >
              <IconWrapper>
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              </IconWrapper>
              <span className="text-[10px] text-muted-foreground font-medium">
                {machine.deviceMessage.gps.latitude.toFixed(6)},{" "}
                {machine.deviceMessage.gps.longitude.toFixed(6)}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
            Atualizado:{" "}
            <span className="font-medium text-foreground">
            {format(
              new Date(machine.deviceMessage.lastUpdate),
              "dd/MM/yyyy HH:mm:ss",
              { locale: ptBR }
            )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MachineMarker);