import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\Shadab\\.gemini\\antigravity-ide\\brain\\bdd7e026-850e-4e87-a16f-98fbe0a9bbd2';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching Edge with remote debugging...');
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank',
  ]);

  let connected = false;
  let wsUrl = '';

  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://localhost:9222/json/version');
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        connected = true;
        break;
      }
    } catch (e) {}
  }

  if (!connected) {
    console.error('Failed to connect to Edge debugging port');
    edge.kill();
    process.exit(1);
  }

  console.log('Connected to Edge via CDP:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let messageId = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const res = JSON.parse(event.data);
    if (res.id && pendingRequests.has(res.id)) {
      pendingRequests.get(res.id)(res);
      pendingRequests.delete(res.id);
    }
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = messageId++;
      pendingRequests.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Create new target for page
  const { result: targetResult } = await send('Target.createTarget', { url: 'about:blank' });
  const targetId = targetResult.targetId;
  const { result: sessionResult } = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = sessionResult.sessionId;

  function sendSession(method, params = {}) {
    return new Promise((resolve) => {
      const id = messageId++;
      pendingRequests.set(id, resolve);
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    });
  }

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');

  async function capture(filename) {
    const { result } = await sendSession('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  // 1. Homepage desktop
  console.log('Navigating to Homepage...');
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sendSession('Page.navigate', { url: 'http://localhost:5173/?nowelcome=true' });
  await sleep(4000);
  await capture('1_homepage_desktop.png');

  // 2. /work desktop
  console.log('Navigating to /work...');
  await sendSession('Page.navigate', { url: 'http://localhost:5173/work' });
  await sleep(3500);
  await capture('2_work_desktop.png');

  // 3. /work after scrolling
  console.log('Scrolling /work...');
  // Dispatch wheel scroll to advance the spiral slider
  await sendSession('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 720,
    y: 450,
    deltaX: 0,
    deltaY: 350,
  });
  await sleep(400);
  await sendSession('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 720,
    y: 450,
    deltaX: 0,
    deltaY: 350,
  });
  await sleep(1500);
  await capture('3_work_after_scrolling.png');

  // 4. Mobile /work
  console.log('Setting mobile viewport for /work...');
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sendSession('Page.navigate', { url: 'http://localhost:5173/work' });
  await sleep(3000);
  await capture('4_work_mobile.png');

  // 5. Desktop /about (Engineering Philosophy with Magnet Lines)
  console.log('Navigating to /about desktop...');
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sendSession('Page.navigate', { url: 'http://localhost:5173/about' });
  await sleep(2500);
  await capture('5_philosophy_desktop.png');

  // 6. Interactive mouse movement over Magnet Lines
  console.log('Moving mouse to interact with Magnet Lines...');
  await sendSession('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: 350,
    y: 420,
  });
  await sleep(400);
  await sendSession('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: 950,
    y: 380,
  });
  await sleep(700);
  await capture('6_philosophy_mouse_interact.png');

  // 7. Mobile /about
  console.log('Setting mobile viewport for /about...');
  await sendSession('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sendSession('Page.navigate', { url: 'http://localhost:5173/about' });
  await sleep(2500);
  await capture('7_philosophy_mobile.png');

  ws.close();
  edge.kill();
  console.log('All verification screenshots captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
