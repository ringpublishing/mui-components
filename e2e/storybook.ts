import type { Page } from '@playwright/test';

/**
 * Navigate to a Storybook iframe story and wait for the element to render.
 *
 * On first load (cold Vite start) Storybook adds `sb-show-preparing-story` to <body>,
 * which hides its content until the story module is compiled. We wait for that class
 * to be removed before asserting on the target selector, using a generous timeout to
 * accommodate the initial Vite compilation pass.
 *
 * Shared by every spec in this directory: the accessibility suites and the interaction
 * suites open stories exactly the same way, and two drifting copies of this function is
 * how one suite silently stops waiting for the same thing as the other.
 */
export async function gotoStory(page: Page, storyId: string, waitSelector: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.body.classList.contains('sb-show-preparing-story'), {
        timeout: 60_000,
    });
    await page.locator(waitSelector).first().waitFor({ state: 'visible' });
}
