import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Info, Search } from 'lucide-react';
import { Action, Autocomplete, DefaultAutocompleteProps } from '../../../src/index.js';

interface Option {
    label: string;
    id: number;
}

type Props = Partial<DefaultAutocompleteProps<Option>>;

describe('Autocomplete - actions in the field', () => {
    const options: Option[] = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
    ];

    const setup = (
        actions: Partial<Action>[] | undefined,
        props: Props = {},
    ): ReturnType<typeof render> & { input: HTMLInputElement; onAncestorClick: ReturnType<typeof vi.fn> } => {
        const onAncestorClick = vi.fn();
        const utils = render(
            <div onClick={onAncestorClick}>
                <Autocomplete<Option>
                    options={options}
                    labels={{ title: 'Publication' }}
                    actions={actions?.map((action, index) => ({
                        icon: index === 0 ? <Search /> : <Info />,
                        label: index === 0 ? 'Search settings' : 'About',
                        ...action,
                    }))}
                    {...props}
                />
            </div>,
        );

        return { ...utils, input: utils.getByRole('combobox') as HTMLInputElement, onAncestorClick };
    };

    describe('a single action', () => {
        it('runs its handler without opening the list or focusing the field', () => {
            const onClick = vi.fn();
            // With `openOnFocus` a click that reached the field would focus it and open the list.
            const { getByRole, queryByRole, queryByTestId, input } = setup([{ onClick }], { openOnFocus: true });

            expect(queryByTestId('ring-autocomplete-actions')).toBeNull();

            fireEvent.click(getByRole('button', { name: 'Search settings' }));

            expect(onClick).toHaveBeenCalledTimes(1);
            expect((onClick.mock.calls[0][0] as React.MouseEvent).defaultPrevented).toBe(true);
            expect(document.activeElement).not.toBe(input);
            expect(queryByRole('listbox')).toBeNull();
        });

        it('shows its label in the tooltip when it has no disabled reason', async () => {
            const { getByRole, findByRole } = setup([{}]);

            fireEvent.mouseOver(getByRole('button', { name: 'Search settings' }));

            expect((await findByRole('tooltip')).textContent).toBe('Search settings');
        });

        it('shows the disabled reason in the tooltip instead of the label', async () => {
            const { getByRole, findByRole } = setup([{ disabledReason: 'Nothing to search yet' }]);

            fireEvent.mouseOver(getByRole('button', { name: 'Search settings' }));

            expect((await findByRole('tooltip')).textContent).toBe('Nothing to search yet');
        });

        it('cannot be used when disabled', () => {
            const onClick = vi.fn();
            const { getByRole } = setup([{ disabled: true, onClick }]);
            const button = getByRole('button', { name: 'Search settings' }) as HTMLButtonElement;

            fireEvent.click(button);

            expect(button.disabled).toBe(true);
            expect(onClick).not.toHaveBeenCalled();
        });

        it('is still rendered, in an end adornment, when the field has neither a Clear nor an Open button', () => {
            const { getByRole, queryByRole } = setup([{}]);
            const adornment = getByRole('button', { name: 'Search settings' }).closest('.MuiAutocomplete-endAdornment');

            expect(queryByRole('button', { name: 'Open' })).toBeNull();
            expect(queryByRole('button', { name: 'Clear' })).toBeNull();
            expect(adornment).not.toBeNull();
        });

        it('shares that end adornment with the loading spinner', () => {
            const { getByRole, getByTestId } = setup([{}], { loading: true });
            const adornment = getByRole('button', { name: 'Search settings' }).closest('.MuiAutocomplete-endAdornment');

            expect(adornment?.contains(getByTestId('ring-autocomplete-circular-progress'))).toBe(true);
        });
    });

    describe('several actions', () => {
        it('runs the handler of the picked menu item and closes the menu', async () => {
            const onSearch = vi.fn();
            const onAbout = vi.fn();
            const { getByRole, getAllByRole, queryByRole, queryByTestId, input, onAncestorClick } = setup([
                { onClick: onSearch },
                { onClick: onAbout },
            ]);

            expect(queryByTestId('ring-autocomplete-action')).toBeNull();

            fireEvent.click(getByRole('button', { name: 'More actions' }));

            expect(getAllByRole('menuitem').map((item) => item.textContent?.trim())).toEqual([
                'Search settings',
                'About',
            ]);
            expect(document.activeElement).not.toBe(input);

            fireEvent.click(getByRole('menuitem', { name: 'About' }));

            expect(onAbout).toHaveBeenCalledTimes(1);
            expect(onSearch).not.toHaveBeenCalled();
            // Neither the click on the menu button nor the one on the item reaches the ancestors of the field.
            expect(onAncestorClick).not.toHaveBeenCalled();
            await waitFor(() => expect(queryByRole('menu')).toBeNull());
        });
    });

    describe('the Open button', () => {
        it('is hidden by any action, even with forcePopupIcon', () => {
            const { queryByRole } = setup([{}], { forcePopupIcon: true });

            expect(queryByRole('button', { name: 'Open' })).toBeNull();
        });

        it.each([
            { name: 'no actions', actions: undefined },
            { name: 'an empty list of actions', actions: [] },
        ])('follows forcePopupIcon with $name', ({ actions }) => {
            const forced = setup(actions, { freeSolo: true, forcePopupIcon: true } as Props);

            expect(forced.queryByRole('button', { name: 'Open' })).not.toBeNull();
            expect(forced.queryByTestId('ring-autocomplete-action')).toBeNull();
            expect(forced.queryByTestId('ring-autocomplete-actions')).toBeNull();
            forced.unmount();

            const hidden = setup(actions, { forcePopupIcon: false });

            expect(hidden.queryByRole('button', { name: 'Open' })).toBeNull();
        });
    });
});
