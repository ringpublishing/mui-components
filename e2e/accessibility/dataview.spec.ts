import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

// color-contrast is excluded because label/brand color decisions belong to the UX/design team.
const EXCLUDED_RULES = ['color-contrast'] as const;

/**
 * Helper: navigate to a Storybook iframe story and wait for the element to render.
 *
 * On first load (cold Vite start) Storybook adds `sb-show-preparing-story` to <body>,
 * which hides its content until the story module is compiled. We wait for that class
 * to be removed before asserting on the target selector, using a generous timeout to
 * accommodate the initial Vite compilation pass.
 */
async function gotoStory(page: Page, storyId: string, waitSelector: string): Promise<void> {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.body.classList.contains('sb-show-preparing-story'), {
        timeout: 60_000,
    });
    await page.locator(waitSelector).first().waitFor({ state: 'visible' });
}

test.describe('DataView - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--default', '.ring-dataview');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('WithDynamicWidthFilter story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--with-dynamic-width-filter', '.ring-dataview');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('WithoutDetailAndFilter story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--without-detail-and-filter', '.ring-dataview');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('WithMultimediaGrid story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--with-multimedia-grid', '.ring-dataview');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('WithSelectionMode story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--with-selection-mode', '.ring-dataview');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('WithBottomBarSelection story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--with-bottom-bar-selection', '.ring-dataview');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });
});
