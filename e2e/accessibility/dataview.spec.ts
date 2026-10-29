import { test } from '@playwright/test';
import { gotoStory } from '../storybook.js';
import { expectNoWcagViolations } from './axe.js';

test.describe('DataView - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--default', '.ring-dataview');

        await expectNoWcagViolations(page);
    });

    test('WithDynamicWidthFilter story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--with-dynamic-width-filter', '.ring-dataview');

        await expectNoWcagViolations(page);
    });

    test('WithoutDetailAndFilter story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--without-detail-and-filter', '.ring-dataview');

        await expectNoWcagViolations(page);
    });

    test('WithMultimediaGrid story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--with-multimedia-grid', '.ring-dataview');

        await expectNoWcagViolations(page);
    });

    test('WithSelectionMode story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--with-selection-mode', '.ring-dataview');

        await expectNoWcagViolations(page);
    });

    test('WithBottomBarSelection story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-templates-dataview--with-bottom-bar-selection', '.ring-dataview');

        await expectNoWcagViolations(page);
    });
});
