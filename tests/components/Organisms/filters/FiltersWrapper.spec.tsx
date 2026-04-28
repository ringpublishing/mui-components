import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import React, { ChangeEvent } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { TextField } from '@mui/material';
import { FiltersWrapper } from '../../../../src/index.js';

const SimpleInput = ({
    name,
    onChange,
}: {
    name: string;
    onChange: (event?: ChangeEvent<HTMLInputElement>) => void;
}): React.ReactElement => {
    return <input name={name} onChange={onChange} />;
};

describe('FiltersWrapper', () => {
    beforeAll(() => {
        vi.spyOn(console, 'error').mockImplementation(vi.fn());
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it('Should render label if provided', () => {
        const { getByText } = render(
            <FiltersWrapper label="Test Label">
                <SimpleInput name="testInput" onChange={vi.fn()} />
            </FiltersWrapper>,
        );

        expect(getByText('Test Label')).toBeDefined();
    });

    it('Should render clear button when withClearButton is true', () => {
        const { getByText } = render(
            <FiltersWrapper withClearButton={true} clearButtonLabel="Clear" onClear={vi.fn()}>
                <SimpleInput name="testInput" onChange={vi.fn()} />
            </FiltersWrapper>,
        );

        expect(getByText('Clear')).toBeDefined();
    });

    it('Should call onChange with the correct values when form values change', () => {
        const handleChange = vi.fn();
        const { getByRole } = render(
            <FiltersWrapper>
                <SimpleInput
                    name="testInput"
                    onChange={(event): void => {
                        if (event?.target?.value) {
                            handleChange(event.target.value);
                        }
                    }}
                />
            </FiltersWrapper>,
        );

        const input = getByRole('textbox');
        fireEvent.change(input, { target: { value: 'newValue' } });

        expect(handleChange).toHaveBeenCalledWith('newValue');
    });

    it('Should reset form when the clear button is clicked', () => {
        const onClear = vi.fn();
        const { getByRole, getByText } = render(
            <FiltersWrapper withClearButton={true} clearButtonLabel="Clear" onClear={onClear}>
                <SimpleInput name="testInput" onChange={vi.fn()} />
            </FiltersWrapper>,
        );

        const input = getByRole('textbox');
        fireEvent.change(input, { target: { value: 'newValue' } });
        fireEvent.click(getByText('Clear'));

        expect(onClear).toHaveBeenCalled();
    });

    it('Should render custom input without name', () => {
        const { getByRole } = render(
            <FiltersWrapper>
                <input onChange={vi.fn()} />
            </FiltersWrapper>,
        );

        expect(getByRole('textbox')).toBeDefined();
    });

    it('Should control a MUI input and call onChange with the correct values when form values change', () => {
        const handleChange = vi.fn();

        const Form = (props: React.PropsWithChildren): React.JSX.Element => {
            return <FiltersWrapper>{props.children}</FiltersWrapper>;
        };

        const Input = (): React.JSX.Element => {
            const name = 'muiTextFieldInput';

            return (
                <fieldset>
                    <legend>MuiTextField using controller hook</legend>
                    <TextField
                        sx={{ marginTop: 1 }}
                        label={name}
                        name={name}
                        onChange={(event): void => {
                            if (event?.target?.value) {
                                handleChange(event.target.value);
                            }
                        }}
                    />
                </fieldset>
            );
        };

        const { getByRole } = render(
            <Form>
                <Input />
            </Form>,
        );
        const input = getByRole('textbox');
        fireEvent.change(input, { target: { value: 'newValue' } });

        expect(handleChange).toHaveBeenCalledWith('newValue');
    });
});
