import { chromium } from 'playwright';

export async function open({ width = 1440, height = 900 } = {}) {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width, height } })).newPage();

  // Runtime errors that assertions would never catch.
  const errors = [];
  page.on('pageerror', (e) => { errors.push(e.message); console.log('!! PAGE ERROR:', e.message); });
  page.on('console', (m) => { if (m.type() === 'error') console.log('!! CONSOLE:', m.text()); });

  return { browser, page, errors };
}

export function checker() {
  let failures = 0;
  const check = (label, actual, expected) => {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(`    ${ok ? 'PASS' : 'FAIL'}  ${label}` +
      (ok ? '' : `\n           expected ${JSON.stringify(expected)}\n           actual   ${JSON.stringify(actual)}`));
    if (!ok) failures++;
  };
  return { check, done: () => failures };
}
