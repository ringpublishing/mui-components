import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { Chip } from '@mui/material';
import { Info, Search, Settings2 } from 'lucide-react';
import { Autocomplete } from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';
import { render as renderWithRingTheme } from '../../test-utils/customRenderer.js';

vi.useFakeTimers();

describe('Autocomplete', () => {
    const options = [
        { label: 'Onet', id: 1 },
        { label: 'Fakt', id: 2 },
    ];

    it('should render correctly', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
                inputPlaceholder: 'Placeholder',
            },
        };

        expect(render(<Autocomplete {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with dropdown action', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
            },
            actions: [
                {
                    icon: <Search />,
                    onClick: vi.fn(),
                    disabled: false,
                    label: 'Settings',
                },
            ],
        };

        expect(render(<Autocomplete {...mockProps} />).container).toMatchSnapshot();
    });
    it('should render correctly with multiple actions', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
            },
            actions: [
                {
                    icon: <Search />,
                    onClick: vi.fn(),

                    disabled: false,
                    label: 'Settings',
                },
                {
                    icon: <Info />,
                    onClick: vi.fn(),
                    disabled: false,
                    label: 'Settings 2',
                },
            ],
        };

        expect(render(<Autocomplete {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with recently used', () => {
        const mockProps = {
            options,
            labels: {
                title: 'search by',
                recentlyUsed: 'Recently used',
                recentlyUsedResults: 'Results',
            },
            showRecentlyUsed: true,
            recentlyLocalStorageKey: 'recentlyUsed',
        };

        expect(render(<Autocomplete {...mockProps} />).container).toMatchSnapshot();
    });

    it('should show the action box with actions when the moreVert icon is clicked', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
            },
            actions: [
                {
                    icon: <span>Icon</span>,
                    onClick: vi.fn(),
                    disabled: false,
                    label: 'Settings',
                },
                {
                    icon: <span>Icon 2</span>,
                    onClick: vi.fn(),
                    disabled: false,
                    label: 'Settings 2',
                },
            ],
        };

        const { getByTestId, getByText } = render(<Autocomplete {...mockProps} />);
        fireEvent.click(getByTestId('ring-autocomplete-actions'));
        expect(getByText('Icon')).toBeDefined();
        expect(getByText('Icon 2')).toBeDefined();
    });

    it('should show a loader when loading.', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
            },
            loading: true,
        };

        const { getByTestId } = render(<Autocomplete {...mockProps} />);
        expect(getByTestId('ring-autocomplete-circular-progress')).toBeDefined();
    });

    it('should not touch localStorage when recently used is disabled', () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

        render(
            <Autocomplete
                options={options}
                labels={{
                    title: 'Title',
                }}
                recentlyLocalStorageKey="recentlyUsedDisabled"
            />,
        );

        expect(getItemSpy).not.toHaveBeenCalledWith('recentlyUsedDisabled');
        expect(setItemSpy).not.toHaveBeenCalledWith('recentlyUsedDisabled', expect.any(String));

        getItemSpy.mockRestore();
        setItemSpy.mockRestore();
    });

    it('should render correctly with option caption', () => {
        const options = [
            { label: 'Onet', id: 1, caption: 'Onet portal' },
            { label: 'Fakt', id: 2, caption: 'Fakt o tym się mówi' },
        ];
        const mockProps = {
            options,
            labels: {
                title: 'search by',
            },
        };

        expect(render(<Autocomplete {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render an option avatar image when the dropdown is open', () => {
        const options = [
            { label: 'Onet', id: 1, avatar: 'https://picsum.photos/seed/onet/48' },
            { label: 'Fakt', id: 2, avatar: 'https://picsum.photos/seed/fakt/48' },
        ];
        const mockProps = {
            options,
            labels: {
                title: 'search by',
            },
            open: true,
            slotProps: { popper: { disablePortal: true } },
        };

        const { getByRole } = render(<Autocomplete {...mockProps} />);

        const listbox = getByRole('listbox');
        const avatarImg = listbox.querySelector('img');

        expect(avatarImg).toBeTruthy();
        expect(avatarImg?.getAttribute('src')).toBe('https://picsum.photos/seed/onet/48');
        expect(listbox).toMatchSnapshot();
    });

    it('should apply slotProps.avatar to the option avatar', () => {
        const options = [{ label: 'Onet', id: 1, avatar: 'https://picsum.photos/seed/onet/48' }];
        const mockProps = {
            options,
            labels: {
                title: 'search by',
            },
            open: true,
            slotProps: {
                popper: { disablePortal: true },
                avatar: { className: 'custom-avatar', variant: 'square' as const },
            },
        };

        const { getByRole } = render(<Autocomplete {...mockProps} />);

        const avatar = getByRole('listbox').querySelector('.custom-avatar');

        expect(avatar).toBeTruthy();
        // variant prop flows through to the underlying MUI Avatar
        expect(avatar?.classList.contains('MuiAvatar-square')).toBe(true);
    });

    it('should pass slotProps to native Autocomplete component', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
            },
            slotProps: {
                chip: {
                    color: 'primary',
                    size: 'small',
                },
            },
            multiple: true,
            defaultValue: [options[0]],
        };

        const { getByText } = render(<Autocomplete {...mockProps} />);
        expect(getByText(options[0].label).parentElement).toMatchSnapshot();
    });

    it('should render selected values with renderChip', () => {
        const renderChip = vi.fn(({ option, label, chipProps }): React.ReactNode => (
            <Chip {...chipProps} label={`${label}-${(option as { id: number }).id}`} />
        ));

        const { getByText } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                defaultValue={[options[0], options[1]]}
                renderChip={renderChip}
            />,
        );

        expect(getByText('Onet-1')).toBeDefined();
        expect(getByText('Fakt-2')).toBeDefined();
        expect(renderChip).toHaveBeenCalledWith(
            expect.objectContaining({
                option: options[0],
                label: 'Onet',
                index: 0,
                chipProps: expect.objectContaining({ onDelete: expect.any(Function) }),
            }),
        );
    });

    it('should warn when renderChip is ignored without multiple', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                renderChip={(): React.ReactNode => <Chip label="custom" />}
            />,
        );

        expect(warnSpy).toHaveBeenCalledWith('Autocomplete: renderChip is ignored because multiple is not enabled.');
        warnSpy.mockRestore();
    });

    it('should warn when renderChip is overridden by renderValue or renderTags', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const renderChip = (): React.ReactNode => <Chip label="custom" />;

        render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                renderChip={renderChip}
                renderValue={(): React.ReactNode => null}
            />,
        );
        render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                renderChip={renderChip}
                renderTags={(): React.ReactNode => null}
            />,
        );

        expect(warnSpy).toHaveBeenNthCalledWith(
            1,
            'Autocomplete: renderChip is ignored because renderValue takes precedence.',
        );
        expect(warnSpy).toHaveBeenNthCalledWith(
            2,
            'Autocomplete: renderChip is ignored because renderTags takes precedence.',
        );
        warnSpy.mockRestore();
    });

    it('should keep the custom chip label consistent with the render context', () => {
        const renderChip = vi.fn(({ label, chipProps }): React.ReactNode => (
            <Chip {...chipProps} data-testid={`chip-${label}`} />
        ));

        const { getByTestId } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                defaultValue={[options[0]]}
                renderChip={renderChip}
                slotProps={{ chip: { label: 'Overridden label' } }}
            />,
        );

        expect(getByTestId('chip-Onet')).toBeDefined();
        expect(renderChip).toHaveBeenCalledWith(
            expect.objectContaining({
                label: 'Onet',
                chipProps: expect.objectContaining({ label: 'Onet' }),
            }),
        );
    });

    it('should preserve chip deletion with renderChip', () => {
        const handleChange = vi.fn();
        let deleteChip: ((event: React.SyntheticEvent) => void) | undefined;

        const { getAllByRole } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                defaultValue={[options[0], options[1]]}
                onChange={handleChange}
                renderChip={({ chipProps, label }): React.ReactElement => {
                    deleteChip = chipProps.onDelete;

                    return <Chip {...chipProps} label={label} />;
                }}
            />,
        );

        expect(getAllByRole('button').length).toBeGreaterThan(0);
        expect(deleteChip).toBeDefined();
        deleteChip?.({ stopPropagation: vi.fn() } as unknown as React.SyntheticEvent);
        expect(handleChange).toHaveBeenCalledWith(expect.anything(), [options[0]], 'removeOption', {
            option: options[1],
        });
    });

    it('should render sortable chips with the default renderer and keep deletion working', () => {
        const handleChange = vi.fn();

        const { container, getByText, queryByText } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                defaultValue={[options[0], options[1]]}
                onChange={handleChange}
            />,
        );

        expect(getByText('Onet')).toBeDefined();
        expect(getByText('Fakt')).toBeDefined();

        const deleteIcons = container.querySelectorAll('.MuiChip-deleteIcon');
        expect(deleteIcons.length).toBe(2);
        fireEvent.click(deleteIcons[1]);

        expect(handleChange).toHaveBeenCalledWith(expect.anything(), [options[0]], 'removeOption', {
            option: options[1],
        });
        // sortableChips renders controlled from an internal copy, so the deletion must stick.
        expect(queryByText('Fakt')).toBeNull();
    });

    it('should mark every selected chip with a per-chip data-testid, sortable or not', () => {
        const { queryByTestId, rerender } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                dataTestIdSuffix="portals"
                defaultValue={[options[0], options[1]]}
            />,
        );

        expect(queryByTestId('ring-autocomplete-portals-chip-0')).not.toBeNull();
        expect(queryByTestId('ring-autocomplete-portals-chip-1')).not.toBeNull();

        rerender(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                dataTestIdSuffix="portals"
                defaultValue={[options[0], options[1]]}
            />,
        );

        expect(queryByTestId('ring-autocomplete-portals-chip-0')).not.toBeNull();
        expect(queryByTestId('ring-autocomplete-portals-chip-1')).not.toBeNull();
    });

    it('should compose sortableChips with renderChip and expose isDragActive', () => {
        const renderChip = vi.fn(({ label, chipProps }): React.ReactNode => <Chip {...chipProps} label={label} />);

        const { getByText } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                defaultValue={[options[0]]}
                renderChip={renderChip}
            />,
        );

        expect(getByText('Onet')).toBeDefined();
        expect(renderChip).toHaveBeenCalledWith(
            expect.objectContaining({
                option: options[0],
                label: 'Onet',
                index: 0,
                isDragActive: false,
                chipProps: expect.objectContaining({ onDelete: expect.any(Function) }),
            }),
        );
    });

    it('should keep a controlled value authoritative when the consumer rejects a change', () => {
        const handleChange = vi.fn();

        // A controlled consumer that ignores the change (never updates its state): the rendered
        // value must stay its `value` prop, exactly as it does without sortableChips.
        const { container } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                value={[options[0], options[1]]}
                onChange={handleChange}
            />,
        );

        const deleteIcons = container.querySelectorAll('.MuiChip-deleteIcon');
        expect(deleteIcons.length).toBe(2);
        fireEvent.click(deleteIcons[1]);

        expect(handleChange).toHaveBeenCalledWith(expect.anything(), [options[0]], 'removeOption', {
            option: options[1],
        });
        expect(container.querySelectorAll('.MuiChip-root').length).toBe(2);
    });

    it('renders the lucide X as the chip delete glyph on the non-sortable path', () => {
        const { container } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                value={[options[0], options[1]]}
                onChange={vi.fn()}
            />,
        );

        const deleteIcon = container.querySelector('.MuiChip-deleteIcon');

        expect(deleteIcon?.classList.contains('lucide-x')).toBe(true);
        expect(container.querySelector('[data-testid="CancelIcon"]')).toBeNull();
    });

    it('renders the same lucide X as the chip delete glyph on the sortable path', () => {
        const { container } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                value={[options[0], options[1]]}
                onChange={vi.fn()}
            />,
        );

        const deleteIcon = container.querySelector('.MuiChip-deleteIcon');

        expect(deleteIcon?.classList.contains('lucide-x')).toBe(true);
        expect(container.querySelector('[data-testid="CancelIcon"]')).toBeNull();
    });

    // A truncated label must not take its width from the delete target: jsdom has no layout, so the
    // flex rule itself is what can be asserted here.
    it('keeps the default delete glyph from shrinking on both chip paths, and leaves a custom one alone', () => {
        const flexShrinkOf = (container: HTMLElement): string[] =>
            Array.from(container.querySelectorAll('.MuiChip-deleteIcon')).map(
                (icon) => getComputedStyle(icon).flexShrink,
            );
        const props = {
            options,
            labels: { title: 'Title' },
            multiple: true as const,
            value: [options[0], options[1]],
            onChange: vi.fn(),
        };

        const plain = render(<Autocomplete {...props} />);
        expect(flexShrinkOf(plain.container)).toEqual(['0', '0']);
        plain.unmount();

        const sortable = render(<Autocomplete {...props} sortableChips={true} />);
        expect(flexShrinkOf(sortable.container)).toEqual(['0', '0']);
        sortable.unmount();

        const custom = render(
            <Autocomplete {...props} slotProps={{ chip: { deleteIcon: <span className="custom-glyph" /> } }} />,
        );
        expect(custom.container.querySelector('.custom-glyph')?.getAttribute('style')).toBeNull();
    });

    // The theme supplies both indicators, so the assertion runs under ThemeConfig.
    it('renders the lucide X in the clear button, matching the popup chevron', () => {
        const { getByRole, getByTitle } = renderWithRingTheme(
            <Autocomplete options={options} labels={{ title: 'Title' }} value={options[0]} onChange={vi.fn()} />,
        );

        const clearIcon = getByTitle('Clear').querySelector('svg');
        const popupIcon = getByRole('button', { name: 'Open' }).querySelector('svg');

        expect(clearIcon?.classList.contains('lucide-x')).toBe(true);
        expect(clearIcon?.getAttribute('width')).toBe(popupIcon?.getAttribute('width'));
    });

    it('lets a consumer clearIcon win over the lucide default', () => {
        const { getByTitle } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                value={options[0]}
                onChange={vi.fn()}
                clearIcon={<span data-testid="custom-clear" />}
            />,
        );

        const clearButton = getByTitle('Clear');

        expect(clearButton.querySelector('[data-testid="custom-clear"]')).not.toBeNull();
        expect(clearButton.querySelector('.lucide-x')).toBeNull();
    });

    it('lets slotProps.chip.deleteIcon win over the lucide default on both chip paths', () => {
        for (const sortableChips of [false, true]) {
            const { container, unmount } = render(
                <Autocomplete
                    options={options}
                    labels={{ title: 'Title' }}
                    multiple={true}
                    sortableChips={sortableChips}
                    value={[options[0], options[1]]}
                    onChange={vi.fn()}
                    slotProps={{ chip: { deleteIcon: <span data-testid="custom-x" /> } }}
                />,
            );

            expect(container.querySelectorAll('[data-testid="custom-x"]').length).toBe(2);
            expect(container.querySelector('.MuiChip-root .lucide-x')).toBeNull();

            unmount();
        }
    });

    it('does not advertise a keyboard drag on sortable chips, which are pointer-only', () => {
        const { container } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                value={[options[0], options[1]]}
                onChange={vi.fn()}
            />,
        );

        // Positive control: the drag context IS mounted.
        expect(container.querySelector('[id^="DndLiveRegion"]')).not.toBeNull();

        // No `role="button"` wrapper around the chip's own ButtonBase (axe `nested-interactive`),
        // no dead tab stop, and no "press the space bar" promise the component cannot keep.
        expect(container.querySelectorAll('[aria-roledescription="sortable"]').length).toBe(0);
        expect(container.querySelectorAll('[tabindex="0"]').length).toBe(0);
        expect(container.textContent).not.toContain('space bar');

        // MUI still owns the chips' own keyboard model.
        container.querySelectorAll('.MuiChip-root').forEach((chip) => {
            expect(chip.getAttribute('tabindex')).toBe('-1');
            expect(chip.parentElement?.getAttribute('role')).toBeNull();
        });
    });

    it('should not make chips sortable when disabled or readOnly', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        const disabled = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                disabled={true}
                defaultValue={[options[0], options[1]]}
            />,
        );

        // Anchored on dnd-kit's own live region — i.e. "a drag context is mounted here". The
        // previous anchor, `[aria-roledescription="sortable"]`, is now absent on the WORKING
        // sortable path too (pointer-only chips no longer advertise a keyboard drag), which would
        // make this assertion pass even if sortableChips were silently broken.
        expect(disabled.container.querySelector('[id^="DndLiveRegion"]')).toBeNull();
        expect(disabled.getByText('Onet')).toBeDefined();
        expect(warnSpy).toHaveBeenCalledWith(
            'Autocomplete: sortableChips is ignored because the component is disabled.',
        );

        const readOnly = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                readOnly={true}
                defaultValue={[options[0], options[1]]}
            />,
        );

        expect(readOnly.container.querySelector('[id^="DndLiveRegion"]')).toBeNull();
        expect(warnSpy).toHaveBeenCalledWith(
            'Autocomplete: sortableChips is ignored because the component is read-only.',
        );
        warnSpy.mockRestore();
    });

    it('should keep a consumer deleteIcon from slotProps on sortable chips', () => {
        const { container } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                defaultValue={[options[0]]}
                slotProps={{ chip: { deleteIcon: <span data-testid="custom-delete" /> } }}
            />,
        );

        expect(container.querySelector('[data-testid="custom-delete"]')).toBeDefined();
    });

    it('should survive readOnly and disabled flipping on after mount with sortableChips', () => {
        // The internal value copy that backs an UNCONTROLLED sortable Autocomplete is handed to MUI
        // whether or not sorting is enabled. Turning `readOnly` (or `disabled`) on after mount — an
        // ordinary form switching to view mode — must not take `value` from an array to `undefined`
        // while MUI's `useControlled` still believes the field is controlled, or MUI throws on
        // `value.length`.
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        for (const lockProp of ['readOnly', 'disabled'] as const) {
            const props = {
                options,
                labels: { title: 'Title' },
                multiple: true,
                sortableChips: true,
                defaultValue: [options[0]],
            };
            const { rerender, getByText, unmount } = render(<Autocomplete {...props} {...{ [lockProp]: false }} />);

            expect(getByText('Onet')).toBeDefined();

            rerender(<Autocomplete {...props} {...{ [lockProp]: true }} />);

            // Still rendering the same chips, from the same copy.
            expect(getByText('Onet')).toBeDefined();

            // And back: the copy is still the source of truth, so the chips do not vanish.
            rerender(<Autocomplete {...props} {...{ [lockProp]: false }} />);
            expect(getByText('Onet')).toBeDefined();

            unmount();
        }

        vi.mocked(console.warn).mockRestore();
    });

    it('should let a consumer slotProps.chip data-testid win over the generated one', () => {
        const { container } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                defaultValue={[options[0]]}
                slotProps={{ chip: { 'data-testid': 'my-own-chip' } as never }}
            />,
        );

        expect(container.querySelector('[data-testid="my-own-chip"]')).not.toBeNull();
        expect(container.querySelector('[data-testid="ring-autocomplete-chip-0"]')).toBeNull();
    });

    it('should warn when sortableChips is ignored', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        render(<Autocomplete options={options} labels={{ title: 'Title' }} sortableChips={true} />);
        render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                renderValue={(): React.ReactNode => null}
            />,
        );
        render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                renderTags={(): React.ReactNode => null}
            />,
        );

        expect(warnSpy).toHaveBeenNthCalledWith(
            1,
            'Autocomplete: sortableChips is ignored because multiple is not enabled.',
        );
        expect(warnSpy).toHaveBeenNthCalledWith(
            2,
            'Autocomplete: sortableChips is ignored because renderValue takes precedence.',
        );
        expect(warnSpy).toHaveBeenNthCalledWith(
            3,
            'Autocomplete: sortableChips is ignored because renderTags takes precedence.',
        );
        warnSpy.mockRestore();
    });

    it('should fall back to non-sortable chips when option identities collide', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const duplicateOptions = [{ label: 'Dup' }, { label: 'Dup' }];

        const { getAllByText } = render(
            <Autocomplete
                options={duplicateOptions}
                labels={{ title: 'Title' }}
                multiple={true}
                sortableChips={true}
                defaultValue={[duplicateOptions[0], duplicateOptions[1]]}
            />,
        );

        expect(getAllByText('Dup').length).toBeGreaterThanOrEqual(2);
        expect(warnSpy).toHaveBeenCalledWith(
            'Autocomplete: sortableChips requires unique option identities ' +
                '(getOptionKey, an id field, or unique labels); rendering non-sortable chips.',
        );
        warnSpy.mockRestore();
    });

    it('should handle using freeSolo options', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
            },
            freeSolo: true,
            defaultValue: 'Custom value',
        };

        const { getByDisplayValue } = render(<Autocomplete {...mockProps} />);
        expect(getByDisplayValue('Custom value')).toBeDefined();
    });

    it('should store single option (not array) in recently used when multiple is true', () => {
        const localStorageKey = 'recentlyUsedMultiple';
        localStorage.setItem(localStorageKey, '[]');

        const mockProps = {
            options,
            labels: {
                title: 'search by',
                recentlyUsed: 'Recently used',
                recentlyUsedResults: 'Results',
            },
            showRecentlyUsed: true,
            recentlyLocalStorageKey: localStorageKey,
            multiple: true,
        };

        const { getByRole, getByText } = render(<Autocomplete {...mockProps} />);

        const input = getByRole('combobox');
        fireEvent.click(input);
        fireEvent.change(input, { target: { value: 'Onet' } });

        vi.advanceTimersByTime(100);

        fireEvent.click(getByText('Onet'));

        const stored = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        expect(Array.isArray(stored)).toBe(true);
        expect(stored.length).toBe(1);
        // Should be a single object, not a nested array
        expect(stored[0]).toHaveProperty('label', 'Onet');
        expect(Array.isArray(stored[0])).toBe(false);
        // Should not contain internal groupBy/sortBy properties
        expect(stored[0]).not.toHaveProperty('groupBy');
        expect(stored[0]).not.toHaveProperty('sortBy');

        localStorage.removeItem(localStorageKey);
    });

    it('should not persist a non-string (React node) avatar in recently used', () => {
        const localStorageKey = 'recentlyUsedAvatar';
        localStorage.setItem(localStorageKey, '[]');

        const avatarOptions = [
            { label: 'Onet', id: 1, avatar: <Info /> },
            { label: 'Fakt', id: 2, avatar: 'https://picsum.photos/seed/fakt/48' },
        ];

        const mockProps = {
            options: avatarOptions,
            labels: {
                title: 'search by',
                recentlyUsed: 'Recently used',
                recentlyUsedResults: 'Results',
            },
            showRecentlyUsed: true,
            recentlyLocalStorageKey: localStorageKey,
        };

        const { getByRole, getByText } = render(<Autocomplete {...mockProps} />);

        const input = getByRole('combobox');
        fireEvent.click(input);
        fireEvent.change(input, { target: { value: 'Onet' } });

        vi.advanceTimersByTime(100);

        fireEvent.click(getByText('Onet'));

        const stored = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        expect(stored[0]).toHaveProperty('label', 'Onet');
        // React node avatar must be dropped so it survives the JSON roundtrip
        expect(stored[0]).not.toHaveProperty('avatar');

        localStorage.removeItem(localStorageKey);
    });

    it('should persist a string (URL) avatar in recently used', () => {
        const localStorageKey = 'recentlyUsedStringAvatar';
        localStorage.setItem(localStorageKey, '[]');

        const avatarOptions = [
            { label: 'Fakt', id: 2, avatar: 'https://picsum.photos/seed/fakt/48' },
            { label: 'Onet', id: 1, avatar: 'https://picsum.photos/seed/onet/48' },
        ];

        const mockProps = {
            options: avatarOptions,
            labels: {
                title: 'search by',
                recentlyUsed: 'Recently used',
                recentlyUsedResults: 'Results',
            },
            showRecentlyUsed: true,
            recentlyLocalStorageKey: localStorageKey,
        };

        const { getByRole, getByText } = render(<Autocomplete {...mockProps} />);

        const input = getByRole('combobox');
        fireEvent.click(input);
        fireEvent.change(input, { target: { value: 'Fakt' } });

        vi.advanceTimersByTime(100);

        fireEvent.click(getByText('Fakt'));

        const stored = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        expect(stored[0]).toHaveProperty('label', 'Fakt');
        expect(stored[0]).toHaveProperty('avatar', 'https://picsum.photos/seed/fakt/48');

        localStorage.removeItem(localStorageKey);
    });

    it('should defer recently used ordering until the popup closes', () => {
        const localStorageKey = 'recentlyUsedDeferredOrdering';
        const recentlyUsedOptions = [
            { label: 'Onet', id: 1 },
            { label: 'Fakt', id: 2 },
            { label: 'TVN', id: 3 },
        ];
        const allOptions = [...recentlyUsedOptions, { label: 'Interia', id: 4 }];
        localStorage.setItem(localStorageKey, JSON.stringify(recentlyUsedOptions));

        const { getByRole, getAllByRole } = render(
            <Autocomplete
                options={allOptions}
                labels={{
                    title: 'Search by',
                    recentlyUsed: 'Recently used',
                    recentlyUsedResults: 'Results',
                }}
                showRecentlyUsed={true}
                recentlyLocalStorageKey={localStorageKey}
                recentlyUsedLimit={3}
                multiple={true}
                slotProps={{ popper: { disablePortal: true } }}
            />,
        );

        const input = getByRole('combobox');
        fireEvent.mouseDown(input);

        const optionLabelsBeforeSelection = getAllByRole('option').map((option) => option.textContent);
        expect(optionLabelsBeforeSelection).toEqual(['Onet', 'Fakt', 'TVN', 'Interia']);

        fireEvent.click(getByRole('option', { name: 'Interia' }));

        fireEvent.mouseDown(input);

        expect(getAllByRole('option').map((option) => option.textContent)).toEqual(['Interia', 'Onet', 'Fakt', 'TVN']);
        expect(JSON.parse(localStorage.getItem(localStorageKey) || '[]')).toEqual([
            { label: 'Interia', id: 4 },
            { label: 'Onet', id: 1 },
            { label: 'Fakt', id: 2 },
        ]);

        localStorage.removeItem(localStorageKey);
    });

    it('should not update recently used on removeOption in multiple mode', () => {
        const localStorageKey = 'recentlyUsedRemove';
        localStorage.setItem(localStorageKey, JSON.stringify([{ label: 'Onet', id: 1 }]));

        const mockProps = {
            options,
            labels: {
                title: 'search by',
                recentlyUsed: 'Recently used',
                recentlyUsedResults: 'Results',
            },
            showRecentlyUsed: true,
            recentlyLocalStorageKey: localStorageKey,
            multiple: true,
            defaultValue: [options[0]],
        };

        const { getAllByRole } = render(<Autocomplete {...mockProps} />);

        const clearButtons = getAllByRole('button');
        const chipCancelButton = clearButtons.find((btn) => btn.querySelector('.MuiChip-deleteIcon') !== null);

        expect(chipCancelButton).toBeDefined();
        fireEvent.click(chipCancelButton as HTMLElement);

        const stored = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        // Recently used should still contain the original item (not modified on remove)
        expect(stored.length).toBe(1);
        expect(stored[0]).toHaveProperty('label', 'Onet');

        localStorage.removeItem(localStorageKey);
    });

    it('should not allow selecting the same option twice in multiple mode with showRecentlyUsed', () => {
        const localStorageKey = 'recentlyUsedDuplicate';
        localStorage.setItem(localStorageKey, '[]');

        const handleChange = vi.fn();
        const mockProps = {
            options,
            labels: {
                title: 'search by',
                recentlyUsed: 'Recently used',
                recentlyUsedResults: 'Results',
            },
            showRecentlyUsed: true,
            recentlyLocalStorageKey: localStorageKey,
            multiple: true,
            filterSelectedOptions: true,
            value: [options[0]],
            onChange: handleChange,
            openOnFocus: true,
        };

        const { getByRole, queryAllByText } = render(<Autocomplete {...mockProps} />);

        const input = getByRole('combobox');
        fireEvent.mouseDown(input);

        vi.advanceTimersByTime(100);

        // With filterSelectedOptions, "Onet" (already selected) should be filtered out
        const onetOptions = queryAllByText('Onet').filter((el) => el.closest('[role="option"]') !== null);
        expect(onetOptions.length).toBe(0);

        // "Fakt" should still appear as an option
        const faktOptions = queryAllByText('Fakt').filter((el) => el.closest('[role="option"]') !== null);
        expect(faktOptions.length).toBe(1);

        localStorage.removeItem(localStorageKey);
    });

    it('should use custom isOptionEqualToValue with showRecentlyUsed', () => {
        const localStorageKey = 'recentlyUsedCustomEqual';
        localStorage.setItem(localStorageKey, '[]');

        const customIsOptionEqualToValue = vi.fn(
            (option: unknown, value: unknown) => (option as { id: number }).id === (value as { id: number }).id,
        );
        const mockProps = {
            options,
            labels: {
                title: 'search by',
                recentlyUsed: 'Recently used',
                recentlyUsedResults: 'Results',
            },
            showRecentlyUsed: true,
            recentlyLocalStorageKey: localStorageKey,
            multiple: true,
            filterSelectedOptions: true,
            value: [options[0]],
            isOptionEqualToValue: customIsOptionEqualToValue,
            openOnFocus: true,
        };

        const { getByRole, queryAllByText } = render(<Autocomplete {...mockProps} />);

        const input = getByRole('combobox');
        fireEvent.mouseDown(input);

        vi.advanceTimersByTime(100);

        // The custom isOptionEqualToValue should have been called
        expect(customIsOptionEqualToValue).toHaveBeenCalled();
        // It should receive clean options without groupBy/sortBy
        const firstCall = customIsOptionEqualToValue.mock.calls[0];
        expect(firstCall[0]).not.toHaveProperty('groupBy');
        expect(firstCall[0]).not.toHaveProperty('sortBy');

        // "Onet" should be filtered out (recognized as selected via custom comparator)
        const onetOptions = queryAllByText('Onet').filter((el) => el.closest('[role="option"]') !== null);
        expect(onetOptions.length).toBe(0);

        localStorage.removeItem(localStorageKey);
    });

    it('should lay the loading spinner wrapper out like the action buttons beside it', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
            },
            loading: true,
            actions: [
                {
                    icon: <Search />,
                    onClick: vi.fn(),
                    disabled: false,
                    label: 'Settings',
                },
            ],
        };

        const { getByTestId } = render(<Autocomplete {...mockProps} />);

        const spinnerWrapper = getByTestId('ring-autocomplete-circular-progress').parentElement as HTMLElement;

        // The adornment is not always a flex container: there a block wrapper grows the field, and a
        // baseline-aligned one moves the action buttons down while `loading` is on.
        expect(getComputedStyle(spinnerWrapper).display).toBe('inline-flex');
        expect(getComputedStyle(spinnerWrapper).verticalAlign).toBe('middle');
    });

    it('should expose the action label as the accessible name of the single-action button', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
            },
            actions: [
                {
                    icon: <Search />,
                    onClick: vi.fn(),
                    disabled: false,
                    label: 'Settings',
                },
            ],
        };

        const { getByRole } = render(<Autocomplete {...mockProps} />);

        expect(getByRole('button', { name: 'Settings' })).toBeDefined();
    });

    it('should expose an accessible name on the multiple-actions menu button, overridable via labels', () => {
        const actions = [
            {
                icon: <Search />,
                onClick: vi.fn(),
                disabled: false,
                label: 'Settings',
            },
            {
                icon: <Info />,
                onClick: vi.fn(),
                disabled: false,
                label: 'Info',
            },
        ];

        const withDefault = render(<Autocomplete options={options} labels={{ title: 'Title' }} actions={actions} />);
        expect(withDefault.getByRole('button', { name: 'More actions' })).toBeDefined();
        withDefault.unmount();

        const withCustom = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title', moreActions: 'Więcej akcji' }}
                actions={actions}
            />,
        );
        expect(withCustom.getByRole('button', { name: 'Więcej akcji' })).toBeDefined();
        withCustom.unmount();

        // A blank label must not produce an unnamed button — the default wins.
        const withBlank = render(
            <Autocomplete options={options} labels={{ title: 'Title', moreActions: '   ' }} actions={actions} />,
        );
        expect(withBlank.getByRole('button', { name: 'More actions' })).toBeDefined();
    });

    it('should not expose the loading spinner as an unnamed button', () => {
        const mockProps = {
            options,
            labels: {
                title: 'Title',
            },
            loading: true,
        };

        const { getByTestId } = render(<Autocomplete {...mockProps} />);

        const spinner = getByTestId('ring-autocomplete-circular-progress');
        expect(spinner.closest('button')).toBeNull();
    });

    it('should render multiple menu list actions and forward their refs to the triggers', () => {
        const firstActionRef = React.createRef<HTMLButtonElement>();
        const secondActionRef = React.createRef<HTMLButtonElement>();
        const firstOnClick = vi.fn();
        const secondOnClick = vi.fn();
        const { getByRole, getByText } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                menuListActions={{
                    label: 'Results',
                    actions: [
                        { anchorRef: firstActionRef, icon: <Settings2 />, label: 'Filters', onClick: firstOnClick },
                        { anchorRef: secondActionRef, icon: <Settings2 />, label: 'More', onClick: secondOnClick },
                    ],
                }}
                open={true}
            />,
        );

        expect(getByText('Results')).toBeDefined();
        const firstTrigger = getByRole('button', { name: 'Filters' });
        const secondTrigger = getByRole('button', { name: 'More' });

        expect(firstActionRef.current).toBe(firstTrigger);
        expect(secondActionRef.current).toBe(secondTrigger);
        fireEvent.click(firstTrigger);
        fireEvent.click(secondTrigger);
        expect(firstOnClick).toHaveBeenCalledTimes(1);
        expect(secondOnClick).toHaveBeenCalledTimes(1);
    });

    it('should show the disabled reason for a disabled menu list action', () => {
        const { getByRole } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                menuListActions={{
                    actions: [
                        {
                            disabled: true,
                            disabledReason: 'Select a result before saving',
                            icon: <Settings2 />,
                            label: 'Save results',
                        },
                    ],
                }}
                open={true}
            />,
        );
        const trigger = getByRole('button', { name: 'Save results' });

        fireEvent.mouseOver(trigger.parentElement as HTMLElement);
        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(getByRole('tooltip').textContent).toBe('Select a result before saving');
    });

    it('should keep the options focused when the menu list action trigger is pressed', () => {
        const { getByRole } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                menuListActions={{ label: 'Results', actions: [{ icon: <Settings2 />, label: 'Filters' }] }}
                open={true}
            />,
        );
        const input = getByRole('combobox');
        const trigger = getByRole('button', { name: 'Filters' });

        input.focus();
        fireEvent.mouseDown(trigger);

        expect(document.activeElement).toBe(input);
    });

    it('should render menu list actions without a heading when label is omitted', () => {
        const { getByRole } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                menuListActions={{ actions: [{ icon: <Settings2 />, label: 'Filters' }] }}
                open={true}
                slotProps={{ popper: { disablePortal: true } }}
            />,
        );

        expect(document.body.querySelector('.MuiAutocomplete-groupLabel')?.textContent).toBe('');
        expect(getByRole('button', { name: 'Filters' })).toBeDefined();
    });

    it('should preserve ungrouped option styles when a menu list action is provided', () => {
        const { getByRole } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                menuListActions={{ label: 'Filter results', actions: [{ icon: <Settings2 />, label: 'Filters' }] }}
                defaultValue={options[0]}
                open={true}
                slotProps={{ popper: { disablePortal: true } }}
            />,
        );

        const option = getByRole('option', { name: 'Onet' });

        expect(option.parentElement?.getAttribute('class')).not.toContain('MuiAutocomplete-groupUl');
        expect(option.getAttribute('aria-selected')).toBe('true');
    });

    it('should render a menu list action next to the first group heading', () => {
        const groupedOptions = [
            { label: 'Onet', id: 1, category: 'Publications' },
            { label: 'Fakt', id: 2, category: 'People' },
        ];
        const { getAllByText, getByRole, queryByText } = render(
            <Autocomplete
                options={groupedOptions}
                labels={{ title: 'Title' }}
                menuListActions={{ label: 'Filter results', actions: [{ icon: <Settings2 />, label: 'Filters' }] }}
                groupBy={(option): string => option.category}
                open={true}
                slotProps={{ popper: { disablePortal: true } }}
            />,
        );

        expect(getAllByText('Publications').length).toBe(1);
        expect(getAllByText('People').length).toBe(1);
        expect(queryByText('Results')).toBeNull();
        expect(getByRole('button', { name: 'Filters' })).toBeDefined();
    });

    it('should prefer a custom renderGroup over menuListActions', () => {
        const renderGroup = vi.fn(({ key, children }): React.ReactNode => <li key={key}>Custom group {children}</li>);

        const { getByText, queryByTestId } = render(
            <Autocomplete
                options={options}
                labels={{ title: 'Title' }}
                menuListActions={{ label: 'Results', actions: [{ icon: <Settings2 />, label: 'Filters' }] }}
                renderGroup={renderGroup}
                groupBy={(): string => 'Results'}
                open={true}
                slotProps={{ popper: { disablePortal: true } }}
            />,
        );

        expect(getByText('Custom group')).toBeDefined();
        expect(renderGroup).toHaveBeenCalledTimes(1);
        expect(queryByTestId('ring-autocomplete-menu-list-action-0')).toBeNull();
    });
});
