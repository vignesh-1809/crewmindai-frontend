import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { checkBackendHealth } from '@/lib/api';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      const healthy = await checkBackendHealth();
      setIsConnected(healthy);
      setLastChecked(new Date());
    } catch {
      setIsConnected(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return (
      <Badge variant="secondary" className={className}>
        <AlertCircle className="w-3 h-3 mr-1" />
        Checking...
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className={className}
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 mr-1" />
          Connected
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </>
      )}
    </Badge>
  );
};

export default ConnectionStatus;
