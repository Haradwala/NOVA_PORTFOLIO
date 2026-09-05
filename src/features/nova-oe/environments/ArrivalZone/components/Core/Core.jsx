import { useRef } from 'react';
import CoreShell from './CoreShell';
import CoreEmitter from './CoreEmitter';
import CoreHalo from './CoreHalo';
import CoreGlow from './CoreGlow';
import EnergyShell from './EnergyShell';
import OrbitalHalo from './OrbitalHalo';
import EnergyFilaments from './EnergyFilaments';
import MicroSparks from './MicroSparks';
import CoreController from './CoreController';
import { CORE_POSITION } from './constants';

export default function Core() {
  const coreGroupRef = useRef();
  const emitterMatRef = useRef();
  const haloMatRef = useRef();
  const lightRef = useRef();
  const auraMatRef = useRef();
  const energyShellRef = useRef();
  
  // Array refs for multi-node visual layers
  const orbitalHaloRefs = useRef([]);
  const filamentMatRefs = useRef([]);
  const sparkRefs = useRef();

  return (
    <group ref={coreGroupRef} position={CORE_POSITION}>
      {/* 1. Segmented containment shell */}
      <CoreShell />

      {/* 2. Embedded consciousness seed */}
      <CoreEmitter materialRef={emitterMatRef} />

      {/* 3. Outer float mechanical halo */}
      <CoreHalo materialRef={haloMatRef} />

      {/* 4. Internal glow and energy aura */}
      <CoreGlow lightRef={lightRef} materialRef={auraMatRef} />

      {/* 5. Transparent Energy Shell */}
      <EnergyShell meshRef={energyShellRef} />

      {/* 6. Orbital Halo System */}
      <OrbitalHalo ringRefs={orbitalHaloRefs} />

      {/* 7. Curved Energy Filaments */}
      <EnergyFilaments matRefs={filamentMatRefs} />

      {/* 8. Micro Sparks System */}
      <MicroSparks sparksRef={sparkRefs} />

      {/* Centralized animation driver driving direct WebGL updates */}
      <CoreController
        coreGroupRef={coreGroupRef}
        emitterMatRef={emitterMatRef}
        haloMatRef={haloMatRef}
        lightRef={lightRef}
        auraMatRef={auraMatRef}
        energyShellRef={energyShellRef}
        orbitalHaloRefs={orbitalHaloRefs}
        filamentMatRefs={filamentMatRefs}
        sparkRefs={sparkRefs}
      />
    </group>
  );
}
