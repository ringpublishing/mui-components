import { expect, test, type Locator, type Page } from '@playwright/test';
import { gotoStory } from '../storybook.js';

/**
 * Drag&drop coverage for the shared sortable engine (`src/components/internal/SortableChips.tsx`)
 * and its two public surfaces: `Autocomplete.sortableChips` and `SortableList`.
 *
 * WHY THIS IS AN E2E SUITE. The gesture cannot be tested in jsdom: dnd-kit's `PointerSensor`
 * needs real pointer events with `setPointerCapture`, and the drop animation needs the Web
 * Animations API. jsdom has neither, so the unit suite can only cover the pure helpers
 * (`reorderById`, `resolveDropTransform`, `dropKeyframes`, `settle`, `describeItemPosition`).
 * Everything below drives Chromium's real input pipeline.
 *
 * HOW A DRAG IS DRIVEN. `page.dragTo()` and a single `mouse.move()` jump do NOT start a dnd-kit
 * drag — the sensor needs the activation constraint satisfied by a sequence of real moves. Every
 * gesture here is therefore `mouse.move` → `mouse.down()` → (hold) → several `mouse.move` steps →
 * `mouse.up()`. dnd-kit's `closestCenter` compares the DRAGGED ITEM'S translated rect centre with
 * the droppable centres, so moving the pointer from the source centre to the target centre puts
 * the dragged rect exactly over the target — that is why every gesture goes centre → centre.
 *
 * RUNNING THIS LOCALLY. `playwright.config.ts` points `baseURL` at the PUBLISHED Storybook
 * (`https://design.ringpublishing.com`), which does not carry an unreleased branch. To exercise a
 * branch's own build:
 *
 *     npm run build:storybook
 *     npx http-server storybook-static -p 6007      # or any static server
 *     E2E_BASE_URL=http://127.0.0.1:6007 npx playwright test e2e/interactions/sortable.spec.ts
 */

/**
 * `vertical` / `horizontal` use `SortablePointerSensor` with `activationConstraint: { distance: 5 }`
 * — `LIST_SENSOR_ACTIVATION` in src/components/internal/SortableChips.tsx.
 */
const LIST_ACTIVATION_DISTANCE_PX = 5;

/**
 * `wrap` (and therefore every Autocomplete sortable chip) uses a plain `PointerSensor` with
 * `activationConstraint: { delay: 125, tolerance: 10 }` —
 * `CHIP_SENSOR_OPTIONS` in src/components/internal/SortableChips.tsx.
 */
const CHIP_ACTIVATION_DELAY_MS = 125;
const CHIP_ACTIVATION_TOLERANCE_PX = 10;

/**
 * Comfortably inside the 180ms drop animation (`DROP_DURATION_MS` in
 * src/components/internal/SortableChips.tsx) and clear of the release itself, so a click fired at
 * this delay lands while the ghost is still in the air.
 */
const DROP_MID_ANIMATION_MS = 100;

interface Point {
    x: number;
    y: number;
}

async function centre(locator: Locator): Promise<Point> {
    const box = await locator.boundingBox();

    if (box === null) {
        throw new Error('Element has no layout box, cannot aim a pointer at it.');
    }

    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

interface DragOptions {
    /** Press-and-hold before moving. Needed for the `wrap` sensor's activation delay. */
    holdMs?: number;
    /** Number of intermediate `mouse.move` calls. dnd-kit needs several, not one jump. */
    steps?: number;
    /** Pause between moves, so React commits the live reorder between them. */
    stepDelayMs?: number;
}

/**
 * Move the pointer from `from` to `to` in `steps` increments, pausing between them. Does not press
 * or release, so it also serves the tests that continue a drag that is already live.
 */
async function travel(page: Page, from: Point, to: Point, options: DragOptions = {}): Promise<void> {
    const { steps = 12, stepDelayMs = 20 } = options;

    for (let step = 1; step <= steps; step++) {
        await page.mouse.move(from.x + ((to.x - from.x) * step) / steps, from.y + ((to.y - from.y) * step) / steps);
        await page.waitForTimeout(stepDelayMs);
    }
}

/**
 * Press at `from` and travel to `to`, leaving the pointer DOWN at `to` with the drag still live.
 * Half the tests here assert something mid-drag — the ghost, the drop slot, the live region — so
 * the press-and-travel half is the reusable one; `dragPointer` is this plus the release.
 */
async function beginDrag(page: Page, from: Point, to: Point, options: DragOptions = {}): Promise<void> {
    const { holdMs = 0 } = options;

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();

    if (holdMs > 0) {
        await page.waitForTimeout(holdMs);
    }

    await travel(page, from, to, options);
}

/** Press at `from`, travel to `to` in several steps, release. Leaves the pointer at `to`. */
async function dragPointer(page: Page, from: Point, to: Point, options: DragOptions = {}): Promise<void> {
    await beginDrag(page, from, to, options);
    await page.mouse.up();
}

// ─────────────────────────────────────────────────────────────────
// Autocomplete — sortable chips (the `wrap` engine)
// ─────────────────────────────────────────────────────────────────

/** Every selected chip, in committed order. The suffix-less story emits `ring-autocomplete-chip-N`. */
const chips = (page: Page): Locator => page.locator('[data-testid^="ring-autocomplete-chip-"]');

test.describe('Autocomplete sortableChips - pointer drag', () => {
    test('Dragging a chip onto another chip commits the new order', async ({ page }) => {
        await gotoStory(page, 'components-molecules-autocomplete--with-sortable-chips', '.ring-autocomplete');

        await expect(chips(page)).toHaveText(['Onet', 'Fakt', 'Komputer świat', 'Newsweek']);

        const from = await centre(page.getByTestId('ring-autocomplete-chip-3'));
        const to = await centre(page.getByTestId('ring-autocomplete-chip-0'));

        await dragPointer(page, from, to, { holdMs: CHIP_ACTIVATION_DELAY_MS + 75, steps: 14 });

        // The last chip was dropped on the first slot, so it leads and the rest shift down one.
        // `toHaveText` retries, which also waits out the 180ms drop animation.
        await expect(chips(page)).toHaveText(['Newsweek', 'Onet', 'Fakt', 'Komputer świat']);
        // The per-chip test id is derived from the COMMITTED index, so this pins the commit
        // itself rather than the DOM order the live preview already showed mid-drag.
        await expect(page.getByTestId('ring-autocomplete-chip-0')).toHaveText('Newsweek');
    });

    test('Dropping a dragged chip leaves no ghost and no drop-slot placeholder behind', async ({ page }) => {
        await gotoStory(page, 'components-molecules-autocomplete--with-sortable-chips', '.ring-autocomplete');

        const from = await centre(page.getByTestId('ring-autocomplete-chip-3'));
        const to = await centre(page.getByTestId('ring-autocomplete-chip-0'));

        await beginDrag(page, from, to, { holdMs: CHIP_ACTIVATION_DELAY_MS + 75, steps: 14 });

        // Mid-drag there are FIVE chips carrying the test id: the four in the list plus the
        // `DragOverlay` ghost, which renders the same chip a second time. That is the assertion
        // that the ghost exists at all; the in-list copy is hidden under the dashed drop slot.
        await expect(chips(page)).toHaveCount(5);
        await expect(page.getByTestId('ring-autocomplete-chip-3')).toHaveCount(2);

        await page.mouse.up();

        // Back to four once the drop animation settles: the ghost is unmounted and the item that
        // was hidden under the placeholder is painted again. A stranded ghost (the failure mode
        // dnd-kit's default `dropAnimation` produces when its promise never settles) would keep
        // this at five; a stuck placeholder would keep `Newsweek` invisible.
        await expect(chips(page)).toHaveCount(4);
        await expect(page.getByTestId('ring-autocomplete-chip-0')).toBeVisible();
        await expect(page.getByTestId('ring-autocomplete-chip-0')).toHaveText('Newsweek');
    });

    test('Deleting a chip while the drop ghost is still flying applies to the committed order', async ({ page }) => {
        // The drop animation runs 180ms. A delete clicked inside that window must run against the
        // committed order, not the PRE-drop value and the previous render's MUI `getItemProps`
        // closures, or it throws the reorder away: this drag+delete must give
        // ['Newsweek', 'Onet', 'Fakt'] at t+100ms as it does from t+200ms. The window is real time, so
        // only a real browser can express it; jsdom has neither the pointer pipeline nor the Web
        // Animations API the window is made of.
        await gotoStory(page, 'components-molecules-autocomplete--with-sortable-chips', '.ring-autocomplete');

        await expect(chips(page)).toHaveText(['Onet', 'Fakt', 'Komputer świat', 'Newsweek']);

        const from = await centre(page.getByTestId('ring-autocomplete-chip-3'));
        const to = await centre(page.getByTestId('ring-autocomplete-chip-0'));

        await beginDrag(page, from, to, { holdMs: CHIP_ACTIVATION_DELAY_MS + 75, steps: 14 });

        // Aimed while the drag is still up, so the click can be fired at a controlled delay after
        // the release instead of after a locator round-trip. The live reorder has already put
        // "Komputer świat" in its final slot and the ghost ("Newsweek") is flying to the OTHER end
        // of the row, so this point is neither moving nor covered. Matched by label rather than
        // position: the per-chip test id encodes the committed index, which is exactly what this
        // test accuses of being stale.
        const deleteIcon = await centre(chips(page).filter({ hasText: 'Komputer świat' }).locator('svg.lucide-x'));

        await page.mouse.up();
        await page.waitForTimeout(DROP_MID_ANIMATION_MS);
        await page.mouse.click(deleteIcon.x, deleteIcon.y);

        // The delete has to apply to the order the drop just committed. Removing "Komputer świat"
        // from ['Newsweek', 'Onet', 'Fakt', 'Komputer świat'] leaves the first three; applying it to
        // the pre-drop value instead removes index 2 of ['Onet', 'Fakt', 'Komputer świat',
        // 'Newsweek'] and reverts the reorder as well.
        await expect(chips(page)).toHaveText(['Newsweek', 'Onet', 'Fakt']);
    });

    test('A quick tap on the delete icon removes the chip instead of starting a reorder', async ({ page }) => {
        await gotoStory(page, 'components-molecules-autocomplete--with-sortable-chips', '.ring-autocomplete');

        await expect(chips(page)).toHaveText(['Onet', 'Fakt', 'Komputer świat', 'Newsweek']);

        const deleteIcon = await centre(page.getByTestId('ring-autocomplete-chip-1').locator('svg.lucide-x'));

        // Press and release with no hold at all — the case the 125ms activation delay protects.
        await page.mouse.move(deleteIcon.x, deleteIcon.y);
        await page.mouse.down();
        await page.mouse.up();

        // "Fakt" is gone AND the survivors kept their relative order: a tap that had been
        // promoted to a drag would have reordered them instead of (or as well as) deleting.
        await expect(chips(page)).toHaveText(['Onet', 'Komputer świat', 'Newsweek']);
    });

    test('A flick faster than the activation delay neither reorders nor leaves a ghost', async ({ page }) => {
        await gotoStory(page, 'components-molecules-autocomplete--with-sortable-chips', '.ring-autocomplete');

        const from = await centre(page.getByTestId('ring-autocomplete-chip-3'));
        const to = await centre(page.getByTestId('ring-autocomplete-chip-0'));

        expect(Math.abs(from.y - to.y)).toBeGreaterThan(CHIP_ACTIVATION_TOLERANCE_PX);

        // No hold: the pointer travels further than `tolerance: 10` before the 125ms delay is up,
        // which cancels activation outright. This is the other half of the tap protection — a
        // fast swipe across a chip row must not be read as a reorder.
        await dragPointer(page, from, to, { holdMs: 0, steps: 6, stepDelayMs: 0 });

        await expect(chips(page)).toHaveText(['Onet', 'Fakt', 'Komputer świat', 'Newsweek']);
        await expect(chips(page)).toHaveCount(4);
    });

    test('A quick tap still reaches the chip action a renderChip consumer wires up', async ({ page }) => {
        // `WithSortableChipActions` is the repository's only story that composes `sortableChips`
        // with a `renderChip` affordance of its own (the "set as main" click). Tapping a
        // chip must run that handler rather than picking the chip up.
        await gotoStory(page, 'components-molecules-autocomplete--with-sortable-chip-actions', '.ring-autocomplete');

        await expect(chips(page)).toHaveText(['Onet', 'Fakt', 'Auto Świat']);
        await expect(page.getByTestId('ring-autocomplete-chip-0')).toHaveClass(/MuiChip-colorPrimary/);
        await expect(page.getByTestId('ring-autocomplete-chip-1')).not.toHaveClass(/MuiChip-colorPrimary/);

        const chip = await centre(page.getByTestId('ring-autocomplete-chip-1'));

        await page.mouse.move(chip.x, chip.y);
        await page.mouse.down();
        await page.mouse.up();

        // The tap landed on the chip's own handler…
        await expect(page.getByTestId('ring-autocomplete-chip-1')).toHaveClass(/MuiChip-colorPrimary/);
        await expect(page.getByTestId('ring-autocomplete-chip-0')).not.toHaveClass(/MuiChip-colorPrimary/);
        // …and not on the sortable engine.
        await expect(chips(page)).toHaveText(['Onet', 'Fakt', 'Auto Świat']);
    });
});

// ─────────────────────────────────────────────────────────────────
// SortableList — vertical and horizontal (the `distance: 5` engine)
// ─────────────────────────────────────────────────────────────────

/** Item wrappers in DOM order; `SortableList` emits `ring-sortablelist-item-<id>`. */
const listItems = (page: Page): Locator => page.locator('[data-testid^="ring-sortablelist-item-"]');

function listOrder(page: Page): Promise<(string | null)[]> {
    return listItems(page).evaluateAll((elements) => elements.map((element) => element.getAttribute('data-testid')));
}

test.describe('SortableList - pointer drag activation distance', () => {
    test('A pointer travel shorter than the activation distance does not pick the item up', async ({ page }) => {
        await gotoStory(page, 'components-organisms-sortablelist--default', '[data-testid="ring-sortablelist-item-1"]');

        const item = page.getByTestId('ring-sortablelist-item-1');
        const from = await centre(item);

        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await page.mouse.move(from.x, from.y + LIST_ACTIVATION_DISTANCE_PX - 2);
        await page.waitForTimeout(120);

        // No ghost: the item's text exists exactly once, and the wrapper still advertises `grab`
        // (`SortableItem` switches it to `grabbing` only while `isDragging`).
        await expect(page.getByText('Field (id: 1) - Pizza')).toHaveCount(1);
        await expect(item).toHaveJSProperty('style.cursor', 'grab');

        await page.mouse.up();

        expect(await listOrder(page)).toEqual([
            'ring-sortablelist-item-1',
            'ring-sortablelist-item-2',
            'ring-sortablelist-item-3',
        ]);
    });

    test('A pointer travel past the activation distance picks the item up and reorders the list', async ({ page }) => {
        await gotoStory(page, 'components-organisms-sortablelist--default', '[data-testid="ring-sortablelist-item-1"]');

        const item = page.getByTestId('ring-sortablelist-item-1');
        const from = await centre(item);
        const to = await centre(page.getByTestId('ring-sortablelist-item-3'));

        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await page.mouse.move(from.x, from.y + LIST_ACTIVATION_DISTANCE_PX + 4);

        // Two copies of the item: the one in the list (hidden under the dashed drop slot) and the
        // `DragOverlay` ghost following the pointer. Both assertions retry, which is the wait.
        await expect(page.getByText('Field (id: 1) - Pizza')).toHaveCount(2);
        await expect(item).toHaveJSProperty('style.cursor', 'grabbing');

        await travel(page, from, { x: from.x, y: to.y });

        await page.mouse.up();

        await expect(page.getByText('Field (id: 1) - Pizza')).toHaveCount(1);
        expect(await listOrder(page)).toEqual([
            'ring-sortablelist-item-2',
            'ring-sortablelist-item-3',
            'ring-sortablelist-item-1',
        ]);
        // The drop-slot placeholder hides the item with `visibility: hidden`; if it outlived the
        // drop animation this would still be invisible.
        await expect(page.getByText('Field (id: 1) - Pizza')).toBeVisible();
    });

    test('A second drag started right after a drop does not strand the first ghost', async ({ page }) => {
        await gotoStory(page, 'components-organisms-sortablelist--default', '[data-testid="ring-sortablelist-item-1"]');

        const first = await centre(page.getByTestId('ring-sortablelist-item-1'));
        const second = await centre(page.getByTestId('ring-sortablelist-item-2'));

        await dragPointer(page, first, { x: first.x, y: second.y }, { steps: 8 });

        // Re-grab while the first ghost is still flying to its slot (the animation runs 180ms).
        // dnd-kit's `AnimationManager` renders a pending clone ALONGSIDE a new overlay, so an
        // unfinished drop animation is exactly how two ghosts end up on screen at once.
        const third = await centre(page.getByTestId('ring-sortablelist-item-3'));

        await page.mouse.move(third.x, third.y);
        await page.mouse.down();
        await page.mouse.move(third.x, third.y - LIST_ACTIVATION_DISTANCE_PX - 4);

        // Exactly one ghost on screen: the new one. The first drag's item must appear once only.
        await expect(page.getByText('Field (id: 1) - Pizza')).toHaveCount(1);
        await expect(page.getByText('Field (id: 3) - Pasta')).toHaveCount(2);

        await page.mouse.up();

        await expect(page.getByText('Field (id: 3) - Pasta')).toHaveCount(1);
        await expect(listItems(page)).toHaveCount(3);
    });

    test('Horizontal orientation reorders along the row', async ({ page }) => {
        await gotoStory(
            page,
            'components-organisms-sortablelist--horizontal',
            '[data-testid="ring-sortablelist-item-1"]',
        );

        const from = await centre(page.getByTestId('ring-sortablelist-item-3'));
        const to = await centre(page.getByTestId('ring-sortablelist-item-1'));

        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await page.mouse.move(from.x - LIST_ACTIVATION_DISTANCE_PX - 4, from.y);

        await expect(page.getByText('Field (id: 3) - Pasta')).toHaveCount(2);

        await travel(page, from, { x: to.x, y: from.y });

        await page.mouse.up();

        await expect(page.getByText('Field (id: 3) - Pasta')).toHaveCount(1);
        expect(await listOrder(page)).toEqual([
            'ring-sortablelist-item-3',
            'ring-sortablelist-item-1',
            'ring-sortablelist-item-2',
        ]);
    });
});

// ─────────────────────────────────────────────────────────────────
// SortableList — an open action menu must not be draggable
// ─────────────────────────────────────────────────────────────────

test.describe('SortableList - open action menu', () => {
    test('Dragging inside an item action menu does not pick the item up', async ({ page }) => {
        await gotoStory(page, 'components-organisms-sortablelist--default', '[data-testid="ring-sortablelist-item-1"]');

        const item = page.getByTestId('ring-sortablelist-item-1');

        // The trailing icon button in the first card opens its `ActionBox`.
        await item.locator('button').last().click();

        const menuItem = page.getByRole('menuitem').first();

        await expect(menuItem).toBeVisible();

        // The menu is a portal: it renders outside the sortable container even though it floats
        // geometrically over the item. That is the whole point of `SortablePointerSensor`'s
        // `boundaryRef` (`SortablePointerSensor` in src/components/internal/SortableChips.tsx) —
        // without it a press
        // inside the menu is a press inside the item's rect and the list picks the card up.
        expect(
            await page.evaluate(() => {
                const menu = document.querySelector('[role="menuitem"]');
                const container = document.querySelector('[data-testid="ring-sortablelist"]');

                return container !== null && menu !== null && container.contains(menu);
            }),
        ).toBe(false);

        const from = await centre(menuItem);

        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await travel(page, from, { x: from.x, y: from.y + 60 }, { steps: 10 });

        // No ghost, no grab cursor, no live reorder.
        await expect(page.getByText('Field (id: 1) - Pizza')).toHaveCount(1);
        await expect(item).toHaveJSProperty('style.cursor', 'grab');
        expect(await listOrder(page)).toEqual([
            'ring-sortablelist-item-1',
            'ring-sortablelist-item-2',
            'ring-sortablelist-item-3',
        ]);

        await page.mouse.up();

        expect(await listOrder(page)).toEqual([
            'ring-sortablelist-item-1',
            'ring-sortablelist-item-2',
            'ring-sortablelist-item-3',
        ]);
    });
});

// ─────────────────────────────────────────────────────────────────
// SortableList — what the drag live region actually says
// ─────────────────────────────────────────────────────────────────

/**
 * Record every text the dnd-kit live region is given, in order. The region is the only output a
 * screen-reader user gets from a drag, and every value it takes is spoken — so the assertion has to
 * be on the sequence, not on the final value. Must be installed before the drag starts: dnd-kit
 * mounts the region lazily, hence the fallback observer on `body`.
 */
async function recordAnnouncements(page: Page): Promise<() => Promise<string[]>> {
    await page.evaluate(() => {
        const spoken: string[] = [];

        (window as unknown as { __spoken: string[] }).__spoken = spoken;

        const observe = (region: Element): void => {
            new MutationObserver(() => spoken.push((region.textContent ?? '').trim())).observe(region, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        };

        const attach = (): boolean => {
            const region = document.querySelector('[id^="DndLiveRegion"]');

            if (region === null) {
                return false;
            }

            observe(region);

            return true;
        };

        if (!attach()) {
            const pending = new MutationObserver(() => {
                if (attach()) {
                    pending.disconnect();
                }
            });

            pending.observe(document.body, { childList: true, subtree: true });
        }
    });

    return () => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken);
}

/** Press, travel down onto the third item, leaving the pointer there with the drag still live. */
async function grabFirstItemAndMoveToLast(page: Page): Promise<Point> {
    const from = await centre(page.getByTestId('ring-sortablelist-item-1'));
    const to = await centre(page.getByTestId('ring-sortablelist-item-3'));

    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    // Past the activation distance first, in one nudge: the drag has to be live before the travel
    // below, or its first steps are swallowed as activation.
    await page.mouse.move(from.x, from.y + LIST_ACTIVATION_DISTANCE_PX + 4);
    await page.waitForTimeout(120);
    await travel(page, from, { x: from.x, y: to.y });

    return to;
}

test.describe('SortableList - drag announcements', () => {
    test('Announces the grab, then only the positions the item actually moves through', async ({ page }) => {
        // dnd-kit resolves a collision immediately on pick-up, so its `onDragOver` announcement can
        // replace "Grabbed …" in the same interaction, and the working copy the position is read from
        // has not rendered yet when dnd-kit dispatches the monitor event (inside the same
        // `unstable_batchedUpdates` block as the drag callback) — so it could name the position the
        // item is LEAVING. "Grabbed …" must reach the live region, followed only by real moves.
        await gotoStory(page, 'components-organisms-sortablelist--default', '[data-testid="ring-sortablelist-item-1"]');

        const spoken = await recordAnnouncements(page);

        await grabFirstItemAndMoveToLast(page);
        await page.mouse.up();
        await expect(listItems(page).first()).toHaveAttribute('data-testid', 'ring-sortablelist-item-2');

        expect(await spoken()).toEqual([
            'Grabbed position 1 of 3.',
            'Moved to position 2 of 3.',
            'Moved to position 3 of 3.',
            'Dropped at position 3 of 3.',
        ]);
    });

    test('Says an aborted drag put the item back when the pointer is released outside', async ({ page }) => {
        // This path restores the order, so it must not announce "Dropped at position 3 of 3." — a
        // reorder that has just been rolled back.
        await gotoStory(page, 'components-organisms-sortablelist--default', '[data-testid="ring-sortablelist-item-1"]');

        const spoken = await recordAnnouncements(page);
        const to = await grabFirstItemAndMoveToLast(page);

        // Well past `DROP_OUTSIDE_MARGIN` (32px, see `isPointerOutsideContainer`).
        await travel(page, to, { x: to.x + 720, y: to.y + 480 }, { steps: 8 });

        await page.mouse.up();

        // Polled rather than slept on: the rollback lands when the drop animation ends, and a fixed
        // margin is both slower than the real thing and a flake waiting for a slow CI machine.
        await expect
            .poll(() => listOrder(page))
            .toEqual(['ring-sortablelist-item-1', 'ring-sortablelist-item-2', 'ring-sortablelist-item-3']);
        expect((await spoken()).at(-1)).toBe('Reorder cancelled. Back at position 1 of 3.');
    });

    test('Says an aborted drag put the item back when the drag is cancelled with Escape', async ({ page }) => {
        // The cancel announcement names the restored position in a sentence of its own, not
        // "Reorder cancelled. position 3 of 3.".
        await gotoStory(page, 'components-organisms-sortablelist--default', '[data-testid="ring-sortablelist-item-1"]');

        const spoken = await recordAnnouncements(page);

        await grabFirstItemAndMoveToLast(page);
        await page.keyboard.press('Escape');
        await page.mouse.up();

        await expect
            .poll(() => listOrder(page))
            .toEqual(['ring-sortablelist-item-1', 'ring-sortablelist-item-2', 'ring-sortablelist-item-3']);
        expect((await spoken()).at(-1)).toBe('Reorder cancelled. Back at position 1 of 3.');
    });
});
