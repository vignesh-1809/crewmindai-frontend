import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { ConnectionStatus } from "@/components/ConnectionStatus";

export function TopNav() {
  return (
    <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <NavLink to="/" className="text-sm font-semibold tracking-wide story-link">CrewMind</NavLink>
      </div>
      <nav className="hidden md:flex items-center gap-6 text-sm">
        <NavLink to="/workspace" className="story-link">Workspace</NavLink>
        <NavLink to="/voice-chat" className="story-link">Voice Chat</NavLink>
        <NavLink to="/ingest" className="story-link">Ingest</NavLink>
        <NavLink to="/about" className="story-link">About</NavLink>
        <NavLink to="/contact" className="story-link">Contact</NavLink>
        
      </nav>
      <div className="flex items-center gap-2">
        <ConnectionStatus className="hidden md:inline-flex" />
        <Button variant="glass" size="sm">Request demo</Button>
      </div>
    </div>
  );
}
