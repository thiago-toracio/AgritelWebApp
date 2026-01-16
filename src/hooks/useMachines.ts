import { useQuery } from "@tanstack/react-query";
import { machineService } from "@/services/api/machineService";

export const useMachines = () => {
    return useQuery({
        queryKey: ['machines'],
        queryFn: () => machineService.getMachines(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
