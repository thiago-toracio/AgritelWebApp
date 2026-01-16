import { Tractor } from 'lucide-react';

interface LoadingTractorProps {
  message?: string;
  subtitle?: string;
}

export const LoadingTractor = ({ 
  message = 'Carregando dados...', 
  subtitle = 'Processando telemetria' 
}: LoadingTractorProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        {/* Animated Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[spin_3s_linear_infinite]" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-[spin_1.5s_linear_infinite]" />
        
        {/* Bouncing Tractor */}
        <div className="relative p-6 bg-background rounded-full shadow-xl animate-bounce">
          <Tractor className="w-12 h-12 text-primary" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-semibold text-foreground animate-pulse">
          {message}
        </span>
        {subtitle && (
          <span className="text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
