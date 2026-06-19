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

// ─────────────────────────────────────────────────────────────────
// TextField
// ─────────────────────────────────────────────────────────────────

test.describe('TextField - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-textfield--default', '.ring-textfield');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('Controlled story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-textfield--controlled', '.ring-textfield');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────

test.describe('Typography - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-typography--default', 'body');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('WithOverflowAndTooltip story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-typography--with-overflow-and-tooltip', 'body');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────
// DatePicker
// ─────────────────────────────────────────────────────────────────

test.describe('DatePicker - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-dates-datepicker--default', '.ring-date-picker');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('Label story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-dates-datepicker--label', '.ring-date-picker');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────
// DateTimePicker
// ─────────────────────────────────────────────────────────────────

test.describe('DateTimePicker - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-dates-datetimepicker--default', '.ring-date-time-picker');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────
// TimePicker
// ─────────────────────────────────────────────────────────────────

test.describe('TimePicker - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-dates-timepicker--default', '.ring-time-picker');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('Label story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-dates-timepicker--label', '.ring-time-picker');

        const results = await new AxeBuilder({ page })
            .withTags(WCAG_TAGS)
            .disableRules([...EXCLUDED_RULES])
            .analyze();

        expect(results.violations).toEqual([]);
    });
});
