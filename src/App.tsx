import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Workspace from "./pages/Workspace";
import Ingest from "./pages/Ingest";
import About from "./pages/About";
import Contact from "./pages/Contact";
import VoiceChat from "./pages/VoiceChat";
import MobileVoice from "./pages/MobileVoice";
import MobileConnectivity from "./pages/MobileConnectivity";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/ingest" element={<Ingest />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/voice-chat" element={<VoiceChat />} />
          <Route path="/mobile-connectivity" element={<MobileConnectivity />} />
        </Route>
        {/* Mobile voice interface - standalone route without layout */}
        <Route path="/mobile-voice" element={<MobileVoice />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
