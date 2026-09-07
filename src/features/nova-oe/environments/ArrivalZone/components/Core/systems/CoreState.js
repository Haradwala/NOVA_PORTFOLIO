export const CoreStates = {
  BOOTING: 'BOOTING',          // 0-2s (Dormant, silent, cold core)
  AWAKENING: 'AWAKENING',      // 2-10s (Kinetic start, first pulse, syncing)
  IDLE: 'IDLE',                // 10s+ (Permanent breathing cycle and resonance)
  LISTENING: 'LISTENING',      // (Future microphone feedback)
  THINKING: 'THINKING',        // (Future active processing)
  SPEAKING: 'SPEAKING',        // (Future voice response)
  SLEEP: 'SLEEP',              // (Future low-power dormancy)
};

export const stateRuntime = {
  activeState: CoreStates.BOOTING,

  setState: (newState) => {
    stateRuntime.activeState = newState;
  },

  getState: () => {
    return stateRuntime.activeState;
  },
};

export function updateStateRuntime(t) {
  const current = stateRuntime.getState();
  
  // Only auto-transition the boot sequences (Booting -> Awakening -> Idle)
  if (current === CoreStates.BOOTING || current === CoreStates.AWAKENING || current === CoreStates.IDLE) {
    if (t < 2.0) {
      stateRuntime.setState(CoreStates.BOOTING);
    } else if (t < 10.0) {
      stateRuntime.setState(CoreStates.AWAKENING);
    } else {
      stateRuntime.setState(CoreStates.IDLE);
    }
  }
}
