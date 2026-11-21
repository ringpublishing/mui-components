import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';
import { Settings2, SlidersHorizontal } from 'lucide-react';
import { Autocomplete, AutocompleteMenuListAction, DefaultAutocompleteProps } from '../../../src/index.js';

interface Option {
    label: string;
    id: number;
    section?: string;
}

type Props = Partial<DefaultAutocompleteProps<Option>>;

describe('Autocomplete - menu list actions', () => {
    const options: Option[] = [
        { label: 'Onet', id: 1, section: 'News' },
        { label: 'Fakt', id: 2, section: 'News' },
        { label: 'Przegląd Sportowy', id: 3, section: 'Sport' },
    ];

    const setup = (
        actions: Partial<AutocompleteMenuListAction>[],
        props: Props = {},
    ): ReturnType<typeof render> & { groups: () => HTMLElement[] } => {
        const utils = render(
            <Autocomplete<Option>
                options={options}
                labels={{ title: 'Publication' }}
                open={true}
                menuListActions={{
                    label: 'All publications',
                    actions: actions.map((action, index) => ({
                        icon: index === 0 ? <Settings2 /> : <SlidersHorizontal />,
                        label: index === 0 ? 'Configure' : 'Filters',
                        ...action,
                    })),
                }}
                {...props}
            />,
        );

        return {
            ...utils,
            groups: (): HTMLElement[] => Array.from(utils.getByRole('listbox').children) as HTMLElement[],
        };
    };

    const RECENTLY_USED_KEY = 'menuListActionsRecentlyUsed';

    afterEach(() => {
        localStorage.removeItem(RECENTLY_USED_KEY);
    });

    describe('placement', () => {
        it('puts the actions next to the first group only, and leaves the group names to groupBy', () => {
            const { groups, queryByText } = setup([{}, {}], {
                groupBy: (option): string => option.section ?? '',
            });
            const [first, second] = groups();

            expect(groups()).toHaveLength(2);
            expect(within(first).getByText('News')).toBeDefined();
            expect(within(second).getByText('Sport')).toBeDefined();
            expect(
                within(first)
                    .getAllByRole('button')
                    .map((button) => button.getAttribute('aria-label')),
            ).toEqual(['Configure', 'Filters']);
            expect(within(second).queryAllByRole('button')).toEqual([]);
            expect(queryByText('All publications')).toBeNull();
        });

        it('puts the actions next to the first recently used group, without the label', () => {
            localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify([{ label: 'Fakt', id: 2, section: 'News' }]));

            const { groups, queryByText } = setup([{}], {
                labels: { title: 'Publication', recentlyUsed: 'Recently used', recentlyUsedResults: 'Results' },
                showRecentlyUsed: true,
                recentlyLocalStorageKey: RECENTLY_USED_KEY,
            });
            const [first, second] = groups();

            expect(groups()).toHaveLength(2);
            expect(within(first).getByText('Recently used')).toBeDefined();
            expect(within(second).getByText('Results')).toBeDefined();
            expect(within(first).getAllByRole('button')).toHaveLength(1);
            expect(within(second).queryAllByRole('button')).toEqual([]);
            expect(queryByText('All publications')).toBeNull();
        });

        it('gives every action a test id with its position', () => {
            const { getByTestId } = setup([{}, {}], { dataTestIdSuffix: 'publications' });

            expect(getByTestId('ring-autocomplete-publications-menu-list-action-0').getAttribute('aria-label')).toBe(
                'Configure',
            );
            expect(getByTestId('ring-autocomplete-publications-menu-list-action-1').getAttribute('aria-label')).toBe(
                'Filters',
            );
        });
    });

    describe('with a custom renderGroup', () => {
        it('adds no group of its own, so a renderGroup without groupBy is never asked to render', () => {
            const renderGroup = vi.fn((): React.ReactNode => null);
            const { getAllByRole, queryByRole, queryByText } = setup([{}], { renderGroup });

            expect(renderGroup).not.toHaveBeenCalled();
            expect(queryByRole('button', { name: 'Configure' })).toBeNull();
            expect(queryByText('All publications')).toBeNull();
            expect(getAllByRole('option').map((option) => option.textContent)).toEqual([
                'Onet',
                'Fakt',
                'Przegląd Sportowy',
            ]);
        });
    });

    describe('a single action', () => {
        it('is named by ariaLabel when it has one', () => {
            const { getByRole, queryByRole } = setup([{ ariaLabel: 'Configure the list of publications' }]);

            expect(getByRole('button', { name: 'Configure the list of publications' })).toBeDefined();
            expect(queryByRole('button', { name: 'Configure' })).toBeNull();
        });

        it('shows its label in the tooltip when it has no disabled reason', async () => {
            const { getByRole, findByRole } = setup([{}]);

            fireEvent.mouseOver(getByRole('button', { name: 'Configure' }));

            expect((await findByRole('tooltip')).textContent).toBe('Configure');
        });

        it('keeps the label in the tooltip when ariaLabel names the button', async () => {
            const { getByRole, findByRole } = setup([{ ariaLabel: 'Configure the list of publications' }]);

            fireEvent.mouseOver(getByRole('button', { name: 'Configure the list of publications' }));

            expect((await findByRole('tooltip')).textContent).toBe('Configure');
        });

        it('shows the disabled reason in the tooltip instead of the label', async () => {
            const { getByRole, findByRole } = setup([{ disabled: true, disabledReason: 'No access' }]);

            // A disabled button fires no mouse events; the tooltip listens on the wrapper around it.
            fireEvent.mouseOver(getByRole('button', { name: 'Configure' }).parentElement as HTMLElement);

            expect((await findByRole('tooltip')).textContent).toBe('No access');
        });

        it('cannot be used when disabled', () => {
            const onClick = vi.fn();
            const { getByRole } = setup([{ disabled: true, onClick }]);
            const button = getByRole('button', { name: 'Configure' }) as HTMLButtonElement;

            fireEvent.click(button);

            expect(button.disabled).toBe(true);
            expect(onClick).not.toHaveBeenCalled();
        });

        it('keeps its click and press to itself, and the press leaves focus where it was', () => {
            let clicked: EventTarget | null = null;
            const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>): void => {
                // React clears `currentTarget` once the handler returns.
                clicked = event.currentTarget;
            });
            const onAncestorClick = vi.fn();
            const onAncestorMouseDown = vi.fn();

            // React events from the portalled list still bubble to the ancestors of the Autocomplete.
            const { getByRole } = render(
                <div onClick={onAncestorClick} onMouseDown={onAncestorMouseDown}>
                    <Autocomplete<Option>
                        options={options}
                        labels={{ title: 'Publication' }}
                        open={true}
                        menuListActions={{ actions: [{ icon: <Settings2 />, label: 'Configure', onClick }] }}
                    />
                </div>,
            );
            const button = getByRole('button', { name: 'Configure' });

            // `false` means the default was prevented: the browser does not move focus to the button.
            expect(fireEvent.mouseDown(button)).toBe(false);

            fireEvent.click(button);

            expect(onClick).toHaveBeenCalledTimes(1);
            expect(clicked).toBe(button);
            expect(onAncestorClick).not.toHaveBeenCalled();
            expect(onAncestorMouseDown).not.toHaveBeenCalled();
        });
    });
});
