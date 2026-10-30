import { expect, test } from '@playwright/test';

// Every documentation variant is served from the same origin and the browser caches by URL alone, so a file whose
// name stays the same between builds must be revalidated, or opening another variant mixes two builds until a hard
// reload. The headers come from the documentation host, so these tests pass only against a deployed Storybook.
test.describe('Storybook caching', () => {
    test('files with stable names are revalidated', async ({ page }) => {
        const index = await page.request.get('/index.json');
        const runtime = await page.request.get('/sb-manager/runtime.js');

        expect(index.headers()['cache-control']).toContain('no-cache');
        expect(runtime.headers()['cache-control']).toContain('no-cache');
    });

    test('hashed assets are cached as immutable', async ({ page }) => {
        const iframe = await (await page.request.get('/iframe.html')).text();
        const asset = /assets\/iframe-[\w-]+\.js/.exec(iframe)?.[0];

        expect(asset).toBeDefined();

        const response = await page.request.get(`/${asset}`);

        expect(response.headers()['cache-control']).toContain('immutable');
    });
});
