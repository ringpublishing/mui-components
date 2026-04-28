import { vi, describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';
import dayjs, { Dayjs } from 'dayjs';
import {
    DateTimePicker,
    DateTimePickerProps,
} from '../../../../src/components/Atoms/Dates/DateTimePicker/DateTimePicker.js';
import { render } from '../../../test-utils/customRenderer.js';

vi.useFakeTimers();

describe('Components: DateTimePicker', () => {
    dayjs.locale('en');
    it('should render correctly', () => {
        const mockProps: DateTimePickerProps = {};

        expect(render(<DateTimePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with custom labels', () => {
        const mockProps: DateTimePickerProps = {
            label: 'Custom Date time',
        };

        expect(render(<DateTimePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with default value', () => {
        const mockProps: DateTimePickerProps = {
            defaultValue: dayjs('2022-01-01T12:00:00'),
        };

        expect(render(<DateTimePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should trigger onAccept with the selected date time', () => {
        const onAcceptMock = vi.fn();
        const mockProps: DateTimePickerProps = {
            onAccept: onAcceptMock,
        };

        const { getByLabelText, getByText } = render(<DateTimePicker {...mockProps} />);
        const calendarIcon = getByLabelText('Choose date');
        fireEvent.click(calendarIcon);
        const firstDayOfMonth = getByText('1');
        fireEvent.click(firstDayOfMonth);
        const okButton = getByText('OK');
        fireEvent.click(okButton);

        const date = dayjs().startOf('month').toISOString();
        // @ts-expect-error - Ignore possibly undefined
        expect(onAcceptMock.mock.lastCall[0].toISOString()).toEqual(date);
    });

    it('should render correctly with empty actions', () => {
        const mockProps: DateTimePickerProps = {
            actions: [],
        };

        expect(render(<DateTimePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with custom actions', () => {
        const mockProps: DateTimePickerProps = {
            actions: [
                {
                    label: 'Action 1',
                    onClick: vi.fn(),
                },
                {
                    label: 'Action 2',
                    onClick: vi.fn(),
                },
            ],
        };

        expect(render(<DateTimePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should correctly handle being controlled', () => {
        const value: Dayjs | null = dayjs('2024-07-16');
        const mockProps: DateTimePickerProps = {
            value,
        };

        const { container } = render(<DateTimePicker {...mockProps} />);
        const input = container.querySelector('input') as HTMLInputElement;
        const inputValue = dayjs(input.value);
        expect(inputValue).toEqual(value);
    });
});
