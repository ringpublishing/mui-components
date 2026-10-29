import React from 'react';
import { Paper, PaperProps } from '@mui/material';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Autocomplete } from '../../../src/index.js';
import { ThemeConfig } from '../../../src/theme/internalTheme.js';

type ThemeVersion = 'next' | 'reference';

const options = [
    { id: 1, label: 'Onet' },
    { id: 2, label: 'Fakt' },
];
const labels = { title: 'Publications', searchPlaceholder: 'Search publications' };
const getOptionLabel = (option: unknown): string => (option as { label: string }).label;

function openPaper(version: ThemeVersion, props: Record<string, unknown>): HTMLElement {
    const { getByRole } = render(
        <ThemeConfig mode="light" version={version}>
            <Autocomplete labels={labels} options={options} getOptionLabel={getOptionLabel} {...props} />
        </ThemeConfig>,
    );

    fireEvent.mouseDown(getByRole('combobox', { name: 'Publications' }));

    return getByRole('listbox').closest('.MuiPaper-root') as HTMLElement;
}

const elevationOf = (paper: HTMLElement): string | undefined =>
    Array.from(paper.classList).find((className) => /^MuiPaper-elevation\d+$/.test(className));

describe.each<ThemeVersion>(['next', 'reference'])("Autocomplete list paper props with version '%s'", (version) => {
    it.each(['default', 'filter'])('hands componentsProps.paper to the %s list paper', (variant) => {
        const onMouseDown = vi.fn();
        const paper = openPaper(version, {
            variant,
            componentsProps: {
                paper: {
                    className: 'consumer-paper',
                    id: 'consumer-paper',
                    'data-consumer': 'yes',
                    sx: { minWidth: '417px' },
                    style: { maxHeight: '123px' },
                    onMouseDown,
                } as PaperProps,
            },
        });

        fireEvent.mouseDown(paper);

        expect(paper.classList).toContain('consumer-paper');
        expect(paper.id).toBe('consumer-paper');
        expect(paper.getAttribute('data-consumer')).toBe('yes');
        expect(getComputedStyle(paper).minWidth).toBe('417px');
        expect(paper.style.maxHeight).toBe('123px');
        expect(onMouseDown).toHaveBeenCalledTimes(1);
    });

    it('lets slotProps.paper win over componentsProps.paper key by key', () => {
        const componentsMouseDown = vi.fn();
        const slotMouseDown = vi.fn();
        const paper = openPaper(version, {
            componentsProps: {
                paper: {
                    className: 'from-components',
                    id: 'from-components',
                    'data-source': 'components',
                    'data-components-only': 'yes',
                    sx: { minWidth: '300px', textIndent: '7px' },
                    style: { maxHeight: '100px', minHeight: '10px' },
                    elevation: 2,
                    onMouseDown: componentsMouseDown,
                } as PaperProps,
            },
            slotProps: {
                paper: {
                    className: 'from-slot',
                    id: 'from-slot',
                    'data-source': 'slot',
                    sx: { minWidth: '417px' },
                    style: { maxHeight: '200px' },
                    elevation: 3,
                    onMouseDown: slotMouseDown,
                } as PaperProps,
            },
        });

        fireEvent.mouseDown(paper);

        expect(paper.classList).toContain('from-components');
        expect(paper.classList).toContain('from-slot');
        expect(paper.id).toBe('from-slot');
        expect(paper.getAttribute('data-source')).toBe('slot');
        expect(paper.getAttribute('data-components-only')).toBe('yes');
        expect(getComputedStyle(paper).minWidth).toBe('417px');
        expect(getComputedStyle(paper).textIndent).toBe('7px');
        expect(paper.style.maxHeight).toBe('200px');
        expect(paper.style.minHeight).toBe('10px');
        expect(elevationOf(paper)).toBe('MuiPaper-elevation3');
        expect(slotMouseDown).toHaveBeenCalledTimes(1);
        expect(componentsMouseDown).not.toHaveBeenCalled();
    });

    it.each([
        { source: 'componentsProps.paper', props: { componentsProps: { paper: { elevation: 2 } } } },
        { source: 'slotProps.paper', props: { slotProps: { paper: { elevation: 2 } } } },
    ])('takes the elevation from $source', ({ props }) => {
        expect(elevationOf(openPaper(version, props))).toBe('MuiPaper-elevation2');
    });

    it.each(['default', 'filter'])('hands componentsProps.paper to a custom paper slot (%s)', (variant) => {
        const CustomPaper = React.forwardRef<HTMLDivElement, PaperProps>((props, ref) => (
            <Paper {...props} ref={ref} data-custom="yes" />
        ));
        CustomPaper.displayName = 'CustomPaper';

        const paper = openPaper(version, {
            variant,
            slots: { paper: CustomPaper },
            componentsProps: { paper: { className: 'consumer-paper' } },
        });

        expect(paper.getAttribute('data-custom')).toBe('yes');
        expect(paper.classList).toContain('consumer-paper');
    });
});

describe('Autocomplete list paper elevation', () => {
    it.each([
        { source: 'no paper props', props: {} },
        { source: 'componentsProps.paper', props: { componentsProps: { paper: { className: 'consumer-paper' } } } },
        { source: 'slotProps.paper', props: { slotProps: { paper: { className: 'consumer-paper' } } } },
    ])("opens on elevation 8 with version 'next' and $source", ({ props }) => {
        expect(elevationOf(openPaper('next', props))).toBe('MuiPaper-elevation8');
    });

    it("keeps the Paper default elevation with version 'reference'", () => {
        const paper = openPaper('reference', { componentsProps: { paper: { className: 'consumer-paper' } } });

        expect(elevationOf(paper)).toBe('MuiPaper-elevation1');
    });

    it("applies a slotProps.paper function with version 'reference'", () => {
        const paper = openPaper('reference', {
            componentsProps: { paper: { className: 'from-components' } },
            slotProps: { paper: () => ({ className: 'from-function', elevation: 4 }) },
        });

        expect(paper.classList).toContain('from-function');
        expect(paper.classList).not.toContain('from-components');
        expect(elevationOf(paper)).toBe('MuiPaper-elevation4');
    });
});
