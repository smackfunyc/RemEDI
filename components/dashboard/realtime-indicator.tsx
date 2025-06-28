'use client';

import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeIndicatorProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export function RealtimeIndicator({ isActive, onToggle }: RealtimeIndicatorProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {isActive ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">Real-time Updates</span>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
        />
        {isActive && (
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-green-500 rounded-full pulse-animation"></div>
            <span className="text-xs text-green-500">Live</span>
          </div>
        )}
      </div>
    </Card>
  );
}