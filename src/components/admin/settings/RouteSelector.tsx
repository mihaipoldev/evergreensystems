"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Route = '/' | '/outbound-system';

interface RouteSelectorProps {
  activeRoute: Route;
  onRouteChange: (route: Route) => void;
}

const routeOptions: { value: Route; label: string }[] = [
  { value: '/', label: 'Landing Page' },
  { value: '/outbound-system', label: 'Outbound Systems' },
];

export function RouteSelector({ activeRoute, onRouteChange }: RouteSelectorProps) {
  return (
    <Select value={activeRoute} onValueChange={(value) => onRouteChange(value as Route)}>
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
