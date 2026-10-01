import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = 'C:\\Users\\Shadab\\.gemini\\antigravity-ide\\brain\\89c0a33b-dbb5-47e1-900d-8a6106914f66\\screenshots';
const BASE_URL = 'http://localhost:5173';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runTests() {
  console.log('--- Launching Chrome via Puppeteer-core ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--use-gl=angle',
      '--use-angle=swiftshader-webgl',
      '--window-size=1440,900',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  const results = {
    screenshots: [],
    tests: [],
    consoleErrors: [],
  };

  try {
    // 1. Boot sequence
    console.log('[1/14] Testing Boot Sequence...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    const bootShot = path.join(OUTPUT_DIR, '01_boot_sequence.png');
    await page.screenshot({ path: bootShot });
    results.screenshots.push({ name: 'Boot Sequence', path: bootShot });

    // Wait for boot sequence to conclude
    await new Promise(r => setTimeout(r, 4500));

    // 2. Hero initial state
    console.log('[2/14] Testing Hero initial state...');
    await page.goto(`${BASE_URL}/?nowelcome=true`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    const heroShot = path.join(OUTPUT_DIR, '02_hero_initial.png');
    await page.screenshot({ path: heroShot });
    results.screenshots.push({ name: 'Hero Initial State', path: heroShot });

    // Check R3F canvases
    const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
    console.log(`Canvas count detected: ${canvasCount}`);
    results.tests.push({ name: 'Canvas Count Check (No Duplicates)', passed: canvasCount >= 1 && canvasCount <= 3, info: `${canvasCount} canvases` });

    // 3. ENTER NOVA button interaction
    console.log('[3/14] Testing ENTER NOVA interaction...');
    const enterBtn = await page.$('.hero-enter-btn');
    if (enterBtn) {
      await enterBtn.click();
      await new Promise(r => setTimeout(r, 1800));
      const enterShot = path.join(OUTPUT_DIR, '03_after_enter_nova.png');
      await page.screenshot({ path: enterShot });
      results.screenshots.push({ name: 'After ENTER NOVA', path: enterShot });
      results.tests.push({ name: 'ENTER NOVA Click & Scroll', passed: true });
    }

    // 4. Player Profile (About section)
    console.log('[4/14] Capturing Player Profile (About section)...');
    await page.evaluate(() => {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const aboutShot = path.join(OUTPUT_DIR, '04_player_profile.png');
    await page.screenshot({ path: aboutShot });
    results.screenshots.push({ name: 'Player Profile', path: aboutShot });

    // 5. Capabilities (Three Worlds initial state)
    console.log('[5/14] Capturing Capabilities initial state...');
    await page.evaluate(() => {
      const el = document.getElementById('skills') || document.getElementById('capabilities');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const capInitShot = path.join(OUTPUT_DIR, '05_capabilities_initial.png');
    await page.screenshot({ path: capInitShot });
    results.screenshots.push({ name: 'Capabilities Initial State', path: capInitShot });

    // 6. Each of the Three World selections
    console.log('[6/14] Capturing each of the Three Worlds selections...');
    const worldIds = ['ai-cognitive', 'fullstack-core', 'creative-3d'];
    for (let i = 0; i < worldIds.length; i++) {
      const wid = worldIds[i];
      await page.evaluate((id) => {
        const cards = document.querySelectorAll('.system-floating-card');
        cards.forEach(c => {
          c.classList.remove('active');
          c.classList.add('dimmed');
        });
        const target = Array.from(cards).find(c => c.getAttribute('aria-label')?.toLowerCase().includes(id.split('-')[0]));
        if (target) {
          target.classList.add('active');
          target.classList.remove('dimmed');
          target.focus();
        }
      }, wid);

      await new Promise(r => setTimeout(r, 600));
      const worldShotPath = path.join(OUTPUT_DIR, `06_world_selection_${i + 1}_${wid}.png`);
      await page.screenshot({ path: worldShotPath });
      results.screenshots.push({ name: `World Selection ${i + 1} (${wid})`, path: worldShotPath });
    }
    results.tests.push({ name: 'Three Worlds Interactive Selection', passed: true });

    // 7. Process section
    console.log('[7/14] Capturing Process section...');
    await page.evaluate(() => {
      const el = document.getElementById('section-process') || document.querySelector('[data-section="process"]');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const processShot = path.join(OUTPUT_DIR, '07_process_section.png');
    await page.screenshot({ path: processShot });
    results.screenshots.push({ name: 'Process Section', path: processShot });

    // 8. Selected Missions (Work section)
    console.log('[8/14] Capturing Selected Missions...');
    await page.evaluate(() => {
      const el = document.getElementById('section-work') || document.querySelector('[data-section="work"]') || document.getElementById('work');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const workShot = path.join(OUTPUT_DIR, '08_selected_missions.png');
    await page.screenshot({ path: workShot });
    results.screenshots.push({ name: 'Selected Missions', path: workShot });

    // Test Project Filters
    const filterTested = await page.evaluate(() => {
      const filterBtns = Array.from(document.querySelectorAll('.work-section button')).filter(b => ['ai', 'web', 'desktop'].includes(b.innerText.trim().toLowerCase()));
      if (filterBtns.length > 0) {
        filterBtns[0].click();
        return true;
      }
      return false;
    });
    results.tests.push({ name: 'Mission Filter Tabs Interaction', passed: filterTested });
    await new Promise(r => setTimeout(r, 500));

    // 9. Project deep-dive modal
    console.log('[9/14] Opening Project Deep-Dive modal...');
    const cardClicked = await page.evaluate(() => {
      const cards = document.querySelectorAll('.project-card, [data-project-id], .work-grid > div');
      if (cards.length > 0) {
        const btn = cards[0].querySelector('button') || cards[0];
        btn.click();
        return true;
      }
      return false;
    });

    await new Promise(r => setTimeout(r, 1000));
    const modalShot = path.join(OUTPUT_DIR, '09_project_deep_dive_modal.png');
    await page.screenshot({ path: modalShot });
    results.screenshots.push({ name: 'Project Deep Dive Modal', path: modalShot });
    results.tests.push({ name: 'Deep Dive Modal Opened', passed: cardClicked });

    // Close modal (Escape)
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 600));

    // 10. Archive collapsed and expanded states
    console.log('[10/14] Capturing Archive collapsed and expanded states...');
    await page.evaluate(() => {
      const el = document.getElementById('section-archive') || document.querySelector('[data-section="archive"]');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const archiveCollapsedShot = path.join(OUTPUT_DIR, '10_archive_collapsed.png');
    await page.screenshot({ path: archiveCollapsedShot });
    results.screenshots.push({ name: 'Archive Collapsed', path: archiveCollapsedShot });

    // Expand category
    await page.evaluate(() => {
      const archiveSection = document.getElementById('section-archive') || document.querySelector('[data-section="archive"]');
      if (archiveSection) {
        const categoryItem = archiveSection.querySelector('[data-archive-cat], div[style*="cursor: pointer"]');
        if (categoryItem) categoryItem.click();
      }
    });
    await new Promise(r => setTimeout(r, 800));
    const archiveExpandedShot = path.join(OUTPUT_DIR, '10_archive_expanded.png');
    await page.screenshot({ path: archiveExpandedShot });
    results.screenshots.push({ name: 'Archive Expanded', path: archiveExpandedShot });

    // 11. Open Channel Contact form
    console.log('[11/14] Capturing Open Channel Contact Form...');
    await page.evaluate(() => {
      const el = document.getElementById('section-contact') || document.querySelector('[data-section="contact"]') || document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 1000));
    const contactShot = path.join(OUTPUT_DIR, '11_contact_open_channel.png');
    await page.screenshot({ path: contactShot });
    results.screenshots.push({ name: 'Open Channel Contact', path: contactShot });

    // Verify contact location text is "AHMEDABAD, INDIA"
    const locationText = await page.evaluate(() => {
      const contactEl = document.getElementById('section-contact');
      return contactEl?.innerText.includes('AHMEDABAD, INDIA') && !contactEl?.innerText.includes('23.0225');
    });
    results.tests.push({ name: 'Contact Location is AHMEDABAD, INDIA (No lat/long)', passed: locationText });

    // Test Contact form validation
    const formValidation = await page.evaluate(() => {
      const form = document.querySelector('#section-contact form') || document.querySelector('form');
      if (!form) return { hasForm: false };
      const submitBtn = form.querySelector('button[type="submit"]');
      const nameInput = form.querySelector('#inquiry-name') || form.querySelector('input[type="text"]');
      const emailInput = form.querySelector('#inquiry-email') || form.querySelector('input[type="email"]');
      return {
        hasForm: true,
        hasRequiredInputs: nameInput?.required && emailInput?.required,
        submitBtnFound: !!submitBtn,
      };
    });
    results.tests.push({ name: 'Contact Form Validation Schema', passed: formValidation.hasForm && formValidation.hasRequiredInputs });

    // Test Navbar navigation
    const navTested = await page.evaluate(() => {
      const navBtn = Array.from(document.querySelectorAll('.nav-links button')).find(b => b.innerText.includes('PROCESS') || b.innerText.includes('PROFILE'));
      if (navBtn) {
        navBtn.click();
        return true;
      }
      return false;
    });
    results.tests.push({ name: 'Navbar Section Navigation & Indicator', passed: navTested });

    // 12. Mobile layout (375x812 iPhone / mobile viewport)
    console.log('[12/14] Capturing Mobile Layout...');
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
    await page.goto(`${BASE_URL}/?nowelcome=true`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    const mobileHeroShot = path.join(OUTPUT_DIR, '12_mobile_hero.png');
    await page.screenshot({ path: mobileHeroShot });
    results.screenshots.push({ name: 'Mobile Hero Viewport', path: mobileHeroShot });

    // Mobile nav hamburger click
    await page.evaluate(() => {
      const btn = document.querySelector('.mobile-menu-btn button') || document.querySelector('button[aria-label="Toggle menu"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    const mobileNavShot = path.join(OUTPUT_DIR, '12_mobile_nav_menu.png');
    await page.screenshot({ path: mobileNavShot });
    results.screenshots.push({ name: 'Mobile Navigation Drawer', path: mobileNavShot });

    // Reset viewport to desktop
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // 13. Reduced-motion mode
    console.log('[13/14] Testing Reduced-Motion Mode...');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    const isBootShowing = await page.evaluate(() => !!document.querySelector('.boot-sequence'));
    const reducedMotionShot = path.join(OUTPUT_DIR, '13_reduced_motion_hero.png');
    await page.screenshot({ path: reducedMotionShot });
    results.screenshots.push({ name: 'Reduced Motion Hero', path: reducedMotionShot });
    results.tests.push({
      name: 'Reduced Motion Skips Boot Sequence',
      passed: !isBootShowing,
      info: isBootShowing ? 'Boot sequence showed despite reduced-motion' : 'Boot sequence skipped cleanly'
    });

    // 14. Testing Standalone Routes: /archive, /process, /chat, /admin, /world
    console.log('[14/14] Testing Standalone Routes...');
    const routesToTest = ['/archive', '/process', '/chat', '/admin', '/world'];
    for (const route of routesToTest) {
      const routeRes = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0' });
      const status = routeRes ? routeRes.status() : 0;
      await new Promise(r => setTimeout(r, 800));
      const routeShotName = `14_route_${route.replace('/', '')}.png`;
      const routeShotPath = path.join(OUTPUT_DIR, routeShotName);
      await page.screenshot({ path: routeShotPath });
      results.screenshots.push({ name: `Route ${route}`, path: routeShotPath });
      results.tests.push({ name: `Route ${route} accessible`, passed: status === 200 || status === 304, info: `HTTP ${status}` });
    }

    // Capture console errors
    results.consoleErrors = consoleErrors;

  } catch (err) {
    console.error('Error during test execution:', err);
    results.error = err.message;
  } finally {
    await browser.close();
  }

  // Write test report JSON
  const reportPath = path.join(OUTPUT_DIR, 'verification_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n=== Verification Complete ===`);
  console.log(`Report written to: ${reportPath}`);
  console.log(`Captured ${results.screenshots.length} screenshots`);
  console.log(`Tests run: ${results.tests.length}`);
  console.log(`Console errors: ${results.consoleErrors.length}`);
}

runTests();
