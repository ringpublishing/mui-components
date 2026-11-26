import { vi, describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/react';
import dayjs, { Dayjs } from 'dayjs';
import { render } from '../../../test-utils/customRenderer.js';
import { TimePicker, TimePickerProps } from '../../../../src/components/Molecules/Dates/TimePicker/TimePicker.js';

vi.useFakeTimers();

describe('Components: TimePicker', () => {
    dayjs.locale('en');
    it('should render correctly', () => {
        const mockProps: TimePickerProps = {};

        expect(render(<TimePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with custom labels', () => {
        const mockProps: TimePickerProps = {
            label: 'Custom Date',
        };

        expect(render(<TimePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should render correctly with default value', () => {
        const mockProps: TimePickerProps = {
            defaultValue: dayjs('2022-01-01T12:00:00'),
        };

        expect(render(<TimePicker {...mockProps} />).container).toMatchSnapshot();
    });

    it('should trigger onAccept with the selected time', () => {
        const onAcceptMock = vi.fn();
        const mockProps: TimePickerProps = {
            onAccept: onAcceptMock,
        };

        const { getByLabelText, getByText } = render(<TimePicker {...mockProps} />);
        const clockIcon = getByLabelText('Choose time');
        fireEvent.click(clockIcon);
        const fullHour = getByText('00');
        fireEvent.click(fullHour);
        const okButton = getByText('OK');
        fireEvent.click(okButton);

        expect(onAcceptMock).toHaveBeenCalledTimes(1);
    });

    it('should correctly handle being controlled', () => {
        const value: Dayjs | null = dayjs('2018-04-13 19:08');
        const timeValue = value.format('hh:mm A');
        const mockProps: TimePickerProps = {
            value,
        };

        const { container } = render(<TimePicker {...mockProps} />);
        const input = container.querySelector('input') as HTMLInputElement;
        const inputValue = input.value;
        expect(inputValue).toEqual(timeValue);
    });

    it('should grow with a full-width field', () => {
        const { container } = render(<TimePicker slotProps={{ textField: { fullWidth: true } }} />);
        const wrapper = container.querySelector<HTMLElement>('.ring-time-picker');

        expect(wrapper?.style.display).toBe('flex');
        expect(wrapper?.classList.contains('ring-picker-full-width')).toBe(true);
        // Not inline: a width the consumer gives the wrapper through `className` has to win.
        expect(wrapper?.style.width).toBe('');
        expect(
            Array.from(document.querySelectorAll('style')).some((style) =>
                style.textContent?.includes(':where(.ring-picker-full-width){width:100%;}'),
            ),
        ).toBe(true);
    });

    it('should keep the width of its field by default', () => {
        const { container } = render(<TimePicker />);
        const wrapper = container.querySelector<HTMLElement>('.ring-time-picker');

        expect(wrapper?.style.display).toBe('inline-flex');
        expect(wrapper?.style.width).toBe('');
        expect(wrapper?.classList.contains('ring-picker-full-width')).toBe(false);
    });
});
