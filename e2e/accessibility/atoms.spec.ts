import { test } from '@playwright/test';
import { gotoStory } from '../storybook.js';
import { expectNoWcagViolations } from './axe.js';

// ─────────────────────────────────────────────────────────────────
// TextField
// ─────────────────────────────────────────────────────────────────

test.describe('TextField - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-molecules-textfield--default', '.ring-textfield');

        await expectNoWcagViolations(page);
    });

    test('Controlled story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-molecules-textfield--controlled', '.ring-textfield');

        await expectNoWcagViolations(page);
    });
});

// ─────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────

test.describe('Typography - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-typography--default', 'body');

        await expectNoWcagViolations(page);
    });

    test('WithOverflowAndTooltip story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-atoms-typography--with-overflow-and-tooltip', 'body');

        await expectNoWcagViolations(page);
    });
});

// ─────────────────────────────────────────────────────────────────
// DatePicker
// ─────────────────────────────────────────────────────────────────

test.describe('DatePicker - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-molecules-dates-datepicker--default', '.ring-date-picker');

        await expectNoWcagViolations(page);
    });

    test('Label story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-molecules-dates-datepicker--label', '.ring-date-picker');

        await expectNoWcagViolations(page);
    });
});

// ─────────────────────────────────────────────────────────────────
// DateTimePicker
// ─────────────────────────────────────────────────────────────────

test.describe('DateTimePicker - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-molecules-dates-datetimepicker--default', '.ring-date-time-picker');

        await expectNoWcagViolations(page);
    });
});

// ─────────────────────────────────────────────────────────────────
// TimePicker
// ─────────────────────────────────────────────────────────────────

test.describe('TimePicker - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-molecules-dates-timepicker--default', '.ring-time-picker');

        await expectNoWcagViolations(page);
    });

    test('Label story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-molecules-dates-timepicker--label', '.ring-time-picker');

        await expectNoWcagViolations(page);
    });
});
