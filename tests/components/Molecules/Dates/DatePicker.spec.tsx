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

    it('names the actions menu button "More actions" by default', () => {
        const { getByRole } = render(<DatePicker actions={[{ label: 'Action 1' }]} />);

        expect(getByRole('button', { name: 'More actions' })).toBeTruthy();
    });

    it('takes the actions menu button name from actionsAriaLabel', () => {
        const { getByRole } = render(<DatePicker actions={[{ label: 'Action 1' }]} actionsAriaLabel="Date options" />);

        expect(getByRole('button', { name: 'Date options' })).toBeTruthy();
    });

    describe('clear button next to the actions menu', () => {
        const value = dayjs('2022-01-01T12:00:00');
        const actions = [{ label: 'Action 1' }];
        const inputValue = (container: HTMLElement): string =>
            (container.querySelector('input') as HTMLInputElement).value;

        // Enter and Space on a native button dispatch this same click, on the button — never on the icon inside.
        it('clears the value when the button itself is clicked', () => {
            const { container, getByRole } = render(<DatePicker defaultValue={value} actions={actions} />);

            expect(inputValue(container)).not.toBe('');
            fireEvent.click(getByRole('button', { name: 'Clear' }));
            expect(inputValue(container)).toBe('');
        });

        it('is disabled on a read-only picker and keeps the value', () => {
            const { container, getByRole } = render(
                <DatePicker defaultValue={value} actions={actions} readOnly={true} />,
            );
            const clear = getByRole('button', { name: 'Clear' }) as HTMLButtonElement;

            expect(clear.disabled).toBe(true);
            fireEvent.click(clear);
            expect(inputValue(container)).not.toBe('');
        });

        it('takes its name from the picker translations', () => {
            const { getByRole } = render(<DatePicker actions={actions} localeText={{ fieldClearLabel: 'Wyczyść' }} />);

            expect(getByRole('button', { name: 'Wyczyść' })).toBeTruthy();
        });

        it('renders neither the clear button nor the actions menu for an empty actions array', () => {
            const { queryByTestId } = render(<DatePicker actions={[]} />);

            expect(queryByTestId('ring-datepicker-clear')).toBeNull();
            expect(queryByTestId('ring-datepicker-actions')).toBeNull();
        });
    });
});
