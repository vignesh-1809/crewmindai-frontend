import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { RealisticMachine } from '@/components/machines/RealisticMachines';

// Loading placeholder
function MachineLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#94a3b8" opacity={0.5} transparent />
    </mesh>
  );
}

export default function Ingest() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [form, setForm] = useState({ name: '', posX: 0, posZ: 0 });

  const loadMachines = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
    const r = await fetch(`${API_BASE_URL}/api/machines`);
    const data = await r.json();
    setMachines(data || []);
  };

  useEffect(() => { loadMachines(); }, []);

  const onUpload = async () => {
    if (!files || files.length === 0) return;
    if (!selectedId) { setStatus('Please select a machine.'); return; }
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('files', f));
    try {
      setBusy(true);
      setStatus('Uploading and indexing...');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const params = selectedId ? `?machineId=${encodeURIComponent(selectedId)}` : '';
      const resp = await fetch(`${API_BASE_URL}/api/ingest/upload${params}`, { method: 'POST', body: form });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Upload failed');
      setStatus(`Indexed ${data.upserted} document(s) to Pinecone.`);
    } catch (e: any) {
      setStatus(e.message || 'Failed to ingest. If the file is large, try a smaller one or contact admin to raise MAX_UPLOAD_MB.');
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async () => {
    try {
      setBusy(true);
      setStatus('Creating machine...');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const resp = await fetch(`${API_BASE_URL}/api/machines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Create failed');
      setStatus('Machine created.');
      setForm({ name: '', posX: 0, posZ: 0 });
      await loadMachines();
    } catch (e: any) {
      setStatus(e.message || 'Failed to create machine.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="rounded-xl border p-4 bg-card">
        <h2 className="text-lg font-semibold mb-3">Machines</h2>
        <div className="max-h-60 overflow-auto border rounded-md">
          {machines.map((m) => (
            <label key={m.id} className={`flex items-center justify-between px-3 py-2 border-b last:border-b-0 ${selectedId===m.id?'bg-secondary':''}`}>
              <div className="flex-1">
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">pos {m.posX.toFixed(1)}, {m.posZ.toFixed(1)}</div>
              </div>
              <input type="radio" name="machine" checked={selectedId===m.id} onChange={() => setSelectedId(m.id)} />
            </label>
          ))}
        </div>

        <h3 className="text-sm font-medium mt-4 mb-2">Add new machine</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="col-span-2" />
          <Input type="number" step="0.1" placeholder="posX" value={form.posX} onChange={(e)=>setForm({...form,posX:parseFloat(e.target.value)})} />
          <Input type="number" step="0.1" placeholder="posZ" value={form.posZ} onChange={(e)=>setForm({...form,posZ:parseFloat(e.target.value)})} />
        </div>
        <div className="mt-2"><Button onClick={onCreate} disabled={busy || !form.name}>Create</Button></div>
      </section>

      <section className="rounded-xl border p-4 bg-card">
        <h2 className="text-lg font-semibold mb-3">Factory Floor Layout</h2>
        <div className="h-72 rounded-md overflow-hidden border">
          <Canvas camera={{ position: [10, 8, 12], fov: 45 }} shadows="soft">
            <Suspense fallback={<MachineLoader />}>
              {/* Professional environment lighting */}
              <Environment preset="city" background={false} />
              
              {/* Key lighting for dramatic effect */}
              <directionalLight 
                position={[12, 16, 6]} 
                intensity={1.0} 
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={80}
                shadow-camera-left={-25}
                shadow-camera-right={25}
                shadow-camera-top={25}
                shadow-camera-bottom={-25}
                shadow-bias={-0.0001}
              />
              
              {/* Fill lights */}
              <directionalLight position={[-12, 12, -6]} intensity={0.3} />
              <ambientLight intensity={0.2} />
            
              {/* Factory floor with contact shadows */}
              <group>
                <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.01,0]} receiveShadow>
                  <planeGeometry args={[50,50]} />
                  <meshStandardMaterial 
                    color="#e5e7eb" 
                    metalness={0.1} 
                    roughness={0.95}
                    envMapIntensity={0.3}
                  />
                </mesh>
                
                <ContactShadows 
                  position={[0, -0.005, 0]} 
                  opacity={0.25} 
                  scale={50} 
                  blur={2.0} 
                  far={8} 
                />
              </group>

              {/* Simplified factory structure */}
              <group>
                <mesh position={[0, 5, -25]} receiveShadow>
                  <boxGeometry args={[50, 10, 1]} />
                  <meshStandardMaterial 
                    color="#9ca3af" 
                    metalness={0.1} 
                    roughness={0.8}
                    envMapIntensity={0.2}
                  />
                </mesh>
                <mesh position={[-25, 5, 0]} receiveShadow>
                  <boxGeometry args={[1, 10, 50]} />
                  <meshStandardMaterial 
                    color="#9ca3af" 
                    metalness={0.1} 
                    roughness={0.8}
                    envMapIntensity={0.2}
                  />
                </mesh>
              </group>

              {/* Safety markings */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[8, 8.2, 0, Math.PI * 2]} />
                <meshStandardMaterial 
                  color="#fbbf24" 
                  metalness={0.1} 
                  roughness={0.9}
                  transparent
                  opacity={0.7}
                />
              </mesh>

              {/* Realistic machines */}
              {machines.map((m)=> (
                <RealisticMachine 
                  key={m.id} 
                  position={[m.posX, 0, m.posZ]} 
                  name={m.name}
                  selected={selectedId === m.id}
                  machineType={m.name}
                />
              ))}
            </Suspense>
            
            <OrbitControls 
              enableDamping 
              dampingFactor={0.05}
              minDistance={4}
              maxDistance={30}
              maxPolarAngle={Math.PI / 2.1}
            />
          </Canvas>
        </div>

        <h2 className="text-lg font-semibold mt-6 mb-3">Attach documents</h2>
        <input type="file" accept=".pdf,text/plain" multiple onChange={(e) => setFiles(e.target.files)} />
        <div className="flex gap-2 mt-2">
          <Button onClick={onUpload} disabled={busy || !files || files.length === 0 || !selectedId}>Upload and Index</Button>
        </div>
        {status && <div className="text-sm text-muted-foreground mt-2">{status}</div>}
      </section>
    </div>
  );
}


