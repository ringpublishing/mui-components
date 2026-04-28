import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Ranges, RangesApiRef } from '../../../src/index.js';

describe('Ranges', () => {
    const mockProps = {
        rangeDefinitions: {
            range1: { label: 'Range 1', order: 0, rangeBounds: { min: 10, max: 100 } },
            range2: {
                label: 'Range 2',
                order: 1,
                rangeOptions: [
                    { value: 10000, label: '10K', order: 0 },
                    { value: 20000, label: '20K', order: 1 },
                ],
            },
        },
        maxAppliedRanges: 2,
        onChange: vi.fn(),
        labels: {
            rangeSelect: 'Range',
            addRangeButton: 'Add Range',
            removeRangeButton: 'Remove',
            rangeSelectPlaceholder: 'Select Range',
            fromInput: 'From',
            toInput: 'To',
            valueTooLowError: 'Min value is ',
            valueTooHighError: 'Max value is ',
            valueRequiredError: 'Field is required',
        },
        initialState: {
            range1: { order: 0 },
        },
    };

    console.error = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render correctly', () => {
        const { container } = render(<Ranges {...mockProps} />);
        expect(container).toMatchSnapshot();
    });

    it('should add a new range when Add Range button is clicked', () => {
        const { getAllByTitle, getByText } = render(<Ranges {...mockProps} />);
        act(() => {
            fireEvent.click(getByText('Add Range'));
        });
        expect(getAllByTitle('Range')).toHaveLength(2);
    });

    it('should remove a range when Remove button is clicked', () => {
        const { getByText, getAllByTitle } = render(<Ranges {...mockProps} />);
        act(() => {
            fireEvent.click(getByText('Remove'));
        });
        expect(mockProps.onChange).toHaveBeenCalledWith({});
        expect(getAllByTitle('Range')).toHaveLength(1);
    });

    it('should not add more ranges than maxAppliedRanges', () => {
        const initialState = { range1: { order: 0 }, range2: { order: 1 } };
        const { queryByText } = render(<Ranges {...mockProps} initialState={initialState} />);
        expect(queryByText('Add Range')).toBeNull();
    });

    it('should throw an error if initialState exceeds maxAppliedRanges', () => {
        const initialState = { range1: { order: 0 }, range2: { order: 1 }, range3: { order: 2 } };
        expect(() => render(<Ranges {...mockProps} initialState={initialState} />)).toThrow(
            'initial state ranges exceed maxAppliedRanges',
        );
    });

    it('should call onChange with updated ranges when "from" value is changed', () => {
        const { getByLabelText } = render(<Ranges {...mockProps} />);
        act(() => {
            fireEvent.change(getByLabelText('From'), { target: { value: '20' } });
        });
        expect(mockProps.onChange).toHaveBeenCalledWith({ range1: { order: 0, from: 20 } });
    });

    it('should call onChange with updated ranges when "to" value is changed', () => {
        const { getByLabelText } = render(<Ranges {...mockProps} />);
        act(() => {
            fireEvent.change(getByLabelText('To'), { target: { value: '40' } });
        });
        expect(mockProps.onChange).toHaveBeenCalledWith({ range1: { order: 0, to: 40 } });
    });

    it('should show error if "from" value is below min range bound and it should not call onChange', () => {
        const { getByLabelText, getByText } = render(<Ranges {...mockProps} />);
        act(() => {
            fireEvent.change(getByLabelText('From'), { target: { value: '5' } });
        });
        expect(getByText('Min value is 10')).toBeDefined();
        expect(mockProps.onChange).not.toHaveBeenCalled();
    });

    it('should show error if "to" value is above max range bound and it should not call onChange', () => {
        const { getByLabelText, getByText } = render(<Ranges {...mockProps} />);
        act(() => {
            fireEvent.change(getByLabelText('To'), { target: { value: '150' } });
        });
        expect(getByText('Max value is 100')).toBeDefined();
        expect(mockProps.onChange).not.toHaveBeenCalled();
    });

    it('should show error if "from" value is greater than "to" value and it should not call onChange with invalid range', () => {
        const { getByLabelText, container } = render(<Ranges {...mockProps} />);
        act(() => {
            fireEvent.change(getByLabelText('From'), { target: { value: '50' } });
            fireEvent.change(getByLabelText('To'), { target: { value: '40' } });
        });
        expect(container).toMatchSnapshot();
        expect(mockProps.onChange).toHaveBeenCalledWith({ range1: { order: 0, from: 50 } });
        expect(mockProps.onChange).not.toHaveBeenCalledWith({ range1: { order: 0, from: 50, to: 40 } });
    });

    it('should show two errors if range definition for options variant is required and values are not provided', () => {
        const rangeDefinitions = {
            range1: {
                label: 'Range 1',
                order: 1,
                required: true,
                rangeOptions: [
                    { value: 10000, label: '10K', order: 0 },
                    { value: 20000, label: '20K', order: 1 },
                ],
            },
        };
        const initialState = { range1: { order: 0 } };
        const { getAllByText } = render(
            <Ranges {...mockProps} rangeDefinitions={rangeDefinitions} initialState={initialState} />,
        );
        expect(getAllByText('Field is required')).toHaveLength(2);
    });

    it('should show two errors if range definition for numeric variant is required and values are not provided', () => {
        const rangeDefinitions = {
            range1: { label: 'Range 1', order: 1, required: true },
        };
        const initialState = { range1: { order: 0 } };
        const { getAllByText } = render(
            <Ranges {...mockProps} rangeDefinitions={rangeDefinitions} initialState={initialState} />,
        );
        expect(getAllByText('Field is required')).toHaveLength(2);
    });

    it('should show one error if range definition is required and only one value is provided', () => {
        const rangeDefinitions = {
            range1: {
                label: 'Range 1',
                order: 1,
                required: true,
                rangeOptions: [
                    { value: 10000, label: '10K', order: 0 },
                    { value: 20000, label: '20K', order: 1 },
                ],
            },
        };
        const initialState = { range1: { order: 0, from: 10000 } };
        const { getAllByText } = render(
            <Ranges {...mockProps} rangeDefinitions={rangeDefinitions} initialState={initialState} />,
        );
        expect(getAllByText('Field is required')).toHaveLength(1);
    });

    it('should call getRanges method from apiRef with current state', () => {
        const mockFunction = vi.fn();

        const TestComponent = () => {
            const apiRef = useRef<RangesApiRef>(null);

            return (
                <>
                    <Ranges {...mockProps} apiRef={apiRef} />
                    <button onClick={() => mockFunction(apiRef.current?.getRanges())}>Get Ranges</button>
                </>
            );
        };

        const { getByText } = render(<TestComponent />);
        act(() => {
            fireEvent.click(getByText('Get Ranges'));
        });
        expect(mockFunction).toHaveBeenCalledWith({ range1: { order: 0 } });
    });

    it('should call setRanges method from apiRef', () => {
        const newRange = { range2: { order: 0, from: 10000 } };

        const TestComponent = () => {
            const apiRef = useRef<RangesApiRef>(null);

            return (
                <>
                    <Ranges {...mockProps} apiRef={apiRef} />
                    <button onClick={() => apiRef.current?.setRanges(newRange)}>Set Ranges</button>
                </>
            );
        };

        const { getByText } = render(<TestComponent />);
        act(() => {
            fireEvent.click(getByText('Set Ranges'));
        });
        expect(mockProps.onChange).not.toHaveBeenCalled();
        expect(getByText('10K')).toBeDefined();
    });

    it('should call resetRanges method from apiRef', () => {
        const mockFunction = vi.fn();

        const TestComponent = () => {
            const apiRef = useRef<RangesApiRef>(null);

            return (
                <>
                    <Ranges {...mockProps} apiRef={apiRef} />
                    <button onClick={() => apiRef.current?.resetRanges()}>Reset Ranges</button>
                    <button onClick={() => mockFunction(apiRef.current?.getRanges())}>Get Ranges</button>
                </>
            );
        };

        const { getByText, getByLabelText } = render(<TestComponent />);
        act(() => {
            fireEvent.change(getByLabelText('From'), { target: { value: '50' } });
            fireEvent.click(getByText('Reset Ranges'));
        });
        act(() => {
            fireEvent.click(getByText('Get Ranges'));
        });
        expect(mockProps.onChange).toHaveBeenCalledWith({ range1: { order: 0, from: 50 } });
        expect(mockFunction).toHaveBeenCalledWith({ range1: { order: 0 } });
    });
});
