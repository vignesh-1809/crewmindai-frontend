import React from 'react';
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import QRConnect from "@/components/QRConnect";
import NetworkInfo from "@/components/NetworkInfo";
import { NetworkProvider } from "@/contexts/NetworkContext";
import { Smartphone, Mic, MessageSquare, ArrowLeft, Wifi, QrCode, PhoneCall, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MobileConnectivityContent = () => {
  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="h-full max-w-7xl mx-auto p-3">
        {/* Compact Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NavLink to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
                <ArrowLeft className="h-4 w-4" />
                Back
              </NavLink>
              <div>
                <h1 className="text-xl font-bold text-foreground">Mobile Connectivity</h1>
                <p className="text-xs text-muted-foreground">Connect your device for voice assistance</p>
              </div>
            </div>
            {/* Quick Status Indicators */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                Ready
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 h-[calc(100vh-100px)]">
          {/* QR Code Section - Direct QR Display */}
          <div className="col-span-5">
            <Card className="border border-border bg-card h-full">
              <CardContent className="text-center p-6">
                <div className="glass rounded-lg border p-4 mb-4">
                  <QRConnect />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Communication Options - Main Section */}
          <div className="col-span-4">
            <Card className="border border-border bg-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <PhoneCall className="h-4 w-4 text-accent" />
                  Communication Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded border border-primary/20">
                  <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                    <MessageSquare className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-xs">Text Chat</div>
                  </div>
                  <NavLink to="/workspace">
                    <Button variant="outline" size="sm" className="text-xs px-2 h-6">Open</Button>
                  </NavLink>
                </div>

                <div className="flex items-center gap-2 p-2 bg-accent/5 rounded border border-accent/20">
                  <div className="w-6 h-6 bg-accent/10 rounded flex items-center justify-center">
                    <Mic className="h-3 w-3 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-xs">Desktop Voice</div>
                  </div>
                  <NavLink to="/voice-chat">
                    <Button variant="outline" size="sm" className="text-xs px-2 h-6">Open</Button>
                  </NavLink>
                </div>

                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded border border-primary/20">
                  <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                    <Smartphone className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-xs">Mobile Voice</div>
                  </div>
                  <NavLink to="/mobile-voice" target="_blank">
                    <Button variant="outline" size="sm" className="text-xs px-2 h-6">Open</Button>
                  </NavLink>
                </div>

                {/* Quick Setup Steps - Compact */}
                <div className="mt-3 p-2 bg-muted/20 rounded border">
                  <div className="text-xs font-medium text-foreground mb-2">Quick Setup:</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-primary/10 text-primary rounded flex items-center justify-center text-xs font-bold border border-primary/20">1</div>
                      <span className="text-muted-foreground">Scan QR</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-accent/10 text-accent rounded flex items-center justify-center text-xs font-bold border border-accent/20">2</div>
                      <span className="text-muted-foreground">Grant Mic</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-primary/10 text-primary rounded flex items-center justify-center text-xs font-bold border border-primary/20">3</div>
                      <span className="text-muted-foreground">Hold & Speak</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-accent/10 text-accent rounded flex items-center justify-center text-xs font-bold border border-accent/20">4</div>
                      <span className="text-muted-foreground">Get Response</span>
                    </div>
                  </div>
                </div>

                {/* Network Info - Moved here from QR code area */}
                <NetworkInfo className="mt-3" />
              </CardContent>
            </Card>
          </div>

          {/* Status & Help Section */}
          <div className="col-span-3 space-y-2">
            {/* Connection Status */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                  <Wifi className="h-3 w-3 text-accent" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between p-1 bg-accent/10 rounded border border-accent/20">
                  <span className="font-medium text-foreground text-xs">Network</span>
                  <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 text-xs">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-1 bg-primary/10 rounded border border-primary/20">
                  <span className="font-medium text-foreground text-xs">Device</span>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                    Ready
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-1 bg-accent/10 rounded border border-accent/20">
                  <span className="font-medium text-foreground text-xs">Voice</span>
                  <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 text-xs">
                    Available
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card className="border border-border bg-card flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                  <HelpCircle className="h-3 w-3 text-accent" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="p-1 bg-accent/5 rounded border border-accent/20">
                    <div className="font-medium text-foreground text-xs">Mic issues?</div>
                    <div className="text-muted-foreground text-xs">Check permissions</div>
                  </div>
                  <div className="p-1 bg-accent/5 rounded border border-accent/20">
                    <div className="font-medium text-foreground text-xs">Connection?</div>
                    <div className="text-muted-foreground text-xs">Same WiFi network</div>
                  </div>
                  <div className="p-1 bg-accent/5 rounded border border-accent/20">
                    <div className="font-medium text-foreground text-xs">Still stuck?</div>
                    <div className="text-muted-foreground text-xs">Try desktop voice</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileConnectivity = () => {
  return (
    <NetworkProvider>
      <MobileConnectivityContent />
    </NetworkProvider>
  );
};

export default MobileConnectivity;