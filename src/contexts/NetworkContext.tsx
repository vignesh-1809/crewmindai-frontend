import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NetworkContextType {
  detectedIP: string;
  setDetectedIP: (ip: string) => void;
  manualIP: string;
  setManualIP: (ip: string) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [detectedIP, setDetectedIP] = useState<string>('');
  const [manualIP, setManualIP] = useState<string>('');

  return (
    <NetworkContext.Provider value={{
      detectedIP,
      setDetectedIP,
      manualIP,
      setManualIP,
    }}>
      {children}
    </NetworkContext.Provider>
  );
};
