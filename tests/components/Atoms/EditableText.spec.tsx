import { vi, describe, it, expect } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import EditableText from '../../../src/components/Atoms/EditableText/EditableText.js';

const createMockedOnSubmit = () => vi.fn();

/* eslint-disable require-await */
describe('EditableText', () => {
    it('should render correctly', () => {
        const mockProps = {
            text: 'Test Text',
            onSubmit: createMockedOnSubmit(),
            label: 'Test Label',
        };

        const { container } = render(<EditableText {...mockProps} />);
        expect(container).toMatchSnapshot();
    });

    it('should switch to edit mode on click on the icon', () => {
        const mockProps = {
            text: 'Test Text',
            onSubmit: createMockedOnSubmit(),
            label: 'Test Label',
        };

        const { getByRole } = render(<EditableText {...mockProps} />);
        fireEvent.click(getByRole('button'));
        expect(getByRole('textbox')).toBeDefined();
    });

    it('should call onSubmit when Enter key is pressed', async () => {
        const mockProps = {
            text: 'Test Text',
            onSubmit: createMockedOnSubmit().mockResolvedValue(true),
            label: 'Test Label',
        };

        const { getByRole, getByLabelText } = render(<EditableText {...mockProps} />);
        await act(async () => {
            fireEvent.click(getByRole('button'));
        });
        await act(async () => {
            fireEvent.change(getByLabelText('Test Label'), { target: { value: 'New Text' } });
            fireEvent.keyDown(getByLabelText('Test Label'), { key: 'Enter', code: 'Enter' });
        });
        expect(mockProps.onSubmit).toHaveBeenCalledWith('New Text');
    });

    it('should not call onSubmit when Enter key is pressed and text is the same', async () => {
        const mockProps = {
            text: 'Test Text',
            onSubmit: createMockedOnSubmit().mockResolvedValue(true),
            label: 'Test Label',
        };

        const { getByRole, getByLabelText } = render(<EditableText {...mockProps} />);
        await act(async () => {
            fireEvent.click(getByRole('button'));
        });
        await act(async () => {
            fireEvent.change(getByLabelText('Test Label'), { target: { value: 'Test Text' } });
            fireEvent.keyDown(getByLabelText('Test Label'), { key: 'Enter', code: 'Enter' });
        });
        expect(mockProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should not call onSubmit when Escape key is pressed', async () => {
        const mockProps = {
            text: 'Test Text',
            onSubmit: createMockedOnSubmit().mockResolvedValue(true),
            label: 'Test Label',
        };

        const { getByRole, getByLabelText } = render(<EditableText {...mockProps} />);
        await act(async () => {
            fireEvent.click(getByRole('button'));
        });
        await act(async () => {
            fireEvent.change(getByLabelText('Test Label'), { target: { value: 'New Text' } });
            fireEvent.keyDown(getByLabelText('Test Label'), { key: 'Escape', code: 'Escape' });
        });
        expect(mockProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should discard new value when Escape is pressed', async () => {
        const mockProps = {
            text: 'Test Text',
            onSubmit: createMockedOnSubmit().mockResolvedValue(true),
            label: 'Test Label',
        };

        const { getByRole, getByLabelText, getByText, queryByText } = render(<EditableText {...mockProps} />);
        await act(async () => {
            fireEvent.click(getByRole('button'));
        });
        await act(async () => {
            fireEvent.change(getByLabelText('Test Label'), { target: { value: 'New Text' } });
            fireEvent.keyDown(getByLabelText('Test Label'), { key: 'Escape', code: 'Escape' });
        });
        expect(getByText('Test Text')).toBeDefined();
        expect(queryByText('New Text')).toBeNull();
    });

    it('should console error when onSubmit rejects', async () => {
        const mockProps = {
            text: 'Test Text',
            onSubmit: createMockedOnSubmit().mockRejectedValue(new Error('Error while submitting')),
            label: 'Test Label',
        };

        const { getByRole, getByLabelText } = render(<EditableText {...mockProps} />);
        const originalConsoleError = global.console.error;
        global.console.error = vi.fn();

        try {
            await act(async () => {
                fireEvent.click(getByRole('button'));
            });
            await act(async () => {
                fireEvent.change(getByLabelText('Test Label'), { target: { value: 'New Text' } });
                fireEvent.keyDown(getByLabelText('Test Label'), { key: 'Enter', code: 'Enter' });
            });
            expect(global.console.error).toHaveBeenCalledWith(new Error('Error while submitting'));
        } finally {
            global.console.error = originalConsoleError;
        }
    });

    describe('slotProps', () => {
        it('should forward slotProps.typography props to the Typography element in display mode', () => {
            const mockProps = {
                text: 'Test Text',
                onSubmit: createMockedOnSubmit(),
                slotProps: {
                    typography: {
                        'aria-label': 'custom-typography-label',
                    },
                },
            };

            const { getByTestId } = render(<EditableText {...mockProps} />);
            expect(getByTestId('ring-editabletext-text').getAttribute('aria-label')).toBe('custom-typography-label');
        });

        it('should not override internally managed children via slotProps.typography', () => {
            const mockProps = {
                text: 'Test Text',
                onSubmit: createMockedOnSubmit(),
                slotProps: {
                    typography: {},
                },
            };

            const { getByTestId } = render(<EditableText {...mockProps} />);
            expect(getByTestId('ring-editabletext-text').textContent).toBe('Test Text');
        });

        it('should forward slotProps.textField props to the TextField element in edit mode', async () => {
            const mockProps = {
                text: 'Test Text',
                onSubmit: createMockedOnSubmit(),
                slotProps: {
                    textField: {
                        placeholder: 'Custom placeholder',
                    },
                },
            };

            const { getByRole, getByPlaceholderText } = render(<EditableText {...mockProps} />);
            await act(async () => {
                fireEvent.click(getByRole('button'));
            });
            expect(getByPlaceholderText('Custom placeholder')).toBeDefined();
        });

        it('should merge slotProps.textField.slotProps.htmlInput with the internal data-testid', async () => {
            const mockProps = {
                text: 'Test Text',
                onSubmit: createMockedOnSubmit(),
                slotProps: {
                    textField: {
                        slotProps: {
                            htmlInput: {
                                'aria-label': 'custom-input-label',
                            },
                        },
                    },
                },
            };

            const { getByRole, getByTestId } = render(<EditableText {...mockProps} />);
            await act(async () => {
                fireEvent.click(getByRole('button'));
            });
            const input = getByTestId('ring-editabletext-input');
            expect(input.getAttribute('data-testid')).toBe('ring-editabletext-input');
            expect(input.getAttribute('aria-label')).toBe('custom-input-label');
        });

        it('should not override internally managed value and onChange via slotProps.textField', async () => {
            const mockProps = {
                text: 'Initial Text',
                onSubmit: createMockedOnSubmit().mockResolvedValue(true),
                label: 'Test Label',
                slotProps: {
                    textField: {},
                },
            };

            const { getByRole, getByLabelText } = render(<EditableText {...mockProps} />);
            await act(async () => {
                fireEvent.click(getByRole('button'));
            });
            const input = getByLabelText('Test Label') as HTMLInputElement;
            expect(input.value).toBe('Initial Text');
            await act(async () => {
                fireEvent.change(input, { target: { value: 'Updated Text' } });
            });
            expect(input.value).toBe('Updated Text');
        });
    });
});
