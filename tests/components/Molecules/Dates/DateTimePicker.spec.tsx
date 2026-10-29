import { vi, describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';
import dayjs, { Dayjs } from 'dayjs';
import {
    DateTimePicker,
    DateTimePickerProps,
} from '../../../../src/components/Molecules/Dates/DateTimePicker/DateTimePicker.js';
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

    it('names the actions menu button "More actions" by default', () => {
        const { getByRole } = render(<DateTimePicker actions={[{ label: 'Action 1' }]} />);

        expect(getByRole('button', { name: 'More actions' })).toBeTruthy();
    });

    it('takes the actions menu button name from actionsAriaLabel', () => {
        const { getByRole } = render(
            <DateTimePicker actions={[{ label: 'Action 1' }]} actionsAriaLabel="Date options" />,
        );

        expect(getByRole('button', { name: 'Date options' })).toBeTruthy();
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

    describe('clear button next to the actions menu', () => {
        const value = dayjs('2022-01-01T12:00:00');
        const actions = [{ label: 'Action 1' }];
        const inputValue = (container: HTMLElement): string =>
            (container.querySelector('input') as HTMLInputElement).value;

        // Enter and Space on a native button dispatch this same click, on the button — never on the icon inside.
        it('clears the value when the button itself is clicked', () => {
            const { container, getByRole } = render(<DateTimePicker defaultValue={value} actions={actions} />);

            expect(inputValue(container)).not.toBe('');
            fireEvent.click(getByRole('button', { name: 'Clear' }));
            expect(inputValue(container)).toBe('');
        });

        it('renders neither the clear button nor the actions menu for an empty actions array', () => {
            const { queryByTestId } = render(<DateTimePicker actions={[]} />);

            expect(queryByTestId('ring-datetimepicker-clear')).toBeNull();
            expect(queryByTestId('ring-datetimepicker-actions')).toBeNull();
        });
    });
});
