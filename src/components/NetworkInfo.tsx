import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, RefreshCw } from 'lucide-react';
import { useNetwork } from '@/contexts/NetworkContext';

interface NetworkInfoProps {
  className?: string;
}

const NetworkInfo: React.FC<NetworkInfoProps> = ({ className = '' }) => {
  const { detectedIP, setDetectedIP, manualIP, setManualIP } = useNetwork();
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // Check if we're in development/localhost
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168') || hostname.includes('172.16');
    setIsLocalhost(isLocal);

    // Try to detect local IP address first
    if (isLocal) {
      detectLocalIP();
    }
  }, []);

  const detectLocalIP = async () => {
    setIsDetecting(true);
    setDebugInfo('Detecting network IP...');
    
    try {
      // Method 1: Try to get local IP through WebRTC
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));

      const ip = await new Promise<string | null>((resolve) => {
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
            if (match) {
              const ip = match[1];
              if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
                pc.close();
                resolve(ip);
                return;
              }
            }
          }
        };

        // Fallback after 3 seconds
        setTimeout(() => {
          pc.close();
          resolve(null);
        }, 3000);
      });

      if (ip) {
        setDetectedIP(ip);
        setDebugInfo(`Detected IP: ${ip}`);
      } else {
        // Method 2: Try common local IPs
        setDebugInfo('WebRTC failed, trying common IPs...');
        const commonIPs = ['192.168.1.100', '192.168.0.100', '10.0.0.100', '172.16.0.100'];
        
        // Try to ping these IPs
        for (const testIP of commonIPs) {
          try {
            const response = await fetch(`http://${testIP}:${window.location.port}/`, { 
              mode: 'no-cors',
              signal: AbortSignal.timeout(1000)
            });
            setDetectedIP(testIP);
            setDebugInfo(`Using common IP: ${testIP}`);
            break;
          } catch (error) {
            continue;
          }
        }
        
        if (!detectedIP) {
          setDebugInfo('IP detection failed. Please enter manually.');
        }
      }
    } catch (error) {
      console.log('Could not detect local IP:', error);
      setDebugInfo('IP detection error. Please enter manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleManualIPSubmit = () => {
    if (manualIP.trim()) {
      setManualIP(manualIP.trim());
    }
  };

  if (!isLocalhost) {
    return null; // Don't show network info in production
  }

  return (
    <div className={`p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="text-sm font-medium text-blue-800 mb-2">Network Connection</div>
      
      {detectedIP && (
        <div className="text-xs text-blue-700 mb-2">
          Detected IP: <strong>{detectedIP}</strong>
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          placeholder="Enter your network IP"
          value={manualIP}
          onChange={(e) => setManualIP(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border rounded"
        />
        <Button
          onClick={handleManualIPSubmit}
          size="sm"
          className="text-xs px-2 py-1"
        >
          Set IP
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={detectLocalIP}
          disabled={isDetecting}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          {isDetecting ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Wifi className="h-3 w-3" />
          )}
          {isDetecting ? 'Detecting...' : 'Detect IP'}
        </Button>
        
        {debugInfo && (
          <span className="text-xs text-blue-600">{debugInfo}</span>
        )}
      </div>
    </div>
  );
};

export default NetworkInfo;
