import { test, expect } from '@playwright/test';
import { gotoStory } from '../storybook.js';
import { expectNoWcagViolations } from './axe.js';

/**
 * ⚠️  KNOWN, DELIBERATE VIOLATION — DO NOT ADD TO OTHER SUITES  ⚠️
 *
 * `nested-interactive` fires on a keyboard-draggable `SortableList` whose items contain interactive
 * content of their own — of the stories below, only `Default` (its rows carry action buttons).
 * dnd-kit marks a keyboard-operable draggable with `role="button"` + `tabindex="0"` on the item
 * wrapper, and axe reports any focusable descendant of an interactive role.
 *
 * It is NOT fixed here. Stripping the role is what ends the violation, and that is exactly the
 * keyboard-drag affordance these orientations have shipped with since 1.x: the item would stop
 * announcing itself as a sortable draggable and stop being the element the `KeyboardSensor`
 * activates on. The pointer-only collections — `wrap` and `Autocomplete` `sortableChips` — already
 * drop the whole attribute set (they have no `KeyboardSensor` to back it), which is why they are
 * asserted below with no exclusions at all.
 *
 * It is disabled on the ONE story that trips it and nowhere else, deliberately: a suite-wide
 * exclusion would also stop `WithDragHandle` and `Horizontal` from reporting the day their items
 * gain interactive content.
 *
 * Retiring it needs a keyboard-drag design that does not put an interactive role on a container —
 * a separate handle owning the role, most likely. Tracked with the deferred chip keyboard sorting
 * (RINGVALBCK-12698).
 */
const KEYBOARD_DRAGGABLE_KNOWN_VIOLATIONS = ['nested-interactive'] as const;

const LIST_ROOT = '[data-testid="ring-sortablelist"]';

test.describe('SortableList - WCAG accessibility', () => {
    test('Default story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-organisms-sortablelist--default', LIST_ROOT);

        await expectNoWcagViolations(page, KEYBOARD_DRAGGABLE_KNOWN_VIOLATIONS);
    });

    test('WithDragHandle story has no WCAG 2.1 AA violations and names every handle', async ({ page }) => {
        // The regression this suite exists for: `SortableList.DragHandle` is an icon-only
        // `IconButton`, and without an accessible name it failed `button-name` (critical) on every
        // item — the one story where the violation is the component's own and not the story's.
        await gotoStory(page, 'components-organisms-sortablelist--with-drag-handle', LIST_ROOT);

        // No `nested-interactive` exclusion: the handle is the item's only interactive content and
        // it is the activator, not a nested control, so this story has to come back clean.
        await expectNoWcagViolations(page);
        // Asserted on the same page load, next to the axe run it explains: `button-name` passing is
        // the rule, this is the string the rule is satisfied WITH.
        await expect(page.getByRole('button', { name: 'Drag to reorder' })).toHaveCount(3);
    });

    test('Horizontal story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-organisms-sortablelist--horizontal', LIST_ROOT);

        // Keyboard-draggable, but its items carry no interactive content, so no exclusion either.
        await expectNoWcagViolations(page);
    });

    test('Wrap story has no WCAG 2.1 AA violations', async ({ page }) => {
        // Pointer-only: no `nested-interactive` exclusion, because the items carry no interactive
        // role to nest anything inside.
        await gotoStory(page, 'components-organisms-sortablelist--wrap', LIST_ROOT);

        await expectNoWcagViolations(page);
    });
});

test.describe('Autocomplete sortableChips - WCAG accessibility', () => {
    test('WithSortableChips story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-molecules-autocomplete--with-sortable-chips', '.ring-autocomplete');

        await expectNoWcagViolations(page);
    });

    test('WithSortableChipActions story has no WCAG 2.1 AA violations', async ({ page }) => {
        await gotoStory(page, 'components-molecules-autocomplete--with-sortable-chip-actions', '.ring-autocomplete');

        await expectNoWcagViolations(page);
    });
});
