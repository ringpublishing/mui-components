/*
 * Scans the Docs and Story pages of a built or dev Storybook for render failures
 * that never reach the console: Storybook catches them in an error boundary and
 * paints them as text where the block should be, so `console.error` often stays empty.
 *
 * Usage:   npm run test:stories            (defaults to http://localhost:6006)
 *          STORYBOOK_URL=http://localhost:6018 npm run test:stories
 *          node scripts/docscan.mjs <url> [fragment-id]
 */
import { chromium } from '@playwright/test';

const base = (process.argv[2] || 'http://localhost:6006').replace(/\/$/, '');
const filter = process.argv[3] || '';

// Phrases whose presence in the page text means a block failed to render.
const SIGNATURES = [
    // ONLY the phrases Storybook itself uses to describe a failed render. Generic ones
    // ('TypeError:', 'SyntaxError:', 'is not a function') matched PROSE — the changelog on
    // the Introduction page describes a fixed bug as "crashes with SyntaxError", which
    // tripped the detector on a page with nothing wrong.
    'Default export is not a React component',
    "Invalid value passed to the 'of' prop",
    'The component failed to render properly',
    'Unable to render story',
    'Storybook preview hooks can only be called',
];

const index = await (await fetch(`${base}/index.json`)).json();
const all = Object.values(index.entries).filter((e) => !filter || e.id.includes(filter));
// Scan BOTH view modes. A story can render fine on its own and break only inside Docs
// (or the other way round) — skipping either mode lets defects through.
const entries = all.filter((e) => e.type === 'docs' || e.type === 'story');

const counts = entries.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }), {});
console.log(`Scanning ${entries.length} entries on ${base} (docs: ${counts.docs || 0}, story: ${counts.story || 0})\n`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const findings = [];

for (const entry of entries) {
    const consoleErrors = [];
    const pageErrors = [];
    // Noise present on EVERY page (a missing asset, emotion's :first-child warnings).
    // Left in the report it floods the output and buries the real hits.
    const NOISE = /Failed to load resource|:first-child" is potentially unsafe|kebab-case for css properties/;
    const onConsole = (m) => {
        if (m.type() === 'error' && !NOISE.test(m.text())) consoleErrors.push(m.text().slice(0, 300));
    };
    const onPageError = (e) => pageErrors.push(String(e.message).slice(0, 300));
    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    try {
        const viewMode = entry.type === 'docs' ? 'docs' : 'story';
        await page.goto(`${base}/iframe.html?viewMode=${viewMode}&id=${entry.id}`, {
            waitUntil: 'networkidle',
            timeout: 60000,
        });

        // Blocks mount lazily — scroll through the whole page to force them to render.
        await page.evaluate(async () => {
            const step = window.innerHeight;
            for (let y = 0; y < document.body.scrollHeight + step; y += step) {
                window.scrollTo(0, y);
                await new Promise((r) => setTimeout(r, 120));
            }
            window.scrollTo(0, 0);
        });
        await page.waitForTimeout(1200);

        const text = await page.locator('body').innerText();
        const hits = SIGNATURES.filter((s) => text.includes(s));

        // Storybook's error container EXISTS on every page, it is just hidden most of the
        // time — merely counting it reported 259 hits out of 259. Only visible ones count.
        const boundaries = await page.evaluate(
            () =>
                [...document.querySelectorAll('.sb-show-errordisplay, .sb-errordisplay')].filter(
                    (el) => el.getBoundingClientRect().height > 0,
                ).length,
        );

        if (hits.length || pageErrors.length || boundaries) {
            findings.push({
                id: entry.id,
                title: entry.title,
                type: entry.type,
                hits,
                boundaries,
                consoleErrors,
                pageErrors,
                text,
            });
        }
    } catch (e) {
        findings.push({
            id: entry.id,
            title: entry.title,
            type: entry.type,
            hits: ['NAVIGATION: ' + e.message.slice(0, 120)],
            boundaries: 0,
            consoleErrors,
            pageErrors,
            text: '',
        });
    }

    page.off('console', onConsole);
    page.off('pageerror', onPageError);
}

await browser.close();

// `process.exit()` truncates unflushed stdout when output is redirected to a file — an
// earlier run left nothing but the header. Set the exit code and let the process end on its own.
if (!findings.length) {
    console.log(`Clean — ${entries.length} entries, none reports an error.`);
    process.exitCode = 0;
}

for (const f of findings) {
    console.log('─'.repeat(78));
    console.log(`${f.title}  [${f.type}]\n  ${f.id}`);
    if (f.hits.length) console.log('  SIGNATURES: ' + f.hits.join(' | '));
    if (f.boundaries) console.log(`  failed blocks: ${f.boundaries}`);
    for (const e of f.pageErrors.slice(0, 3)) console.log('  pageerror: ' + e);
    for (const e of f.consoleErrors.slice(0, 3)) console.log('  console:   ' + e);
    // Print the text around the first signature so it is clear WHICH block failed.
    const first = f.hits.find((h) => f.text.includes(h));
    if (first) {
        const at = f.text.indexOf(first);
        console.log('  context:   …' + f.text.slice(Math.max(0, at - 220), at + 120).replace(/\s+/g, ' ') + '…');
    }
}
if (findings.length) {
    console.log('─'.repeat(78));
    console.log(`\nPages with problems: ${findings.length} of ${entries.length}`);
    process.exitCode = 1;
}
