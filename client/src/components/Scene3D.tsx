import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

interface Location {
  x: number;
  y: number;
  z: number;
}

interface LocationMarkerProps {
  position: [number, number, number];
  name: string;
  color: string;
  scale?: number;
  onClick?: () => void;
}

function LocationMarker({ position, name, color, scale = 1, onClick }: LocationMarkerProps) {
  return (
    <group position={position} onClick={onClick}>
      <mesh>
        <sphereGeometry args={[3 * scale, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight color={color} intensity={20} distance={50} />
    </group>
  );
}

interface RouteLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}

function RouteLine({ start, end, color }: RouteLineProps) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.6 }))} />
  );
}

interface Scene3DProps {
  locations: Record<string, Location>;
  selectedMonth?: string;
  highlightedLocations?: string[];
  routes?: Array<{ from: string; to: string }>;
}

export default function Scene3D({ locations, selectedMonth, highlightedLocations = [], routes = [] }: Scene3DProps) {
  const locationEntries = Object.entries(locations);

  return (
    <div className="w-full h-full">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 200, 400]} fov={60} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={100}
            maxDistance={800}
            maxPolarAngle={Math.PI / 2}
          />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[100, 100, 50]} intensity={1} />
          <pointLight position={[0, 100, 0]} intensity={0.5} color="#00853E" />

          {/* Stars background */}
          <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial
              color="#0a0a0a"
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Location markers */}
          {locationEntries.map(([name, loc]) => {
            const isHighlighted = highlightedLocations.includes(name);
            return (
              <LocationMarker
                key={name}
                position={[loc.x - 500, loc.z, loc.y - 500]}
                name={name}
                color={isHighlighted ? '#00ff00' : '#00853E'}
                scale={isHighlighted ? 1.5 : 1}
              />
            );
          })}

          {/* Route lines */}
          {routes.map((route, idx) => {
            const fromLoc = locations[route.from];
            const toLoc = locations[route.to];
            if (!fromLoc || !toLoc) return null;

            return (
              <RouteLine
                key={`${route.from}-${route.to}-${idx}`}
                start={[fromLoc.x - 500, fromLoc.z + 5, fromLoc.y - 500]}
                end={[toLoc.x - 500, toLoc.z + 5, toLoc.y - 500]}
                color="#00ff88"
              />
            );
          })}
        </Suspense>
      </Canvas>
    </div>
  );
}
