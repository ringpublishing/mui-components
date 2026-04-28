import { vi, describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/react';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker, DatePickerProps } from '../../../../src/index.js';
import { render } from '../../../test-utils/customRenderer.js';

vi.useFakeTimers();

describe('Components: DatePicker', () => {
    dayjs.locale('en');
    it('should render correctly', () => {
        const mockProps: DatePickerProps = {};

        expect(render(<DatePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with custom labels', () => {
        const mockProps: DatePickerProps = {
            label: 'Custom Date',
            currentDateLabel: 'Current',
        };

        expect(render(<DatePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with default value', () => {
        const mockProps: DatePickerProps = {
            defaultValue: dayjs('2022-01-01T12:00:00'),
        };

        expect(render(<DatePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should trigger onAccept with the selected date', () => {
        const onAcceptMock = vi.fn();
        const mockProps: DatePickerProps = {
            onAccept: onAcceptMock,
        };

        const { getByLabelText, getByText } = render(<DatePicker {...mockProps} />);
        const calendarIcon = getByLabelText('Choose date');
        fireEvent.click(calendarIcon);
        const firstDayOfMonth = getByText('1');
        fireEvent.click(firstDayOfMonth);

        const date = dayjs().startOf('month').toISOString();
        // @ts-expect-error - Ignore possibly undefined
        expect(onAcceptMock.mock.lastCall[0].toISOString()).toEqual(date);
    });

    it('should render correctly with empty actions', () => {
        const mockProps: DatePickerProps = {
            actions: [],
        };

        expect(render(<DatePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with Now button', () => {
        const mockProps: DatePickerProps = {
            currentDateLabel: 'Now',
        };

        expect(render(<DatePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with custom actions', () => {
        const mockProps: DatePickerProps = {
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

        expect(render(<DatePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with custom actions and Now button', () => {
        const mockProps: DatePickerProps = {
            currentDateLabel: 'Now',
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

        expect(render(<DatePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should correctly handle being controlled', () => {
        const value: Dayjs | null = dayjs('2024-07-16');
        const mockProps: DatePickerProps = {
            value,
        };

        const { container } = render(<DatePicker {...mockProps} />);
        const input = container.querySelector('input') as HTMLInputElement;
        const inputValue = dayjs(input.value);
        expect(inputValue).toEqual(value);
    });

    it('should properly handle using the Now button', () => {
        const testDate = '2023-11-22';
        const now = dayjs(testDate);
        vi.setSystemTime(now.toDate());

        const mockProps: DatePickerProps = {
            currentDateLabel: 'Now',
        };

        const { getByText, getByLabelText, container } = render(<DatePicker {...mockProps} />);
        const calendarIcon = getByLabelText('Choose date');
        fireEvent.click(calendarIcon);
        const nowButton = getByText('Now');
        fireEvent.click(nowButton);
        const input = container.querySelector('input') as HTMLInputElement;
        const inputValue = dayjs(input.value);
        expect(inputValue).toEqual(now);
    });
});
