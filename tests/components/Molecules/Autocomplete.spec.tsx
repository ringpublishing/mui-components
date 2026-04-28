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
});
