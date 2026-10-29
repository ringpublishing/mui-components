import { describe, expect, it } from 'vitest';
import { Accordion as MuiAccordion, AccordionSummary, Alert as MuiAlert } from '@mui/material';
import { RichTreeView, SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import React from 'react';
import {
    Accordion,
    Alert,
    ChipsGroup,
    DatePicker,
    DateTimePicker,
    RingIconDefaults,
    TimePicker,
} from '../../src/index.js';
import { render } from '../test-utils/customRenderer.js';

// The library takes these icons from the theme's `next` defaults instead of passing its own;
// these specs pin what an application sees under the library's `ThemeConfig`.

const glyph = (svg: Element | null): string | undefined =>
    /lucide-([a-z-]+)/.exec(svg?.getAttribute('class') ?? '')?.[1];

const Own = (): React.JSX.Element => <svg data-testid="own" />;

const red = { sx: { color: 'rgb(255, 0, 0)' } };

const redIcons = {
    openPickerIcon: red,
    clearIcon: red,
    switchViewIcon: red,
    leftArrowIcon: red,
    rightArrowIcon: red,
};

const expectRed = (svg: Element): void => {
    expect(svg.getAttributeNames().map((name) => name.toLowerCase())).not.toContain('sx');
    expect(getComputedStyle(svg).color).toBe('rgb(255, 0, 0)');
};

describe('date and time pickers', () => {
    it.each([
        {
            name: 'DatePicker',
            openGlyph: 'calendar-days',
            openLabel: 'Choose date',
            element: <DatePicker defaultValue={dayjs('2026-10-15')} />,
        },
        {
            name: 'DateTimePicker',
            openGlyph: 'calendar-days',
            openLabel: 'Choose date',
            element: <DateTimePicker defaultValue={dayjs('2026-10-15T10:30')} />,
        },
        {
            name: 'TimePicker',
            openGlyph: 'clock',
            openLabel: 'Choose time',
            element: <TimePicker defaultValue={dayjs('2026-10-15T10:30')} />,
        },
    ])('$name opens with lucide $openGlyph and clears with lucide x', ({ openGlyph, openLabel, element }) => {
        const { container, getByLabelText } = render(element);
        const openButton = getByLabelText(openLabel, { exact: false });
        const open = openButton.querySelector('svg');
        // The field's other icon button; MUI X gives it no accessible name of its own.
        const clear =
            Array.from(container.querySelectorAll('.MuiIconButton-root'))
                .find((button) => button !== openButton)
                ?.querySelector('svg') ?? null;

        expect(glyph(open)).toBe(openGlyph);
        expect(glyph(clear)).toBe('x');

        for (const svg of [open, clear]) {
            expect(svg?.getAttributeNames().map((name) => name.toLowerCase())).not.toContain('ownerstate');
            expect(svg?.getAttribute('stroke-width')).toBe('1.5');
        }

        // MUI X sizes the clear glyph with `fontSize="small"`, the 20px of every field glyph.
        expect(clear?.getAttribute('font-size')).toBe('small');
    });

    it('clears with lucide x in the actions adornment too', () => {
        const { container } = render(
            <DatePicker
                defaultValue={dayjs('2026-10-15')}
                actions={[{ label: 'Copy', onClick: (): void => undefined }]}
            />,
        );

        expect(glyph(container.querySelector('[data-testid$="-clear"] svg'))).toBe('x');
        expect(container.querySelector('[data-testid$="Icon"]')).toBeNull();
    });

    // MUI X types these slots as `SvgIcon` props, so an application styles the icon through `slotProps`.
    it.each([
        { name: 'DatePicker', element: <DatePicker defaultValue={dayjs('2026-10-15')} slotProps={redIcons} /> },
        {
            name: 'DateTimePicker',
            element: <DateTimePicker defaultValue={dayjs('2026-10-15T10:30')} slotProps={redIcons} />,
        },
        { name: 'TimePicker', element: <TimePicker defaultValue={dayjs('2026-10-15T10:30')} slotProps={redIcons} /> },
    ])('$name applies the sx slotProps hand its open and clear icons', ({ element }) => {
        const { container } = render(element);
        const icons = Array.from(container.querySelectorAll('.MuiIconButton-root svg'));

        expect(icons).toHaveLength(2);
        icons.forEach(expectRed);
    });

    it('applies the sx slotProps hand the calendar header and month arrows', () => {
        const { getByLabelText } = render(<DatePicker slotProps={redIcons} />);

        fireEvent.click(getByLabelText('Choose date', { exact: false }));

        const icons = Array.from(
            document.querySelectorAll('.MuiPickersCalendarHeader-switchViewIcon, .MuiPickersArrowSwitcher-root svg'),
        );

        expect(icons).toHaveLength(3);
        icons.forEach(expectRed);
    });

    it('keeps the open icon a consumer passes in slots', () => {
        const { getByLabelText } = render(<DatePicker slots={{ openPickerIcon: Own }} />);

        expect(getByLabelText('Choose date', { exact: false }).querySelector('[data-testid="own"]')).not.toBeNull();
    });

    it('draws the calendar header and month arrows with lucide chevrons', () => {
        const { getByLabelText } = render(<DatePicker />);

        fireEvent.click(getByLabelText('Choose date', { exact: false }));

        const dialog = document.querySelector('.MuiPickerPopper-root') as Element;

        expect(glyph(dialog.querySelector('.MuiPickersCalendarHeader-switchViewIcon'))).toBe('chevron-down');
        expect(glyph(dialog.querySelector('.MuiPickersArrowSwitcher-leftArrowIcon'))).toBe('chevron-left');
        expect(glyph(dialog.querySelector('.MuiPickersArrowSwitcher-rightArrowIcon'))).toBe('chevron-right');
        expect(dialog.querySelector('[data-testid$="Icon"]')).toBeNull();
    });
});

describe('Alert', () => {
    it.each([
        ['error', 'circle-alert'],
        ['info', 'info'],
        ['success', 'circle-check'],
        ['warning', 'triangle-alert'],
    ] as const)('marks %s with lucide %s at 20px', (severity, expected) => {
        const { container } = render(<Alert severity={severity} title="Saved" />);
        const svg = container.querySelector('.MuiAlert-icon svg');

        expect(glyph(svg)).toBe(expected);
        expect(svg?.getAttribute('width')).toBe('20');
    });

    it('keeps its own close button', () => {
        const { getByLabelText } = render(<Alert title="Saved" onClose={(): void => undefined} />);

        expect(glyph(getByLabelText('Close').querySelector('svg'))).toBe('x');
    });

    it('keeps the icon a consumer passes', () => {
        const { container } = render(<Alert severity="error" title="Saved" icon={<Own />} />);

        expect(container.querySelector('.MuiAlert-icon [data-testid="own"]')).not.toBeNull();
    });

    it('gives a bare MUI Alert the same icons', () => {
        const { container } = render(<MuiAlert severity="error">Failed</MuiAlert>);

        expect(glyph(container.querySelector('.MuiAlert-icon svg'))).toBe('circle-alert');
    });
});

describe('Accordion', () => {
    it('expands with the theme chevron in a 20px wrapper', () => {
        const { container } = render(<Accordion label="Details">Body</Accordion>);
        const wrapper = container.querySelector('.MuiAccordionSummary-expandIconWrapper') as HTMLElement;

        expect(glyph(wrapper.querySelector('svg'))).toBe('chevron-down');
        expect(wrapper.querySelector('svg')?.getAttribute('width')).toBe('1em');
        expect(getComputedStyle(wrapper).fontSize).toBe('1.25rem');
    });

    it('gives a bare MUI AccordionSummary the same chevron', () => {
        const { container } = render(
            <MuiAccordion>
                <AccordionSummary>Details</AccordionSummary>
            </MuiAccordion>,
        );

        expect(glyph(container.querySelector('.MuiAccordionSummary-expandIconWrapper svg'))).toBe('chevron-down');
    });
});

const treeIcons = (container: HTMLElement): (string | null | undefined)[] =>
    Array.from(container.querySelectorAll('.MuiTreeItem-iconContainer > *')).map(
        (el) => el.getAttribute('data-testid') ?? glyph(el),
    );

describe('bare MUI X tree views', () => {
    const items = (
        <>
            <TreeItem itemId="a" label="A">
                <TreeItem itemId="a1" label="A1" />
            </TreeItem>
            <TreeItem itemId="b" label="B">
                <TreeItem itemId="b1" label="B1" />
            </TreeItem>
        </>
    );

    it('SimpleTreeView expands with lucide chevron-right and collapses with chevron-down', () => {
        const { container } = render(<SimpleTreeView defaultExpandedItems={['b']}>{items}</SimpleTreeView>);

        expect(treeIcons(container)).toEqual(['chevron-right', 'chevron-down']);
        // The item's icon container is narrower than the 1em chevron, which must not shrink into it.
        expect(
            Array.from(container.querySelectorAll<SVGElement>('.MuiTreeItem-iconContainer svg')).map(
                (svg) => svg.style.flexShrink,
            ),
        ).toEqual(['0', '0']);
    });

    it('RichTreeView does the same', () => {
        const { container } = render(
            <RichTreeView
                defaultExpandedItems={['b']}
                items={[
                    { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
                    { id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
                ]}
            />,
        );

        expect(treeIcons(container)).toEqual(['chevron-right', 'chevron-down']);
    });

    it('keeps an icon a consumer passes to the tree view', () => {
        const { container } = render(<SimpleTreeView slots={{ expandIcon: Own }}>{items}</SimpleTreeView>);

        expect(treeIcons(container)).toEqual(['own', 'own']);
    });

    it('keeps an icon a consumer passes to an item', () => {
        const { container } = render(
            <SimpleTreeView>
                <TreeItem itemId="a" label="A" slots={{ expandIcon: Own }}>
                    <TreeItem itemId="a1" label="A1" />
                </TreeItem>
                <TreeItem itemId="b" label="B">
                    <TreeItem itemId="b1" label="B1" />
                </TreeItem>
            </SimpleTreeView>,
        );

        expect(treeIcons(container)).toEqual(['own', 'chevron-right']);
    });
});

describe('a RingIconDefaults override', () => {
    // `fontSize` wins over `size`, so the icons MUI X hands a `fontSize` keep the size of that variant.
    it('resizes the icons the theme supplies, except those MUI X sizes with fontSize', () => {
        const { container, getByLabelText } = render(
            <RingIconDefaults size={24}>
                <DatePicker defaultValue={dayjs('2026-10-15')} />
                <Alert severity="error" title="Saved" />
            </RingIconDefaults>,
        );
        const openButton = getByLabelText('Choose date', { exact: false });
        const clear = Array.from(container.querySelectorAll('.MuiIconButton-root'))
            .find((button) => button !== openButton)
            ?.querySelector('svg') as Element;

        fireEvent.click(openButton);

        const dialog = document.querySelector('.MuiPickerPopper-root') as Element;
        const following = [
            openButton.querySelector('svg'),
            dialog.querySelector('.MuiPickersCalendarHeader-switchViewIcon'),
            container.querySelector('.MuiAlert-icon svg'),
        ];

        for (const svg of following) {
            expect(svg?.getAttribute('width')).toBe('24');
            expect(svg?.hasAttribute('font-size')).toBe(false);
        }

        expect(clear.getAttribute('font-size')).toBe('small');
        expect(getComputedStyle(clear).width).toBe('20px');

        const arrows = Array.from(dialog.querySelectorAll('.MuiPickersArrowSwitcher-root svg'));

        expect(arrows).toHaveLength(2);

        for (const arrow of arrows) {
            expect(arrow.getAttribute('font-size')).toBe('inherit');
            expect(getComputedStyle(arrow).width).toBe('1em');
        }
    });
});

describe('ChipsGroup', () => {
    it('deletes with the theme x, or with the deleteIcon a chip passes', () => {
        const onDelete = (): void => undefined;
        const { container } = render(
            <ChipsGroup
                chips={[
                    { label: 'PAP', onDelete },
                    { label: 'Reuters', onDelete, deleteIcon: <Own /> },
                ]}
            />,
        );
        // `Own` ignores the class MUI hands a delete icon, so it is found by its test id.
        expect(glyph(container.querySelector('.MuiChip-deleteIcon'))).toBe('x');
        expect(container.querySelector('[data-testid="own"]')).not.toBeNull();
    });
});
