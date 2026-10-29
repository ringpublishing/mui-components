import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import React, { ChangeEvent } from 'react';
import { fireEvent, render } from '@testing-library/react';
import {
    Accordion as MuiAccordion,
    AccordionDetails,
    AccordionSummary,
    createTheme,
    TextField,
    ThemeOptions,
    ThemeProvider,
} from '@mui/material';
import { Accordion, FiltersWrapper } from '../../../../src/index.js';
import { ThemeConfig } from '../../../../src/theme/theme.js';

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

    describe('Accordion summary spacing', () => {
        const AccordionFilters = (): React.JSX.Element => (
            <FiltersWrapper label="Filters">
                <Accordion label="Ring section" defaultExpanded={true}>
                    <div>Ring content</div>
                </Accordion>
                <MuiAccordion>
                    <AccordionSummary>MUI section</AccordionSummary>
                    <AccordionDetails>MUI content</AccordionDetails>
                </MuiAccordion>
            </FiltersWrapper>
        );

        const summaryStyle = (summary: HTMLElement): { minHeight: string; contentMargin: string } => ({
            minHeight: getComputedStyle(summary).minHeight,
            contentMargin: getComputedStyle(summary.querySelector('.MuiAccordionSummary-content') as Element).margin,
        });

        it('Should render a Ring and a MUI Accordion with no theme provider above it', () => {
            const { getByRole, getByText } = render(<AccordionFilters />);

            expect(getByText('Ring content')).toBeDefined();
            expect(summaryStyle(getByRole('button', { name: 'Ring section' }))).toEqual({
                minHeight: '32px',
                contentMargin: '8px 0px',
            });
            expect(summaryStyle(getByRole('button', { name: 'MUI section' }))).toEqual({
                minHeight: '32px',
                contentMargin: '8px 0px',
            });
        });

        it('Should follow the spacing of a plain MUI theme', () => {
            // The Ring augmentation makes `colors` required; an app without it passes only MUI options.
            const plainThemeOptions = { spacing: 4 } as ThemeOptions;
            const { getByRole } = render(
                <ThemeProvider theme={createTheme(plainThemeOptions)}>
                    <AccordionFilters />
                </ThemeProvider>,
            );

            expect(summaryStyle(getByRole('button', { name: 'Ring section' }))).toEqual({
                minHeight: '16px',
                contentMargin: '4px 0px',
            });
        });

        it('Should keep the Ring spacing scale under a Ring theme with a custom spacing', () => {
            const { getByRole } = render(
                <ThemeConfig mode="light" themeOverrides={{ spacing: 4 }}>
                    <AccordionFilters />
                </ThemeConfig>,
            );

            expect(summaryStyle(getByRole('button', { name: 'Ring section' }))).toEqual({
                minHeight: '32px',
                contentMargin: '8px 0px',
            });
        });
    });
});
