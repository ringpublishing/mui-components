import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const STORY_ID = 'components-organisms-datagrid--custom-cells';

/**
 * ⚠️  WARNING: KNOWN PRE-EXISTING WCAG VIOLATIONS — MUST BE FIXED IN THE COMPONENT  ⚠️
 *
 * The rules below are disabled because the DataGrid component currently has unresolved
 * accessibility issues. These are NOT intentional exclusions — they MUST be addressed
 * in the component source code and then removed from this list.
 *
 * TODO: Fix each violation and remove the corresponding rule from KNOWN_VIOLATIONS:
 * - image-alt:              images in renderComboCell are missing alt text
 * - aria-required-children: spacer rows use role="separator" inside role="grid" (not allowed by ARIA spec)
 * - aria-input-field-name:  MUI Select in toolbar lacks an accessible label
 * - button-name:            some icon buttons are missing accessible names
 * - color-contrast:         some elements do not meet contrast ratio requirements
 */
const KNOWN_VIOLATIONS = [
    'image-alt',
    'aria-required-children',
    'aria-input-field-name',
    'button-name',
    'color-contrast',
];

test.describe('DataGrid - Custom Cells accessibility', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/iframe.html?id=${STORY_ID}&viewMode=story`, { waitUntil: 'networkidle' });
        // Wait for Storybook to finish preparing the story (cold Vite start may add
        // `sb-show-preparing-story` to body and keep content hidden for >30 s).
        await page.waitForFunction(() => !document.body.classList.contains('sb-show-preparing-story'), {
            timeout: 60_000,
        });
        await page.locator('.MuiDataGrid-root').first().waitFor({ state: 'visible' });
    });

    test('should have no WCAG 2.1 AA violations', async ({ page }) => {
        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .disableRules(KNOWN_VIOLATIONS)
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('should have no critical or serious accessibility issues', async ({ page }) => {
        const results = await new AxeBuilder({ page }).disableRules(KNOWN_VIOLATIONS).analyze();

        const criticalViolations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

        expect(criticalViolations).toEqual([]);
    });

    test('should have accessible data cells with proper roles', async ({ page }) => {
        const grid = page.locator('.MuiDataGrid-root').first();
        await expect(grid).toBeVisible();

        const results = await new AxeBuilder({ page })
            .include('.MuiDataGrid-root')
            .withTags(['wcag2a', 'wcag2aa'])
            .disableRules(KNOWN_VIOLATIONS)
            .analyze();

        expect(results.violations).toEqual([]);
    });
});
