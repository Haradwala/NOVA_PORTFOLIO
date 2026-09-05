/**
 * ArrivalZone.jsx — Modular Environment Entrypoint
 *
 * Combines Platform, Bridge, CathedralWall, CathedralColumns, Ceiling, Portal,
 * RingMachine, and BackgroundCity modules into a single synchronized coordinate group.
 */

import Platform from './components/Platform';
import Bridge from './components/Bridge';
import CathedralWall from './components/CathedralWall';
import CathedralColumns from './components/CathedralColumns';
import Ceiling from './components/Ceiling';
import Portal from './components/Portal';
import RingMachine from './components/RingMachine';
import BackgroundCity from './components/BackgroundCity';
import Core from './components/Core/Core';
import EnvironmentController from './systems/EnvironmentController';

export default function ArrivalZone() {
  return (
    <group position={[0, -2, 0]}>
      {/* Platform stepped foundation */}
      <Platform />

      {/* Corridor side walls and horizontal gallery decks */}
      <CathedralWall />

      {/* Inner primary/secondary columns and girders */}
      <CathedralColumns />

      {/* Transverse ceiling beams */}
      <Ceiling />

      {/* Walkway access bridges */}
      <Bridge />

      {/* Portal system receding frame */}
      <Portal />

      {/* Floating ring machine and support pylons */}
      <RingMachine />

      {/* Receding background cityscape skyline */}
      <BackgroundCity />

      {/* Suspended dormant AI Core consciousness */}
      <Core />

      {/* Environmental response controller */}
      <EnvironmentController />
    </group>
  );
}
