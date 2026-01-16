import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { format, parseISO, isSameDay, addMonths, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { CalendarIcon, Tractor, ChevronDown, Clock, Activity, Gauge, Fuel } from 'lucide-react';
import { telemetryService, MapReportResponse, ActiveDayInfo } from '@/services/api/telemetryService';
import { machineService } from '@/services/api/machineService';
import { MachineData } from '@/types/machine';
import { useToast } from '@/hooks/use-toast';
import HistoryMap from './HistoryMap';
import { LoadingTractor } from './LoadingTractor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  machineName: string;
}

export const HistoryModal = ({ isOpen, onClose, machineId: initialMachineId, machineName: initialMachineName }: HistoryModalProps) => {
  const [currentMachineId, setCurrentMachineId] = useState(initialMachineId);
  const [machinesList, setMachinesList] = useState<MachineData[]>([]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  
  const [month, setMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [mapData, setMapData] = useState<MapReportResponse | null>(null);
  const [activeDays, setActiveDays] = useState<ActiveDayInfo[]>([]);
  const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'working' | 'dislocating' | 'stopped'>('all');
  const [maxActiveSectionsFilter, setMaxActiveSectionsFilter] = useState<number | null>(null);

  // Sync props to state when modal opens with different machine
  useEffect(() => {
    if (isOpen) {
        setCurrentMachineId(initialMachineId);
    }
  }, [isOpen, initialMachineId]);

  // Fetch machines list
  useEffect(() => {
      if (isOpen && machinesList.length === 0) {
          machineService.getMachines().then(setMachinesList).catch(console.error);
      }
  }, [isOpen, machinesList.length]); // Added machinesList.length to avoid re-fetching if already loaded

  // Calculate max sections from data (highest active section index)
  const maxSections = useMemo(() => {
    if (!mapData?.geoJson?.features?.length) return 7; // default
    let maxIdx = -1;
    for (const f of mapData.geoJson.features) {
       const sections = f.properties?.sections as boolean[] | undefined;
       if (Array.isArray(sections)) {
           for (let i = sections.length - 1; i >= 0; i--) {
               if (sections[i]) { // Relaxed check (truthy)
                   if (i > maxIdx) maxIdx = i;
                   break;
               }
           }
       }
    }
    return Math.max(0, maxIdx + 1);
  }, [mapData]);

  // Reset date to today whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDateRange({ from: new Date(), to: new Date() });
      setMonth(new Date());
    }
  }, [isOpen]);

  // Handle date selection with 7-day limit
  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setDateRange(range);
      return;
    }

    if (range.to) {
      const days = differenceInDays(range.to, range.from);
      if (Math.abs(days) > 6) { // > 6 means 7 days span (0-indexed diff)
        toast({
          title: "Período Ajustado",
          description: "O intervalo máximo permitido é de 7 dias.",
          duration: 3000,
        });
        
        // Truncate to 7 days
        const newTo = addDays(range.from, 6);
        setDateRange({ from: range.from, to: newTo });
        return;
      }
    }
    
    setDateRange(range);
  };

  // Fetch active days efficiently (accumulate and cache months)
  useEffect(() => {
    if (isOpen && currentMachineId) {
      const loadMonth = async (date: Date) => {
        const year = date.getFullYear();
        const monthNum = date.getMonth() + 1;
        const key = `${currentMachineId}-${year}-${monthNum}`; // Include machineId in key

        if (fetchedMonths.has(key)) return;

        try {
          // Mark as fetching to avoid duplicate calls
          setFetchedMonths(prev => new Set(prev).add(key));
          
          const response = await telemetryService.getActiveDays(currentMachineId, year, monthNum);
          if (response.activeDays) {
            setActiveDays(prev => {
              // Merge avoiding duplicates
              const newDays = response.activeDays!.filter(
                newD => !prev.some(currD => currD.date === newD.date) // This might duplicate across machines if we don't clear activeDays on machine switch.
                // Actually we should clear activeDays when machine changes.
              );
              return [...prev, ...newDays];
            });
          }
        } catch (err) {
          console.error(`Failed to fetch active days for ${key}`, err);
          // Remove from fetched set on error so we can retry? 
          // For now, keep it to avoid loops
        }
      };

      // Load visible month and next month (calendar shows 2 months)
      loadMonth(month);
      loadMonth(addMonths(month, 1));
      
      // Also ensure we have the last 31 days data loaded initially even if not in view
      // Actually, if we open on today, 'month' is this month. 'month-1' might be needed
      // User asked: "saber de hoje até 31 dias para trás". 
      // If today is Jan 5, we need Dec.
      const lastMonth = addMonths(new Date(), -1);
      loadMonth(lastMonth);
    }
  }, [isOpen, currentMachineId, month, fetchedMonths]); // Dependencies updated

  // Clear active days when machine changes
  useEffect(() => {
      setActiveDays([]);
      setFetchedMonths(new Set());
  }, [currentMachineId]);

  // Fetch map report when date range changes
  const fetchMapReport = async () => {
    if (!dateRange?.from || !currentMachineId) return;

    setIsLoading(true);
    try {
      const start = new Date(dateRange.from);
      start.setHours(0, 0, 0, 0);
      
      const end = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      end.setHours(23, 59, 59, 999);

      const response = await telemetryService.getMapReport(currentMachineId, start, end);
      setMapData(response);
      
      if (!response.geoJson?.features?.length) {
        toast({
          title: "Sem dados",
          description: "Nenhum histórico encontrado para o período selecionado.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Falha ao carregar histórico.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && dateRange?.from) {
      fetchMapReport();
    }
  }, [isOpen, dateRange, currentMachineId]);

  const handleMonthChange = (newMonth: Date) => setMonth(newMonth);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-screen h-screen flex flex-col p-0 gap-0 overflow-hidden bg-background rounded-none border-none">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-card z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Tractor className="h-5 w-5 text-primary" />
              </div>
              <div>
                 {/* Machine Selector */}
                 <Select value={currentMachineId} onValueChange={setCurrentMachineId}>
                    <SelectTrigger className="h-8 w-[200px] border-none bg-transparent hover:bg-muted/50 p-0 text-lg font-bold shadow-none focus:ring-0">
                        <SelectValue placeholder={initialMachineName} />
                    </SelectTrigger>
                    <SelectContent>
                        {machinesList.map(m => (
                            <SelectItem key={m.vehicleInfo.id} value={m.vehicleInfo.id}>
                                {m.vehicleInfo.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
                <p className="text-xs text-muted-foreground">Histórico de Operação</p>
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-8 mx-2" />

            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-[240px] justify-start text-left font-normal ${!dateRange && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Selecione um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                  locale={ptBR}
                  month={month} 
                  onMonthChange={handleMonthChange}
                  components={{
                    DayContent: (props) => {
                      const activeInfo = activeDays.find(d => isSameDay(parseISO(d.date), props.date));
                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative flex items-center justify-center w-full h-full cursor-pointer p-2 hover:bg-accent rounded-full transition-colors">
                                <span className={activeInfo ? 'font-bold' : ''}>{props.date.getDate()}</span>
                                {activeInfo && (
                                  <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${activeInfo.type === 'Working' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                )}
                              </div>
                            </TooltipTrigger>
                            {activeInfo && <TooltipContent><p>{activeInfo.summary}</p></TooltipContent>}
                          </Tooltip>
                        </TooltipProvider>
                      )
                    }
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* Filters - Modernized */}
            {mapData && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l h-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Filtro:</span>
                  <Select 
                    value={statusFilter} 
                    onValueChange={(v: 'all' | 'working' | 'dislocating' | 'stopped') => setStatusFilter(v)}
                  >
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="working">Trabalhando</SelectItem>
                      <SelectItem value="dislocating">Deslocando</SelectItem>
                      <SelectItem value="stopped">Parado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Seções ≤ {maxActiveSectionsFilter ?? maxSections}</span>
                  <div className="w-[100px]">
                    <Slider
                      value={[maxActiveSectionsFilter ?? maxSections]}
                      min={0}
                      max={maxSections}
                      step={1}
                      onValueChange={(v) => setMaxActiveSectionsFilter(v[0])}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="sr-only">Fechar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar Stats */}
          <aside className="w-80 border-r bg-background flex flex-col z-20 shadow-md">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {mapData?.total && (
                  <>
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Tempo Total
                          </span>
                          <span className="text-lg font-bold">{mapData.total.hourmeterIgnition}</span>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Trabalhando</p>
                            <p className="font-semibold text-green-600">{mapData.total.hourmeterWorked} h</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Área & Dist.
                          </span>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Área Coberta</span>
                            <span className="text-lg font-bold">{mapData.total.totalArea?.toFixed(2) || '0.00'} ha</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Distância</span>
                            <span className="font-semibold">{mapData.total.odometer?.toFixed(2) || '0.00'} km</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Gauge className="w-4 h-4" /> Performance
                          </span>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Veloc. Média</p>
                            <p className="font-semibold">{mapData.range?.speed?.avg?.toFixed(1) || '0.0'} km/h</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Veloc. Máx</p>
                            <p className="font-semibold">{mapData.range?.speed?.max?.toFixed(1) || '0.0'} km/h</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground flex items-center gap-1"><Fuel className="w-3 h-3"/> Combustível</span>
                            <span className="font-bold">{mapData.total.fuelConsumption?.toFixed(1) || '0.0'} L</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {!mapData && !isLoading && (
                  <div className="text-center py-10 text-muted-foreground opacity-50">
                    <Tractor className="w-12 h-12 mx-auto mb-2" />
                    <p>Selecione um período para visualizar os dados</p>
                  </div>
                )}
              </div>
            </ScrollArea>

          </aside>

          <div className="flex-1 bg-muted/20 relative min-h-0">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 backdrop-blur-sm">
                <LoadingTractor />
              </div>
            ) : (
              mapData && (
                <HistoryMap 
                  geoJson={mapData.geoJson} 
                  ranges={mapData.range}
                  statusFilter={statusFilter}
                  maxActiveSectionsFilter={maxActiveSectionsFilter}
                  averageFuel={mapData.total.averageFuelConsumption}
                  averagePitch={mapData.total.averagePitch}
                />
              )
            )}
            
            {!isLoading && (!mapData || !mapData.geoJson?.features?.length) && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado para exibir no mapa</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
