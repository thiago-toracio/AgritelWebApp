interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

export const MachineCardSkeleton = () => (
  <div className="p-4 bg-card rounded-lg border border-border">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

export const MapSkeleton = () => (
  <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted-foreground/20" />
      <div className="h-4 w-32 mx-auto bg-muted-foreground/20 rounded" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-border">
    <td className="p-3"><Skeleton className="h-4 w-24" /></td>
    <td className="p-3"><Skeleton className="h-4 w-20" /></td>
    <td className="p-3"><Skeleton className="h-4 w-16" /></td>
    <td className="p-3"><Skeleton className="h-4 w-28" /></td>
  </tr>
);

export const SidebarSkeleton = () => (
  <div className="p-4 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-3 pt-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
