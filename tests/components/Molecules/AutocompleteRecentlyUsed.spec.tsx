import React from 'react';
import { ThemeProvider } from '@mui/material';
import {
    fireEvent,
    render as testingLibraryRender,
    RenderResult,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { Settings2 } from 'lucide-react';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Autocomplete } from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';
import { getCreatedTheme } from '../../../src/index.js';

function render(ui: React.ReactElement): RenderResult {
    return testingLibraryRender(<ThemeProvider theme={getCreatedTheme('light')}>{ui}</ThemeProvider>);
}

interface Publication {
    id: number;
    label: string;
}

interface RenderedGroup {
    heading: string;
    options: string[];
}

const onet: Publication = { id: 1, label: 'Onet' };
const fakt: Publication = { id: 2, label: 'Fakt' };
const tvn: Publication = { id: 3, label: 'TVN' };
const interia: Publication = { id: 4, label: 'Interia' };
const options = [onet, fakt, tvn, interia];
const labels = { title: 'Search by', recentlyUsed: 'Recently used', recentlyUsedResults: 'Results' };
const storageKey = 'autocomplete-recently-used-spec';

const store = (value: unknown): void => localStorage.setItem(storageKey, JSON.stringify(value));
const readStore = (): unknown => JSON.parse(localStorage.getItem(storageKey) ?? 'null');

const openList = (): void => {
    fireEvent.mouseDown(screen.getByRole('combobox'));
};

const closeList = (): void => {
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
};

const pick = (name: string): void => {
    fireEvent.click(screen.getByRole('option', { name }));
};

const readGroups = (): RenderedGroup[] =>
    Array.from(screen.getByRole('listbox').children).map((group) => ({
        heading: group.querySelector('.MuiAutocomplete-groupLabel')?.textContent ?? '',
        options: within(group as HTMLElement)
            .getAllByRole('option')
            .map((option) => option.textContent ?? ''),
    }));

const waitForAnimationFrame = (): Promise<void> =>
    new Promise((resolve) => {
        requestAnimationFrame(() => resolve());
    });

describe('Autocomplete recently used', () => {
    const scrollTo = vi.fn();

    // jsdom has no `Element.prototype.scrollTo`, which the list calls on the frame after it opens.
    beforeEach(() => {
        scrollTo.mockClear();
        Object.defineProperty(Element.prototype, 'scrollTo', { configurable: true, writable: true, value: scrollTo });
    });

    afterEach(() => {
        localStorage.removeItem(storageKey);
    });

    afterAll(() => {
        Reflect.deleteProperty(Element.prototype, 'scrollTo');
    });

    describe('reading the stored list', () => {
        it('should throw when recently used is on without a storage key', () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation((): void => undefined);

            try {
                expect(() =>
                    render(<Autocomplete options={options} labels={labels} showRecentlyUsed={true} />),
                ).toThrow('recentlyLocalStorageKey is required when showRecentlyUsed is true');
            } finally {
                consoleError.mockRestore();
            }
        });

        it('should list the stored options first, newest first, under the recently used heading', () => {
            store([tvn, onet]);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            expect(readGroups()).toEqual([
                { heading: 'Recently used', options: ['TVN', 'Onet'] },
                { heading: 'Results', options: ['Fakt', 'Interia'] },
            ]);
        });

        it.each([
            { description: 'is not JSON', stored: 'not json' },
            { description: 'is not a list', stored: '5' },
        ])('should list every option as a result when the stored entry $description', ({ stored }) => {
            localStorage.setItem(storageKey, stored);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            expect(readGroups()).toEqual([{ heading: 'Results', options: ['Onet', 'Fakt', 'TVN', 'Interia'] }]);
        });

        it('should skip stored entries that are not option objects', () => {
            store(['Onet', 5, true, null, fakt, tvn]);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            expect(readGroups()).toEqual([
                { heading: 'Recently used', options: ['Fakt', 'TVN'] },
                { heading: 'Results', options: ['Onet', 'Interia'] },
            ]);
        });

        it('should read stored entries nested one list deep', () => {
            store([[tvn], onet]);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            expect(readGroups()).toEqual([
                { heading: 'Recently used', options: ['TVN', 'Onet'] },
                { heading: 'Results', options: ['Fakt', 'Interia'] },
            ]);
        });

        it('should read no more stored options than recentlyUsedLimit', () => {
            store([interia, tvn, fakt, onet]);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                    recentlyUsedLimit={2}
                />,
            );

            openList();

            expect(readGroups()).toEqual([
                { heading: 'Recently used', options: ['Interia', 'TVN'] },
                { heading: 'Results', options: ['Onet', 'Fakt'] },
            ]);
        });

        it('should read three stored options when no limit is given', () => {
            store([interia, tvn, fakt, onet]);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            expect(readGroups()).toEqual([
                { heading: 'Recently used', options: ['Interia', 'TVN', 'Fakt'] },
                { heading: 'Results', options: ['Onet'] },
            ]);
        });

        it('should recognise a stored option whose avatar is a node and draw the current avatar', () => {
            store([fakt]);
            render(
                <Autocomplete
                    options={[
                        { ...onet, avatar: <b>O</b> },
                        { ...fakt, avatar: <b>F</b> },
                    ]}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            expect(readGroups()).toEqual([
                { heading: 'Recently used', options: ['FFakt'] },
                { heading: 'Results', options: ['OOnet'] },
            ]);
        });
    });

    describe('writing the stored list', () => {
        it('should leave the storage alone when recently used is off', () => {
            render(<Autocomplete options={options} labels={labels} recentlyLocalStorageKey={storageKey} />);

            openList();
            pick('Fakt');

            expect(localStorage.getItem(storageKey)).toBeNull();
        });

        it('should keep no more picked options than recentlyUsedLimit', () => {
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                    recentlyUsedLimit={2}
                />,
            );

            ['Onet', 'Fakt', 'TVN'].forEach((name) => {
                openList();
                pick(name);
            });

            expect(readStore()).toEqual([tvn, fakt]);
        });

        it('should not store an option that is removed by picking it again', () => {
            store([fakt, onet]);
            const onChange = vi.fn();

            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    multiple={true}
                    defaultValue={[onet]}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                    onChange={onChange}
                />,
            );

            openList();
            pick('Onet');

            expect(onChange.mock.calls[0][2]).toBe('removeOption');
            expect(readStore()).toEqual([fakt, onet]);
        });

        it('should not store an option that is selected by leaving the field', () => {
            const onChange = vi.fn();

            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    autoSelect={true}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                    onChange={onChange}
                />,
            );

            const input = screen.getByRole('combobox');

            openList();
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            fireEvent.blur(input);

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange.mock.calls[0][2]).toBe('blur');
            expect(localStorage.getItem(storageKey)).toBeNull();
        });

        it('should neither store nor regroup options that are plain strings', () => {
            render(
                <Autocomplete
                    options={['Onet', 'Fakt']}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            expect(readGroups()).toEqual([{ heading: '', options: ['Onet', 'Fakt'] }]);

            pick('Fakt');

            expect(localStorage.getItem(storageKey)).toBeNull();
        });
    });

    describe('ordering and grouping', () => {
        it('should keep the open list in place after a pick and reorder it once it has closed', () => {
            store([onet]);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    multiple={true}
                    disableCloseOnSelect={true}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();
            pick('TVN');

            expect(readStore()).toEqual([tvn, onet]);
            expect(readGroups()).toEqual([
                { heading: 'Recently used', options: ['Onet'] },
                { heading: 'Results', options: ['Fakt', 'TVN', 'Interia'] },
            ]);

            closeList();
            openList();

            expect(readGroups()).toEqual([
                { heading: 'Recently used', options: ['TVN', 'Onet'] },
                { heading: 'Results', options: ['Fakt', 'Interia'] },
            ]);
        });

        it('should scroll the list to the top when it opens with recently used options', async () => {
            store([tvn]);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();
            await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1));

            expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
            expect(scrollTo.mock.contexts[0]).toBe(screen.getByRole('listbox'));
        });

        it('should not scroll the list when it opens without recently used options', async () => {
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();
            await waitForAnimationFrame();

            screen.getByRole('listbox');
            expect(scrollTo).not.toHaveBeenCalled();
        });

        it('should group by recently used instead of the groupBy prop', () => {
            store([tvn]);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    groupBy={(): string => 'Everything'}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            expect(readGroups()).toEqual([
                { heading: 'Recently used', options: ['TVN'] },
                { heading: 'Results', options: ['Onet', 'Fakt', 'Interia'] },
            ]);
        });

        it.each([
            { name: 'TVN', expected: { ...tvn, groupBy: 'Recently used', sortBy: 2 } },
            { name: 'Onet', expected: { ...onet, groupBy: 'Recently used', sortBy: 1 } },
            { name: 'Fakt', expected: { ...fakt, groupBy: 'Results', sortBy: 0 } },
        ])('should report $name through onChange with its group and sort position', ({ name, expected }) => {
            store([tvn, onet]);
            const onChange = vi.fn();

            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                    onChange={onChange}
                />,
            );

            openList();
            pick(name);

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange.mock.calls[0][1]).toEqual(expected);
        });

        it('should keep recently used options first under an empty heading when the labels are missing', () => {
            store([tvn]);
            render(
                <Autocomplete
                    options={options}
                    labels={{ title: 'Search by' }}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            expect(readGroups()).toEqual([{ heading: '', options: ['TVN', 'Onet', 'Fakt', 'Interia'] }]);
        });

        it('should draw the menu list actions next to the recently used heading only', () => {
            store([tvn]);
            render(
                <Autocomplete
                    options={options}
                    labels={labels}
                    menuListActions={{
                        label: 'Publications',
                        actions: [{ icon: <Settings2 />, label: 'Configure', onClick: vi.fn() }],
                    }}
                    showRecentlyUsed={true}
                    recentlyLocalStorageKey={storageKey}
                />,
            );

            openList();

            const [recentlyUsedGroup, resultsGroup] = Array.from(screen.getByRole('listbox').children) as HTMLElement[];

            expect(readGroups().map((group) => group.heading)).toEqual(['Recently used', 'Results']);
            within(recentlyUsedGroup).getByRole('button', { name: 'Configure' });
            expect(within(resultsGroup).queryByRole('button', { name: 'Configure' })).toBeNull();
        });
    });
});
