import { vi, describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { SplitButton } from '../../../src/index.js';

vi.useFakeTimers();

describe('Components: SplitButton', () => {
    const mainAction = vi.fn();
    const additionalAction1 = vi.fn();
    const additionalAction2 = vi.fn();
    const actions = [
        {
            label: 'Main Action',
            onClick: mainAction,
        },
        {
            label: 'Additional Action 1',
            onClick: additionalAction1,
        },
        {
            label: 'Additional Action 2',
            onClick: additionalAction2,
            disabled: true,
            disabledReason: 'Disabled because of some reason',
        },
    ];

    const mainActionDisabled = vi.fn();
    const actionsDisabled = [
        {
            label: 'Main Action',
            onClick: mainActionDisabled,
            disabled: true,
            disabledReason: 'Disabled because of some reason',
        },
    ];

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should render component with main action visible', () => {
        expect(render(<SplitButton actions={actions} />).container).toMatchSnapshot();
    });

    it('should render component with main action disabled', () => {
        expect(render(<SplitButton actions={actionsDisabled} />).container).toMatchSnapshot();
    });

    it('should render component with all actions visible after click on dropdown', () => {
        const { container, getByTestId, getByText } = render(<SplitButton actions={actions} />);

        act(() => {
            fireEvent.click(getByTestId('ArrowDropDownIcon'));
        });

        expect(getByText('Additional Action 1')).toBeDefined();

        expect(container).toMatchSnapshot();
    });

    it('should call main action on click', () => {
        const { getByText } = render(<SplitButton actions={actions} />);

        act(() => {
            fireEvent.click(getByText('Main Action'));
        });

        expect(mainAction).toHaveBeenCalledTimes(1);
    });

    it('should not call main action on click when disabled', () => {
        const { getByText } = render(<SplitButton actions={actionsDisabled} />);

        act(() => {
            fireEvent.click(getByText('Main Action'));
        });

        expect(mainAction).not.toHaveBeenCalled();
    });

    it('should call additional action on click', () => {
        const { getByText, getByTestId } = render(<SplitButton actions={actions} />);

        act(() => {
            fireEvent.click(getByTestId('ArrowDropDownIcon'));
        });

        act(() => {
            fireEvent.click(getByText('Additional Action 1'));
        });

        expect(additionalAction1).toHaveBeenCalledTimes(1);
    });

    // FIXME: There is a problem with this test after migrating from jest to vitest. To be investigated...
    it.skip('should close dropdown on click outside', async () => {
        const { queryByText, getByTestId } = render(<SplitButton actions={actions} />);

        fireEvent.click(getByTestId('ArrowDropDownIcon'));

        // necessary due to the way clickAwayListener works
        act(() => {
            vi.runAllTimers();
        });

        fireEvent.click(document);

        act(() => {
            vi.runAllTimers();
        });

        await waitFor(() => expect(queryByText('Additional Action 1')).toBeNull());
    });
});
