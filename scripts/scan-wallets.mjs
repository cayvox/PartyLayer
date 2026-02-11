import { chromium } from 'playwright';

const extensionPath = '/Users/anilkaracay/Library/Application Support/Google/Chrome/Default/Extensions/lpnfhpbpmlobjlgkdmnjieeihjmihhjd/1.5.3_0';

const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
    '--no-first-run',
    '--disable-gpu',
  ],
});

const page = await context.newPage();
await page.goto('http://localhost:3000/debug', { waitUntil: 'networkidle' });

// Wait for extension content script to inject
await page.waitForTimeout(4000);

const scanResults = await page.evaluate(() => {
  const win = window;
  const paths = ['canton', 'cantonWallet', 'consoleWallet', 'splice', 'spliceWallet'];
  const results = {};

  for (const path of paths) {
    const val = win[path];
    if (val === undefined) {
      results['window.' + path] = 'undefined';
    } else if (val === null) {
      results['window.' + path] = 'null';
    } else if (typeof val === 'object') {
      const keys = Object.keys(val);
      const fns = keys.filter(k => typeof val[k] === 'function');
      const hasCIP =
        typeof val.request === 'function' &&
        typeof val.on === 'function' &&
        typeof val.emit === 'function' &&
        typeof val.removeListener === 'function';
      if (hasCIP) {
        results['window.' + path] = 'CIP-0103 Provider (functions: ' + fns.join(', ') + ')';
      } else {
        results['window.' + path] = 'Object { keys: ' + keys.join(', ') + ', functions: ' + fns.join(', ') + ' }';
        for (const key of keys) {
          const sub = val[key];
          if (sub && typeof sub === 'object') {
            const subKeys = Object.keys(sub);
            const subFns = subKeys.filter(k => typeof sub[k] === 'function');
            const subCIP =
              typeof sub.request === 'function' &&
              typeof sub.on === 'function' &&
              typeof sub.emit === 'function' &&
              typeof sub.removeListener === 'function';
            results['window.' + path + '.' + key] = subCIP
              ? 'CIP-0103 Provider (functions: ' + subFns.join(', ') + ')'
              : 'Object { keys: ' + subKeys.slice(0, 10).join(', ') + ' }';
          }
        }
      }
    } else {
      results['window.' + path] = typeof val;
    }
  }
  return results;
});

// Probe providers
const probes = await page.evaluate(async () => {
  const results = [];

  async function check(path, provider) {
    if (!provider || typeof provider.request !== 'function') return;
    try {
      const status = await provider.request({ method: 'status' });
      results.push({ path, status: JSON.stringify(status, null, 2), error: null });
    } catch (err) {
      results.push({
        path,
        status: null,
        error: err.message + (err.code ? ' (code:' + err.code + ')' : ''),
      });
    }
  }

  const win = window;
  await check('window.consoleWallet', win.consoleWallet);
  await check('window.cantonWallet', win.cantonWallet);
  await check('window.splice', win.splice);

  if (win.canton && typeof win.canton === 'object') {
    for (const [k, v] of Object.entries(win.canton)) {
      if (v && typeof v === 'object') {
        await check('window.canton.' + k, v);
      }
    }
  }
  return results;
});

console.log('=== CIP-0103 WALLET DISCOVERY SCAN ===');
console.log('Extension: Console Wallet v1.5.3');
console.log('');

for (const [path, value] of Object.entries(scanResults)) {
  const icon = String(value).includes('CIP-0103')
    ? '[CIP-0103]'
    : String(value) === 'undefined'
      ? '[   -   ]'
      : '[  obj  ]';
  console.log(`${icon} ${path} = ${value}`);
}

const found = Object.entries(scanResults).filter(([, v]) => String(v).includes('CIP-0103'));
console.log('');
console.log(`Total CIP-0103 Providers: ${found.length}`);

if (probes.length > 0) {
  console.log('');
  console.log('Probe Results:');
  for (const p of probes) {
    console.log(`  ${p.path}:`);
    if (p.status) console.log(`    ${p.status}`);
    if (p.error) console.log(`    ERROR: ${p.error}`);
  }
}

await context.close();
