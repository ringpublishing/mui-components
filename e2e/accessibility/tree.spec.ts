import { test, expect } from '@playwright/test';
import { gotoStory } from '../storybook.js';
import { expectNoWcagViolations } from './axe.js';

const TREE = '[role="tree"]';

/**
 * Rows of every tree component: the expand icon is a pointer affordance (expansion belongs to the tree
 * item), each row checkbox is named after its row, and dnd-kit's live region is rendered outside the
 * `role="tree"` list, where only tree items may live.
 */
test.describe('Tree components - WCAG accessibility', () => {
    test('DataTree Default story has no WCAG 2.1 AA violations and names every row checkbox', async ({ page }) => {
        await gotoStory(page, 'components-organisms-datatree--default', TREE);

        await expectNoWcagViolations(page);
        await expect(page.getByRole('checkbox', { name: 'Item 0.0' })).toBeChecked();
    });

    test('DataTree ControlledSelection story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-organisms-datatree--controlled-selection', TREE);

        await expectNoWcagViolations(page);
    });

    test('DataTree WithExternalQueryClient story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-organisms-datatree--with-external-query-client', TREE);

        await expectNoWcagViolations(page);
    });

    test('SimpleTree Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-organisms-simpletree--default', TREE);

        await expectNoWcagViolations(page);
    });

    test('SimpleTree WithCustomElements story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-organisms-simpletree--with-custom-elements', TREE);

        await expectNoWcagViolations(page);
    });

    test('SimpleTree ControlledSelection story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-organisms-simpletree--controlled-selection', TREE);

        await expectNoWcagViolations(page);
    });

    test('TreeView Default story has no WCAG 2.1 AA violations and names every row checkbox', async ({ page }) => {
        await gotoStory(page, 'components-organisms-treeview-deprecated--default', TREE);

        await expectNoWcagViolations(page);
        await expect(page.getByRole('checkbox', { name: 'Item 0.0' })).toBeChecked();
    });

    test('TreeView ControlledSelection story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-organisms-treeview-deprecated--controlled-selection', TREE);

        await expectNoWcagViolations(page);
    });
});
