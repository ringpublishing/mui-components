import { vi, describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { InfoOutlined, ManageSearch } from '@mui/icons-material';
import { Autocomplete } from '../../../src/components/Molecules/Autocomplete/Autocomplete.js';

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
                    icon: <ManageSearch />,
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
                    icon: <ManageSearch />,
                    onClick: vi.fn(),

                    disabled: false,
                    label: 'Settings',
                },
                {
                    icon: <InfoOutlined />,
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
        const chipCancelButton = clearButtons.find(
            (btn) => btn.querySelector('svg[data-testid="CancelIcon"]') !== null,
        );

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
});
