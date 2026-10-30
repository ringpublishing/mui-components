import { expect, test } from '@playwright/test';

interface StorybookIndex {
    entries: Record<string, { tags?: string[] }>;
}

// `/v1/` is served by the documentation host, not by a Storybook build, so the first two tests pass only against
// a deployed Storybook.
test.describe('Storybook versions', () => {
    test('v1 index serves the 1.19 build', async ({ page }) => {
        const response = await page.request.get('/v1/index.json');

        expect(response.status()).toBe(200);

        const { entries } = (await response.json()) as StorybookIndex;
        const taggedForTwo = Object.entries(entries)
            .filter(([, entry]) => entry.tags?.some((tag) => tag.startsWith('new@2.')))
            .map(([id]) => id);

        expect(Object.keys(entries)).toContain('introduction--docs');
        expect(taggedForTwo).toEqual([]);
    });

    test('v1 manager loads', async ({ page }) => {
        const iframeResponse = page.waitForResponse((response) =>
            new URL(response.url()).pathname.endsWith('/v1/iframe.html'),
        );
        const response = await page.goto('/v1/index.html?path=/docs/introduction--docs');

        expect(response?.status()).toBe(200);
        await expect(page.locator('#storybook-preview-iframe')).toBeVisible();
        expect((await iframeResponse).status()).toBe(200);
    });

    test('version select lists 1.19', async ({ page }) => {
        await page.goto('/?path=/docs/introduction--docs');
        await page.getByRole('button', { name: /^Documentation version v\d+\.\d+/ }).click();

        await expect(page.getByText('v1.19', { exact: true })).toBeVisible();
    });
});
