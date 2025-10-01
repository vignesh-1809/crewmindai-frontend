import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Copy, Check, Wifi, RefreshCw, Globe, Shield } from 'lucide-react';
import { useNetwork } from '@/contexts/NetworkContext';

interface QRConnectProps {
  className?: string;
  showNetworkInfo?: boolean;
}

const QRConnect: React.FC<QRConnectProps> = ({ className = '', showNetworkInfo = false }) => {
  const { detectedIP, manualIP } = useNetwork();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [mobileUrl, setMobileUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isProduction, setIsProduction] = useState(false);
  const [productionUrl, setProductionUrl] = useState<string>('');

  useEffect(() => {
    // Check if we're in development/localhost or production
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168') || hostname.includes('172.16');
    const isProd = !isLocal && (hostname.includes('vercel.app') || hostname.includes('netlify.app') || hostname.includes('railway.app') || hostname.includes('render.com') || hostname.includes('github.io'));
    
    setIsLocalhost(isLocal);
    setIsProduction(isProd);

    if (isProd) {
      // Production: Use HTTPS URL
      const currentUrl = window.location.origin;
      const mobileVoiceUrl = `${currentUrl}/mobile-voice`;
      setMobileUrl(mobileVoiceUrl);
      setProductionUrl(mobileVoiceUrl);
      
      const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileVoiceUrl)}`;
      setQrCodeUrl(qrServiceUrl);
    }
  }, []);

  // Update QR code when IP changes (development only)
  useEffect(() => {
    if (!isLocalhost || isProduction) return;
    
    const port = window.location.port;
    let ipToUse = '';
    
    // Priority: manual IP > detected IP
    if (manualIP) {
      ipToUse = manualIP;
    } else if (detectedIP) {
      ipToUse = detectedIP;
    }
    
    if (ipToUse) {
      // Development: Use HTTP (will show warning)
      const networkUrl = `http://${ipToUse}:${port}/mobile-voice`;
      setMobileUrl(networkUrl);
      
      // Generate QR code with network IP
      const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(networkUrl)}`;
      setQrCodeUrl(qrServiceUrl);
    }
  }, [detectedIP, manualIP, isLocalhost, isProduction]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Connect Mobile Device</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Scan QR code or visit the URL on your mobile device to start voice chat
        </p>

        {/* Production Status */}
        {isProduction && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Production Mode - HTTPS Enabled</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Microphone access will work properly on mobile devices
            </p>
          </div>
        )}

        {/* Development Warning */}
        {isLocalhost && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Development Mode</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              HTTP connection - microphone access limited. Deploy to production for full functionality.
            </p>
          </div>
        )}

        {/* QR Code - Now more prominent */}
        <div className="mb-4">
          <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code for mobile voice interface"
                className="w-56 h-56 mx-auto"
                onError={(e) => {
                  // Fallback if QR service is unavailable
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-56 h-56 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Wifi className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Loading QR Code...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* URL */}
        <div className="mb-4">
          <Badge variant="secondary" className="mb-2">
            {isProduction ? (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Production URL
              </span>
            ) : (
              "Mobile URL"
            )}
          </Badge>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md text-sm">
            <code className="flex-1 text-left">{mobileUrl}</code>
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-left text-xs text-gray-600 space-y-1">
          <p><strong>Method 1:</strong> Scan the QR code with your phone camera</p>
          <p><strong>Method 2:</strong> Copy the URL and open it in your mobile browser</p>
          <p><strong>Method 3:</strong> Connect via Bluetooth (if supported)</p>
        </div>

        {/* Deployment Instructions */}
        {isLocalhost && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">Ready to Deploy?</div>
            <p className="text-xs text-blue-700 mb-2">
              Deploy to Vercel, Netlify, or Railway for HTTPS and full microphone access.
            </p>
            <div className="text-xs text-blue-600">
              <strong>Next steps:</strong> Push to Git → Deploy → Get HTTPS URL → Update QR Code
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default QRConnect;
