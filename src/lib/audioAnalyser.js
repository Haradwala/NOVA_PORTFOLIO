let audioContext = null;
let analyserNode = null;
let gainNode     = null;
let micSource    = null;
let audioStream  = null;
let animationFrameId = null;
let isSimulating = false;

// Internal state object
const analyserState = {
  isActive: false,
  voiceAmplitude: 0,
  bass: 0,
  mid: 0,
  treble: 0
};

// Simple context unlock helper
function installContextUnlocker(ctx) {
  const unlock = async () => {
    if (ctx.state === 'suspended') {
      await ctx.resume();
      console.log('[AudioAnalyser] AudioContext resumed');
    }
  };
  window.addEventListener('click',      unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
}

export async function startAnalyser(customStream = null) {
  if (analyserState.isActive) return;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      try { await audioContext.resume(); } catch (e) {}
    }
    installContextUnlocker(audioContext);

    isSimulating = false;

    if (customStream) {
      audioStream = customStream;
    } else {
      try {
        // Request clean mic stream to minimize driver APO locking conflicts
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
        console.log('[AudioAnalyser] Raw stream obtained');
      } catch (mediaErr) {
        console.warn('[AudioAnalyser] getUserMedia failed, enabling simulation mode:', mediaErr);
        isSimulating = true;
      }
    }

    analyserState.isActive = true;

    if (isSimulating) {
      // Simulation loop: natural voice amplitude breaths and flashes
      let tick = 0;
      const simulateTick = () => {
        if (!analyserState.isActive || !isSimulating) return;
        tick += 0.05;
        
        // Base low breath
        let amp = Math.max(0.01, Math.sin(tick * 0.5) * 0.03 + 0.03);
        
        // Occasional simulated speech bursts if listening/speaking (state is set externally or tick driven)
        if (Math.random() > 0.96) {
          amp += Math.random() * 0.35 + 0.1;
        }

        analyserState.voiceAmplitude = Math.min(amp, 1.0);
        analyserState.bass = Math.min(amp * 1.2, 1.0);
        analyserState.mid = Math.min(amp * 0.8, 1.0);
        analyserState.treble = Math.min(amp * 0.4, 1.0);

        window.dispatchEvent(new CustomEvent('nova-audio-update'));
        animationFrameId = requestAnimationFrame(simulateTick);
      };
      simulateTick();
      return;
    }

    // Connect analyzer nodes
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.15;

    gainNode = audioContext.createGain();
    // High gain boost so quiet speech stands out in the particle values
    gainNode.gain.setValueAtTime(25.0, audioContext.currentTime);

    micSource = audioContext.createMediaStreamSource(audioStream);
    micSource.connect(gainNode);
    gainNode.connect(analyserNode);

    const bufferLength = analyserNode.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeDomainData = new Float32Array(bufferLength);

    const tick = () => {
      if (!analyserState.isActive || !analyserNode) return;

      analyserNode.getByteFrequencyData(frequencyData);
      analyserNode.getFloatTimeDomainData(timeDomainData);

      // Compute RMS voice amplitude
      let sumSquares = 0;
      for (let i = 0; i < timeDomainData.length; i++) {
        sumSquares += timeDomainData[i] * timeDomainData[i];
      }
      const rms = Math.sqrt(sumSquares / timeDomainData.length);
      
      // Scale RMS value for premium visualization reactivity
      analyserState.voiceAmplitude = Math.min(rms * 12.0, 1.0);

      // Simple frequency band averages
      let bassSum = 0, bassCount = 0;
      let midSum  = 0, midCount  = 0;
      let trebleSum = 0, trebleCount = 0;

      const boundaryBass = Math.floor(bufferLength * 0.15); // ~0 to 250 Hz
      const boundaryMid  = Math.floor(bufferLength * 0.55); // ~250 to 2000 Hz

      for (let i = 0; i < bufferLength; i++) {
        const val = frequencyData[i] / 255.0;
        if (i <= boundaryBass) {
          bassSum += val;
          bassCount++;
        } else if (i <= boundaryMid) {
          midSum += val;
          midCount++;
        } else {
          trebleSum += val;
          trebleCount++;
        }
      }

      analyserState.bass   = bassCount   > 0 ? bassSum   / bassCount   : 0;
      analyserState.mid    = midCount    > 0 ? midSum    / midCount    : 0;
      analyserState.treble = trebleCount > 0 ? trebleSum / trebleCount : 0;

      // Detect if stream went completely flat (locked/muted by OS) -> failover to simulation
      if (rms < 0.0001 && analyserState.isActive) {
        // Soft fallback simulation to prevent static visual sphere
        analyserState.voiceAmplitude = Math.max(0.015, Math.sin(Date.now() * 0.001) * 0.02 + 0.02);
      }

      window.dispatchEvent(new CustomEvent('nova-audio-update'));
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();
  } catch (err) {
    console.warn('[AudioAnalyser] Start failed, using simulation mode:', err);
    isSimulating = true;
    analyserState.isActive = true;
    // Trigger simulation tick
    let tick = 0;
    const simulateTick = () => {
      if (!analyserState.isActive || !isSimulating) return;
      tick += 0.05;
      let amp = Math.max(0.01, Math.sin(tick * 0.5) * 0.03 + 0.03);
      analyserState.voiceAmplitude = amp;
      window.dispatchEvent(new CustomEvent('nova-audio-update'));
      animationFrameId = requestAnimationFrame(simulateTick);
    };
    simulateTick();
  }
}

export function stopAnalyser() {
  analyserState.isActive = false;
  isSimulating = false;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (micSource)    { try { micSource.disconnect(); } catch (e) {} micSource = null; }
  if (gainNode)     { try { gainNode.disconnect(); } catch (e) {} gainNode = null; }
  if (analyserNode) { try { analyserNode.disconnect(); } catch (e) {} analyserNode = null; }

  if (audioStream) {
    try {
      audioStream.getTracks().forEach((t) => t.stop());
    } catch (e) {}
    audioStream = null;
  }

  analyserState.voiceAmplitude = 0;
  analyserState.bass   = 0;
  analyserState.mid    = 0;
  analyserState.treble = 0;

  window.dispatchEvent(new CustomEvent('nova-audio-update'));
}

export function getAnalyserValues() {
  return { ...analyserState };
}

