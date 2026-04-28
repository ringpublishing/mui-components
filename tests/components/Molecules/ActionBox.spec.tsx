import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { useRef } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { RocketLaunch } from '@mui/icons-material';
import { ActionBox, determineTransformOriginFromPopperPlacement } from '../../../src/index.js';
import { Action } from '../../../src/types.js';

describe('Components: ActionBox', () => {
    const action1 = vi.fn();
    const action2 = vi.fn();
    const actions = [
        {
            label: 'Action 1',
            onClick: action1,
            icon: <RocketLaunch />,
        },
        {
            label: 'Action 2',
            onClick: action2,
            disabled: true,
            disabledReason: 'Disabled because of some reason',
        },
    ];

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const TestComponent = ({ actions }: { actions: Action[] }): React.JSX.Element => {
        const anchorRef = useRef(null);

        return (
            <div ref={anchorRef}>
                <button>Open ActionBox</button>
                <ActionBox actions={actions} anchorEl={anchorRef} hasScroll={false} visibleActionsCount={3} />
            </div>
        );
    };

    it('should render component with actions visible', () => {
        const { getByText, queryByText } = render(<TestComponent actions={actions} />);

        expect(getByText('Open ActionBox')).toBeDefined();
        expect(queryByText('Action 1')).toBeNull();

        fireEvent.click(getByText('Open ActionBox'));

        expect(getByText('Action 1')).toBeDefined();
    });

    it('should call action on click', () => {
        const { getByText } = render(<TestComponent actions={actions} />);
        fireEvent.click(getByText('Open ActionBox'));
        fireEvent.click(getByText('Action 1'));

        expect(action1).toHaveBeenCalledTimes(1);
        expect(action2).toHaveBeenCalledTimes(0);
    });

    // FIXME: There is a problem with this test after migrating from jest to vitest. To be investigated...
    it.skip('should close dropdown on click outside', async () => {
        const { queryByText, getByText } = render(<TestComponent actions={actions} />);
        fireEvent.click(getByText('Open ActionBox'));
        fireEvent.click(document);
        // necessary due to the way clickAwayListener works
        act(() => {
            vi.runAllTimers();
        });

        fireEvent.click(document);

        act(() => {
            vi.runAllTimers();
        });

        await waitFor(() => expect(queryByText('Action 1')).toBeNull());
    });
});

describe('determineTransformOriginFromPopperPlacement', () => {
    it('should return correct transform origin for each placement', () => {
        expect(determineTransformOriginFromPopperPlacement('bottom-end')).toBe('top right');
        expect(determineTransformOriginFromPopperPlacement('bottom-start')).toBe('top left');
        expect(determineTransformOriginFromPopperPlacement('top-end')).toBe('bottom right');
        expect(determineTransformOriginFromPopperPlacement('top-start')).toBe('bottom left');
        expect(determineTransformOriginFromPopperPlacement('left-end')).toBe('top right');
        expect(determineTransformOriginFromPopperPlacement('left-start')).toBe('top left');
        expect(determineTransformOriginFromPopperPlacement('right-end')).toBe('top left');
        expect(determineTransformOriginFromPopperPlacement('right-start')).toBe('top left');
    });

    it('should return default transform origin for undefined placement', () => {
        expect(determineTransformOriginFromPopperPlacement(undefined)).toBe('top right');
    });
});
