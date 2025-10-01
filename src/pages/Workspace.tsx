import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { useEffect, useState, Suspense } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Smartphone } from "lucide-react";
import { RealisticMachine } from "@/components/machines/RealisticMachines";

// Loading component for machines
function MachineLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#94a3b8" opacity={0.5} transparent />
    </mesh>
  );
}

export default function Workspace() {
  const [selected, setSelected] = useState<string | null>(null);
  const [machines, setMachines] = useState<{ id: string; name: string; posX: number; posZ: number }[]>([]);

  useEffect(() => {
    const handler = (e: any) => {
      const name = e?.detail as string;
      if (name) setSelected(name);
    };
    window.addEventListener('assistant:focus', handler);
    return () => window.removeEventListener('assistant:focus', handler);
  }, []);

  useEffect(() => {
    // Load machines from API so Workspace mirrors the Ingest 3D space
    const load = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
        const r = await fetch(`${API_BASE_URL}/api/machines`);
        const data = await r.json();
        if (Array.isArray(data)) setMachines(data);
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="h-[calc(100svh-4rem)] overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="overflow-hidden h-full">
        <ResizablePanel defaultSize={65} minSize={40}>
          <section className="h-full bg-card">
            <div className="absolute z-10 left-4 top-4 flex gap-2">
              <NavLink to="/ingest"><Button size="sm" variant="secondary">Train Model</Button></NavLink>
            </div>
            <h1 className="sr-only">3D Warehouse Visualization</h1>
            <div className="h-full">
              <Canvas camera={{ position: [10, 8, 12], fov: 45 }} shadows="soft">
                <Suspense fallback={null}>
                  {/* Photorealistic environment lighting */}
                  <Environment preset="warehouse" />
                  
                  {/* Key light for dramatic industrial look */}
                  <directionalLight 
                    position={[15, 20, 8]} 
                    intensity={1.2} 
                    castShadow
                    shadow-mapSize={[4096, 4096]}
                    shadow-camera-far={100}
                    shadow-camera-left={-30}
                    shadow-camera-right={30}
                    shadow-camera-top={30}
                    shadow-camera-bottom={-30}
                    shadow-bias={-0.0001}
                  />
                  
                  {/* Fill lights */}
                  <directionalLight position={[-15, 15, -8]} intensity={0.4} />
                  <directionalLight position={[8, 12, -15]} intensity={0.3} />
                  
                  {/* Ambient for overall illumination */}
                  <ambientLight intensity={0.2} />

                  {/* Realistic factory floor with contact shadows */}
                  <group>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                      <planeGeometry args={[60, 60]} />
                      <meshStandardMaterial 
                        color="#e5e7eb" 
                        metalness={0.1} 
                        roughness={0.95}
                        envMapIntensity={0.3}
                      />
                    </mesh>
                    
                    {/* Contact shadows for more realistic ground interaction */}
                    <ContactShadows 
                      position={[0, -0.005, 0]} 
                      opacity={0.3} 
                      scale={60} 
                      blur={2.5} 
                      far={10} 
                    />
                  </group>

                  {/* Simplified factory structure for better performance */}
                  <group>
                    {/* Back wall */}
                    <mesh position={[0, 6, -30]} receiveShadow>
                      <boxGeometry args={[60, 12, 1]} />
                      <meshStandardMaterial 
                        color="#9ca3af" 
                        metalness={0.1} 
                        roughness={0.8}
                        envMapIntensity={0.2}
                      />
                    </mesh>
                    
                    {/* Left wall */}
                    <mesh position={[-30, 6, 0]} receiveShadow>
                      <boxGeometry args={[1, 12, 60]} />
                      <meshStandardMaterial 
                        color="#9ca3af" 
                        metalness={0.1} 
                        roughness={0.8}
                        envMapIntensity={0.2}
                      />
                    </mesh>

                    {/* High ceiling structure */}
                    <mesh position={[0, 12, 0]}>
                      <boxGeometry args={[60, 0.5, 60]} />
                      <meshStandardMaterial 
                        color="#6b7280" 
                        metalness={0.4} 
                        roughness={0.6}
                        envMapIntensity={0.5}
                      />
                    </mesh>

                    {/* Support beams */}
                    <mesh position={[0, 10, -25]} rotation={[0, Math.PI / 2, 0]}>
                      <cylinderGeometry args={[0.3, 0.3, 60]} />
                      <meshStandardMaterial 
                        color="#374151" 
                        metalness={0.8} 
                        roughness={0.2}
                        envMapIntensity={0.8}
                      />
                    </mesh>
                    <mesh position={[0, 10, 25]} rotation={[0, Math.PI / 2, 0]}>
                      <cylinderGeometry args={[0.3, 0.3, 60]} />
                      <meshStandardMaterial 
                        color="#374151" 
                        metalness={0.8} 
                        roughness={0.2}
                        envMapIntensity={0.8}
                      />
                    </mesh>
                  </group>

                  {/* Safety markings */}
                  <group>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                      <ringGeometry args={[10, 10.3, 0, Math.PI * 2]} />
                      <meshStandardMaterial 
                        color="#fbbf24" 
                        metalness={0.1} 
                        roughness={0.9}
                        transparent
                        opacity={0.8}
                      />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[18, 0.02, 18]}>
                      <ringGeometry args={[4, 4.2, 0, Math.PI * 2]} />
                      <meshStandardMaterial 
                        color="#fbbf24" 
                        metalness={0.1} 
                        roughness={0.9}
                        transparent
                        opacity={0.8}
                      />
                    </mesh>
                  </group>

                  {/* Realistic Machines */}
                  {machines.length > 0 ? (
                    machines.map((m) => (
                      <RealisticMachine
                        key={m.id}
                        position={[m.posX, 0, m.posZ]}
                        name={m.name}
                        onSelect={setSelected}
                        selected={selected === m.name}
                        machineType={m.name}
                      />
                    ))
                  ) : (
                    <RealisticMachine 
                      position={[0, 0, 0]} 
                      name="CNC Mill A" 
                      onSelect={setSelected} 
                      selected={selected === 'CNC Mill A'}
                      machineType="cnc mill"
                    />
                  )}
                </Suspense>

                <OrbitControls 
                  enableDamping 
                  dampingFactor={0.05}
                  minDistance={5}
                  maxDistance={50}
                  maxPolarAngle={Math.PI / 2.2}
                />
              </Canvas>
            </div>
          </section>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35} minSize={25}>
          <aside className="h-full flex flex-col">
            <div className="px-4 md:px-5 py-3 border-b flex items-center justify-between">
              <span className="text-sm font-medium text-foreground/80">Text Chat Assistant</span>
              <NavLink to="/mobile-voice" target="_blank">
                <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile Voice
                </Button>
              </NavLink>
            </div>
            <div className="flex-1 p-3 md:p-4 overflow-hidden">
              <ChatPanel selected={selected} machines={machines.map(m=>m.name)} />
            </div>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* Footer hint removed to prevent page scroll */}
    </div>
  );
}
