import React from 'react';
import { ThemeProvider } from '@mui/material';
import { Settings2 } from 'lucide-react';
import { fireEvent, render as testingLibraryRender, RenderResult, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Autocomplete } from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';
import { getCreatedTheme } from '../../../src/index.js';

function render(ui: React.ReactElement): RenderResult {
    return testingLibraryRender(<ThemeProvider theme={getCreatedTheme('light')}>{ui}</ThemeProvider>);
}

interface Entry {
    id: number;
    label: string;
    kind: string;
}

const labels = { title: 'Search by' };
const grouped: Entry[] = [
    { id: 1, label: 'Onet', kind: 'Publications' },
    { id: 2, label: 'Fakt', kind: 'Publications' },
    { id: 3, label: 'Anna', kind: 'People' },
];

const openList = (): void => {
    fireEvent.mouseDown(screen.getByRole('combobox'));
};

const readGroups = (): { heading: string; options: string[] }[] =>
    Array.from(screen.getByRole('listbox').children).map((group) => ({
        heading: group.querySelector('.MuiAutocomplete-groupLabel')?.textContent ?? '',
        options: within(group as HTMLElement)
            .getAllByRole('option')
            .map((option) => option.textContent ?? ''),
    }));

describe('Autocomplete option rendering', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render the caption under the label only for options that have one', () => {
        render(
            <Autocomplete
                labels={labels}
                options={[
                    { id: 1, label: 'Onet', caption: 'News portal' },
                    { id: 2, label: 'Fakt' },
                ]}
            />,
        );

        openList();

        const withCaption = screen.getByRole('option', { name: /Onet/ });
        const withoutCaption = screen.getByRole('option', { name: /Fakt/ });

        expect(within(withCaption).getByText('News portal').tagName).toBe('SPAN');
        expect(withCaption.textContent).toBe('OnetNews portal');
        expect(withoutCaption.textContent).toBe('Fakt');
        expect(withoutCaption.querySelector('span')).toBeNull();
    });

    it('should let slotProps.avatar sx override the default avatar size', () => {
        render(
            <Autocomplete
                labels={labels}
                options={[{ id: 1, label: 'Onet', avatar: 'https://example.com/onet.png' }]}
                slotProps={{ avatar: { sx: { width: 40 } } }}
            />,
        );

        openList();

        const avatar = screen.getByRole('option').querySelector('.MuiAvatar-root') as Element;

        expect(getComputedStyle(avatar).width).toBe('40px');
        expect(getComputedStyle(avatar).height).toBe('24px');
    });

    it('should accept slotProps.avatar sx given as a list', () => {
        render(
            <Autocomplete
                labels={labels}
                options={[{ id: 1, label: 'Onet', avatar: 'https://example.com/onet.png' }]}
                slotProps={{ avatar: { sx: [{ width: 40 }, { height: 32 }] } }}
            />,
        );

        openList();

        const avatar = screen.getByRole('option').querySelector('.MuiAvatar-root') as Element;

        expect(getComputedStyle(avatar).width).toBe('40px');
        expect(getComputedStyle(avatar).height).toBe('32px');
    });

    it('should render a node avatar as given, untouched by slotProps.avatar', () => {
        render(
            <Autocomplete
                labels={labels}
                options={[{ id: 1, label: 'Onet', avatar: <b data-testid="custom-avatar">O</b> }]}
                slotProps={{ avatar: { className: 'from-slot-props' } }}
            />,
        );

        openList();

        const option = screen.getByRole('option');

        expect(within(option).getByTestId('custom-avatar').textContent).toBe('O');
        expect(option.querySelector('.from-slot-props')).toBeNull();
        expect(option.querySelector('.MuiAvatar-root')).toBeNull();
    });

    it('should render no avatar container for an option without an avatar', () => {
        render(
            <Autocomplete
                labels={labels}
                options={[
                    { id: 1, label: 'Onet', avatar: 'https://example.com/onet.png' },
                    { id: 2, label: 'Fakt' },
                ]}
            />,
        );

        openList();

        expect(screen.getByRole('option', { name: 'Onet' }).querySelector('.MuiListItemAvatar-root')).not.toBeNull();
        expect(screen.getByRole('option', { name: 'Fakt' }).querySelector('.MuiListItemAvatar-root')).toBeNull();
    });

    it('should list options that share a label but differ by id without a duplicate key warning', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation((): void => undefined);

        render(
            <Autocomplete
                labels={labels}
                options={[
                    { id: 1, label: 'Onet', caption: 'Poland' },
                    { id: 2, label: 'Onet', caption: 'Archive' },
                ]}
            />,
        );

        openList();

        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
            'OnetPoland',
            'OnetArchive',
        ]);
        expect(consoleError).not.toHaveBeenCalled();
    });

    it('should replace the default option content with renderOption', () => {
        render(
            <Autocomplete
                labels={labels}
                options={[{ id: 1, label: 'Onet', caption: 'News portal' }]}
                renderOption={(props, option): React.ReactNode => {
                    const { key, ...optionProps } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };

                    return (
                        <li {...optionProps} key={key}>
                            Custom {(option as { label: string }).label}
                        </li>
                    );
                }}
            />,
        );

        openList();

        expect(screen.getByRole('option').textContent).toBe('Custom Onet');
    });

    it('should group options under the headings returned by groupBy', () => {
        render(<Autocomplete<Entry> labels={labels} options={grouped} groupBy={(option): string => option.kind} />);

        openList();

        expect(readGroups()).toEqual([
            { heading: 'Publications', options: ['Onet', 'Fakt'] },
            { heading: 'People', options: ['Anna'] },
        ]);
    });

    it('should draw the menu list actions next to the first group heading only', () => {
        render(
            <Autocomplete<Entry>
                labels={labels}
                options={grouped}
                groupBy={(option): string => option.kind}
                menuListActions={{ actions: [{ icon: <Settings2 />, label: 'Configure', onClick: vi.fn() }] }}
            />,
        );

        openList();

        const [firstGroup, secondGroup] = Array.from(screen.getByRole('listbox').children) as HTMLElement[];

        expect(readGroups().map((group) => group.heading)).toEqual(['Publications', 'People']);
        expect(within(firstGroup).queryAllByRole('button', { name: 'Configure' })).toHaveLength(1);
        expect(within(secondGroup).queryAllByRole('button', { name: 'Configure' })).toHaveLength(0);
    });

    it('should show an empty loading row by default while loading without options', () => {
        render(<Autocomplete labels={labels} options={[]} loading={true} />);

        openList();

        const loadingRow = document.querySelector('.MuiAutocomplete-loading');

        expect(loadingRow).not.toBeNull();
        expect(loadingRow?.textContent).toBe('');
        expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('should open an empty list when options are not given', () => {
        // `options` is required by the types, but a JavaScript consumer can still leave it out.
        const propsWithoutOptions = { labels } as React.ComponentProps<typeof Autocomplete>;

        render(<Autocomplete {...propsWithoutOptions} />);

        openList();

        expect(screen.queryAllByRole('option')).toHaveLength(0);
        expect(screen.queryAllByText('No options')).toHaveLength(1);
    });
});
