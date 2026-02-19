"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllRouteOptions } from "@/features/funnels/routes";

interface RouteSelectorProps {
  activeRoute: string;
  onRouteChange: (route: string) => void;
}

const routeOptions = getAllRouteOptions();

export function RouteSelector({ activeRoute, onRouteChange }: RouteSelectorProps) {
  return (
    <Select value={activeRoute} onValueChange={(value) => onRouteChange(value)}>
      <SelectTrigger className="w-full h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-xs">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
