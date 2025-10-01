import { useGLTF, Html } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

// Loading component for when models are being loaded
function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" opacity={0.5} transparent />
    </mesh>
  );
}

// Enhanced CNC Machine with more realistic geometry
function DetailedCNCMachine({ position, name, onSelect, selected }: { position: [number, number, number]; name: string; onSelect?: (n: string) => void; selected?: boolean; }) {
  const handleClick = () => onSelect?.(name);
  
  return (
    <group position={position} onClick={handleClick}>
      {/* Main machine base with more detail */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 1.6]} />
        <meshStandardMaterial 
          color={selected ? "#2563eb" : "#4a5568"} 
          metalness={0.8} 
          roughness={0.2}
          envMapIntensity={1.0}
        />
      </mesh>
      
      {/* Machine bed/table */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.08, 1.3]} />
        <meshStandardMaterial color="#718096" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Y-axis linear guide rails */}
      <mesh position={[-0.8, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 0.06, 1.4]} />
        <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.8, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 0.06, 1.4]} />
        <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* X-axis gantry */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.15, 0.15]} />
        <meshStandardMaterial 
          color={selected ? "#3b82f6" : "#2d3748"} 
          metalness={0.7} 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Z-axis spindle housing */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.6]} />
        <meshStandardMaterial 
          color={selected ? "#1d4ed8" : "#1a202c"} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Spindle */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.3]} />
        <meshStandardMaterial color="#f7fafc" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Control panel */}
      <mesh position={[1.2, 1.1, 0]} rotation={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.8, 0.1]} />
        <meshStandardMaterial 
          color={selected ? "#3b82f6" : "#2d3748"} 
          metalness={0.4} 
          roughness={0.6} 
        />
      </mesh>
      
      {/* Control panel screen */}
      <mesh position={[1.25, 1.2, 0]} rotation={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.4, 0.02]} />
        <meshStandardMaterial color="#000" emissive="#0f172a" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Electrical cabinet */}
      <mesh position={[1.1, 0.4, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.8, 0.3]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Coolant tank */}
      <mesh position={[-1.0, 0.3, -0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6]} />
        <meshStandardMaterial color="#065f46" metalness={0.7} roughness={0.3} />
      </mesh>

      <Html center distanceFactor={12} occlude>
        <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
          selected ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
        }`}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// Enhanced Industrial Robot Arm with more realistic articulation
function DetailedRobotArm({ position, name, onSelect, selected }: { position: [number, number, number]; name: string; onSelect?: (n: string) => void; selected?: boolean; }) {
  const handleClick = () => onSelect?.(name);
  
  return (
    <group position={position} onClick={handleClick}>
      {/* Base platform */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.2]} />
        <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Base rotation joint */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.5]} />
        <meshStandardMaterial 
          color={selected ? "#dc2626" : "#7f1d1d"} 
          metalness={0.7} 
          roughness={0.3} 
        />
      </mesh>
      
      {/* First arm segment (shoulder) */}
      <mesh position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 8]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshStandardMaterial 
          color={selected ? "#ef4444" : "#991b1b"} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Shoulder joint */}
      <mesh position={[0.1, 1.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Second arm segment (forearm) */}
      <mesh position={[0.5, 1.5, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1.0, 0.2]} />
        <meshStandardMaterial 
          color={selected ? "#f87171" : "#b91c1c"} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Elbow joint */}
      <mesh position={[0.8, 1.8, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.12]} />
        <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Wrist assembly */}
      <mesh position={[1.1, 1.6, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial 
          color={selected ? "#fca5a5" : "#dc2626"} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* End effector (gripper) */}
      <group position={[1.2, 1.4, 0]}>
        <mesh position={[0, 0, -0.05]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.15, 0.02]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.15, 0.02]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      
      {/* Cables/conduits */}
      <mesh position={[0.3, 1.0, 0]} rotation={[0, 0, Math.PI / 6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.8} />
      </mesh>

      <Html center distanceFactor={12} occlude>
        <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
          selected ? 'bg-red-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
        }`}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// Enhanced Conveyor Belt with more realistic details
function DetailedConveyorBelt({ position, name, onSelect, selected }: { position: [number, number, number]; name: string; onSelect?: (n: string) => void; selected?: boolean; }) {
  const handleClick = () => onSelect?.(name);
  
  return (
    <group position={position} onClick={handleClick}>
      {/* Main frame structure */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.3, 1.2]} />
        <meshStandardMaterial 
          color={selected ? "#10b981" : "#065f46"} 
          metalness={0.6} 
          roughness={0.4} 
        />
      </mesh>
      
      {/* Belt surface with texture pattern */}
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.04, 1.0]} />
        <meshStandardMaterial 
          color={selected ? "#059669" : "#064e3b"} 
          metalness={0.2} 
          roughness={0.9} 
        />
      </mesh>
      
      {/* Drive roller (motor end) */}
      <mesh position={[-2.0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Idler roller (tail end) */}
      <mesh position={[2.0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Support rollers underneath */}
      {[-1.2, -0.4, 0.4, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.0]} />
          <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      
      {/* Motor housing */}
      <mesh position={[-2.2, 0.3, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Support legs */}
      {[[-1.8, -0.4], [1.8, -0.4], [-1.8, 0.4], [1.8, 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.1, z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.4]} />
          <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      
      {/* Side guards */}
      <mesh position={[0, 0.5, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 0.3, 0.05]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.5, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 0.3, 0.05]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.7} />
      </mesh>

      <Html center distanceFactor={12} occlude>
        <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
          selected ? 'bg-green-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
        }`}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// Enhanced 3D Printer with more realistic details
function Detailed3DPrinter({ position, name, onSelect, selected }: { position: [number, number, number]; name: string; onSelect?: (n: string) => void; selected?: boolean; }) {
  const handleClick = () => onSelect?.(name);
  
  return (
    <group position={position} onClick={handleClick}>
      {/* Base/frame */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.2, 1.4]} />
        <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Vertical frame columns */}
      {[[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.8, z]} castShadow receiveShadow>
          <boxGeometry args={[0.04, 1.4, 0.04]} />
          <meshStandardMaterial 
            color={selected ? "#7c3aed" : "#581c87"} 
            metalness={0.7} 
            roughness={0.3} 
          />
        </mesh>
      ))}
      
      {/* Top frame */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.08, 1.4]} />
        <meshStandardMaterial 
          color={selected ? "#7c3aed" : "#581c87"} 
          metalness={0.7} 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Build platform (heated bed) */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.05, 1.1]} />
        <meshStandardMaterial 
          color={selected ? "#a855f7" : "#6b21a8"} 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* X-axis rail */}
      <mesh position={[0, 1.2, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 0.04]} />
        <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Y-axis rails */}
      <mesh position={[-0.6, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.04, 1.2]} />
        <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.6, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 0.04, 1.2]} />
        <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Print head carriage */}
      <mesh position={[0.2, 1.15, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.12, 0.2]} />
        <meshStandardMaterial 
          color={selected ? "#c084fc" : "#7c2d12"} 
          metalness={0.6} 
          roughness={0.4} 
        />
      </mesh>
      
      {/* Hot end */}
      <mesh position={[0.2, 1.0, -0.1]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.1]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Filament spool */}
      <mesh position={[0.8, 1.3, 0.8]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.08]} />
        <meshStandardMaterial color="#059669" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Control LCD */}
      <mesh position={[0.7, 0.8, -0.7]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.15, 0.02]} />
        <meshStandardMaterial color="#000" emissive="#1e40af" emissiveIntensity={0.2} />
      </mesh>

      <Html center distanceFactor={12} occlude>
        <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
          selected ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
        }`}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// Enhanced Assembly Station with more realistic details
function DetailedAssemblyStation({ position, name, onSelect, selected }: { position: [number, number, number]; name: string; onSelect?: (n: string) => void; selected?: boolean; }) {
  const handleClick = () => onSelect?.(name);
  
  return (
    <group position={position} onClick={handleClick}>
      {/* Main work surface */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.08, 2.0]} />
        <meshStandardMaterial 
          color={selected ? "#ea580c" : "#9a3412"} 
          metalness={0.7} 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Support frame underneath */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.12, 1.8]} />
        <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Adjustable legs */}
      {[[-1.2, -0.8], [1.2, -0.8], [-1.2, 0.8], [1.2, 0.8]].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, 0.2, z]} castShadow receiveShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.4]} />
            <meshStandardMaterial color="#525252" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Foot pads */}
          <mesh position={[x, 0, z]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.6} />
          </mesh>
        </group>
      ))}
      
      {/* Tool rack/pegboard */}
      <mesh position={[0, 0.9, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.8, 0.05]} />
        <meshStandardMaterial 
          color={selected ? "#f97316" : "#c2410c"} 
          metalness={0.4} 
          roughness={0.6} 
        />
      </mesh>
      
      {/* Tool rack support posts */}
      <mesh position={[-1.0, 0.7, -0.9]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[1.0, 0.7, -0.9]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Sample tools on pegboard */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.85, -0.85]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.15]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      
      {/* Work light */}
      <mesh position={[0.8, 1.2, 0.3]} rotation={[-Math.PI / 4, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.08, 0.15]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Light arm */}
      <mesh position={[0.8, 1.0, 0.15]} rotation={[Math.PI / 6, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.3]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Storage drawer */}
      <mesh position={[0, 0.15, 0.7]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.2, 0.4]} />
        <meshStandardMaterial color="#6b7280" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Drawer handle */}
      <mesh position={[0, 0.2, 0.9]} castShadow receiveShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.3]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>

      <Html center distanceFactor={12} occlude>
        <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
          selected ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
        }`}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// Component that attempts to load GLTF model first, falls back to detailed procedural model
function GLTFMachine({ modelPath, position, name, onSelect, selected, machineType }: {
  modelPath: string;
  position: [number, number, number];
  name: string;
  onSelect?: (n: string) => void;
  selected?: boolean;
  machineType: string;
}) {
  try {
    const { scene } = useGLTF(modelPath);
    const clonedScene = scene.clone();
    
    // Apply selection color tint
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (selected) {
          child.material = child.material.clone();
          child.material.color.setHex(0x3b82f6);
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    const handleClick = () => onSelect?.(name);
    
    return (
      <group position={position} onClick={handleClick}>
        <primitive object={clonedScene} />
        <Html center distanceFactor={12} occlude>
          <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
            selected ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {name}
          </div>
        </Html>
      </group>
    );
  } catch {
    // Fallback to procedural model if GLTF fails to load
    return <DetailedMachine position={position} name={name} onSelect={onSelect} selected={selected} machineType={machineType} />;
  }
}

// Main component that determines which machine type to render
function DetailedMachine({ position, name, onSelect, selected, machineType }: {
  position: [number, number, number];
  name: string;
  onSelect?: (n: string) => void;
  selected?: boolean;
  machineType?: string;
}) {
  const type = machineType || name.toLowerCase();
  
  if (type.includes('cnc') || type.includes('mill') || type.includes('lathe')) {
    return <DetailedCNCMachine position={position} name={name} onSelect={onSelect} selected={selected} />;
  } else if (type.includes('robot') || type.includes('arm')) {
    return <DetailedRobotArm position={position} name={name} onSelect={onSelect} selected={selected} />;
  } else if (type.includes('conveyor') || type.includes('belt')) {
    return <DetailedConveyorBelt position={position} name={name} onSelect={onSelect} selected={selected} />;
  } else if (type.includes('printer') || type.includes('3d')) {
    return <Detailed3DPrinter position={position} name={name} onSelect={onSelect} selected={selected} />;
  } else if (type.includes('assembly') || type.includes('station')) {
    return <DetailedAssemblyStation position={position} name={name} onSelect={onSelect} selected={selected} />;
  } else {
    // Default to CNC machine for unknown types
    return <DetailedCNCMachine position={position} name={name} onSelect={onSelect} selected={selected} />;
  }
}

// Main exported component
export function RealisticMachine({ 
  position, 
  name, 
  onSelect, 
  selected, 
  modelPath, 
  machineType 
}: {
  position: [number, number, number];
  name: string;
  onSelect?: (n: string) => void;
  selected?: boolean;
  modelPath?: string;
  machineType?: string;
}) {
  if (modelPath) {
    return (
      <Suspense fallback={<LoadingPlaceholder />}>
        <GLTFMachine 
          modelPath={modelPath} 
          position={position} 
          name={name} 
          onSelect={onSelect} 
          selected={selected}
          machineType={machineType || name}
        />
      </Suspense>
    );
  }
  
  return (
    <DetailedMachine 
      position={position} 
      name={name} 
      onSelect={onSelect} 
      selected={selected}
      machineType={machineType}
    />
  );
}

// Preload GLTF models (can be called to preload models)
export function preloadModels() {
  // Add model paths here when available
  const modelPaths = [
    '/models/cnc-machine.glb',
    '/models/robot-arm.glb',
    '/models/conveyor-belt.glb',
    '/models/3d-printer.glb',
    '/models/assembly-station.glb'
  ];
  
  modelPaths.forEach(path => {
    try {
      useGLTF.preload(path);
    } catch {
      // Ignore preload errors - models might not exist yet
    }
  });
}
