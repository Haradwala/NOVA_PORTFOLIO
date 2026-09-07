import { useMemo } from 'react';
import * as THREE from 'three';
import { matTitanium, matTitaniumWorn } from '../materials/NeuralTitanium';
import { environmentRegistry } from '../systems/EnvironmentController';

export default function Bridge() {
  const g = useMemo(() => ({
    bridgeH:    new THREE.BoxGeometry(4.2, 0.4, 42),
    bridgeV:    new THREE.BoxGeometry(42, 0.4, 4.2),
    railH:      new THREE.BoxGeometry(0.3, 1.4, 42),
    railV:      new THREE.BoxGeometry(42, 1.4, 0.3),
    bridgeConn: new THREE.BoxGeometry(5.0, 0.6, 2.5),
    bridgeArch: new THREE.BoxGeometry(3, 0.4, 12),
  }), []);

  // Locally keep unique material instance and register with EnvironmentController
  const localMatWorn = useMemo(() => matTitaniumWorn.clone(), []);

  return (
    <>
      {/* North Bridge */}
      <group position={[0, 0.2, -40]}>
        <mesh geometry={g.bridgeH} material={matTitanium} />
        <mesh geometry={g.railH} position={[-2.1, 0.6, 0]}>
          <primitive object={localMatWorn} attach="material" ref={(el) => { if (el) environmentRegistry.bridgeMat = el; }} />
        </mesh>
        <mesh geometry={g.railH} position={[2.1, 0.6, 0]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.bridgeConn} position={[0, 0.1, 20]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.bridgeArch} position={[0, -0.6, 2]} rotation={[0.4, 0, 0]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
      </group>
      {/* South Bridge */}
      <group position={[0, 0.2, 40]}>
        <mesh geometry={g.bridgeH} material={matTitanium} />
        <mesh geometry={g.railH} position={[-2.1, 0.6, 0]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.railH} position={[2.1, 0.6, 0]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.bridgeConn} position={[0, 0.1, -20]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.bridgeArch} position={[0, -0.6, -2]} rotation={[-0.4, 0, 0]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
      </group>
      {/* West Bridge */}
      <group position={[-40, 0.2, 0]}>
        <mesh geometry={g.bridgeV} material={matTitanium} />
        <mesh geometry={g.railV} position={[0, 0.6, -2.1]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.railV} position={[0, 0.6, 2.1]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.bridgeConn} position={[20, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.bridgeArch} position={[2, -0.6, 0]} rotation={[0, 0, -0.4]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
      </group>
      {/* East Bridge */}
      <group position={[40, 0.2, 0]}>
        <mesh geometry={g.bridgeV} material={matTitanium} />
        <mesh geometry={g.railV} position={[0, 0.6, -2.1]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.railV} position={[0, 0.6, 2.1]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.bridgeConn} position={[-20, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
        <mesh geometry={g.bridgeArch} position={[-2, -0.6, 0]} rotation={[0, 0, 0.4]}>
          <primitive object={localMatWorn} attach="material" />
        </mesh>
      </group>
    </>
  );
}
