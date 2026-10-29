import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * The conformance level every suite in this directory asserts.
 *
 * Shared, like `gotoStory`, because three copies of a tag list is how one suite quietly stops
 * checking what the others check.
 */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

// color-contrast is excluded because label/brand color decisions belong to the UX/design team.
export const EXCLUDED_RULES = ['color-contrast'] as const;

/**
 * Assert the current page has no WCAG 2.1 AA violations.
 *
 * `extraDisabledRules` is for a KNOWN, DELIBERATE exception and nothing else — pass it only next to
 * a comment saying which rule, on which story, and why it is not being fixed. Every call site that
 * passes nothing is asserting the full rule set, which is the point.
 */
export async function expectNoWcagViolations(page: Page, extraDisabledRules: readonly string[] = []): Promise<void> {
    const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .disableRules([...EXCLUDED_RULES, ...extraDisabledRules])
        .analyze();

    expect(results.violations).toEqual([]);
}
