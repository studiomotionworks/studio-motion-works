"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Torus, Sphere } from "@react-three/drei";
import * as THREE from "three";

function RotatingMark({ urgency }: { urgency: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // urgency: 0 = far away, 1 = imminent
  const speed = 0.15 + urgency * 0.9;

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * (2 + urgency * 4)) * 0.08;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  // Deterministic orbiting nodes
  const orbiters = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        angle: (i / 6) * Math.PI * 2,
        radius: 1.5,
        size: 0.06 + (i % 2) * 0.02,
      })),
    []
  );

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 4]} intensity={1.3} color="#F5F5F5" />
      <pointLight position={[-3, 2, -3]} intensity={0.7} color="#C5A065" />
      <pointLight position={[3, -2, 3]} intensity={0.5} color="#B87333" />

      {/* Central core */}
      <Sphere ref={coreRef} args={[0.35, 32, 32]}>
        <meshStandardMaterial
          color="#C5A065"
          metalness={1}
          roughness={0.15}
          emissive="#C5A065"
          emissiveIntensity={0.4 + urgency * 0.6}
          envMapIntensity={2.5}
        />
      </Sphere>

      {/* Three concentric rings */}
      <Torus args={[0.85, 0.035, 32, 96]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#C5A065"
          metalness={1}
          roughness={0.22}
          envMapIntensity={2.2}
        />
      </Torus>
      <Torus
        args={[1.1, 0.028, 32, 96]}
        rotation={[Math.PI / 2, 0.4, 0]}
      >
        <meshStandardMaterial
          color="#B87333"
          metalness={1}
          roughness={0.28}
          envMapIntensity={2}
        />
      </Torus>
      <Torus
        args={[1.35, 0.022, 32, 96]}
        rotation={[Math.PI / 2, -0.3, Math.PI / 4]}
      >
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={0.95}
          roughness={0.15}
          envMapIntensity={3}
        />
      </Torus>

      {/* Orbiting particles */}
      {orbiters.map((o, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(o.angle) * o.radius,
            Math.sin(o.angle * 1.5) * 0.4,
            Math.sin(o.angle) * o.radius,
          ]}
        >
          <boxGeometry args={[o.size, o.size, o.size]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#C5A065" : "#F5F5F5"}
            metalness={1}
            roughness={0.2}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

export function CountdownIcon({ urgency = 0 }: { urgency?: number }) {
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <RotatingMark urgency={urgency} />
        <Environment preset="studio" environmentIntensity={0.35} />
      </Canvas>
    </div>
  );
}