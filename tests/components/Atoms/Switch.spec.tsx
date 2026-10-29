import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from '../../../src/components/Atoms/Switch/Switch.js';
import { fireEvent, render, screen } from '../../test-utils/customRenderer.js';

// Same widening the component itself needs: `data-*` attributes fail the excess-property
// check on a fresh literal passed as slot props.
const testIdSlot = (dataTestId: string): Record<`data-${string}`, string> => ({ 'data-testid': dataTestId });

describe('Switch Component', () => {
    it('should render correctly', () => {
        const { container } = render(<Switch />);

        expect(container).toMatchSnapshot();
    });

    it('should render root and input test ids', () => {
        render(<Switch />);

        expect(screen.getByTestId('ring-switch')).toBeDefined();
        expect(screen.getByTestId('ring-switch-input')).toBeDefined();
    });

    it('should append the data test id suffix', () => {
        render(<Switch dataTestIdSuffix="Consent" />);

        expect(screen.getByTestId('ring-switch-consent')).toBeDefined();
        expect(screen.getByTestId('ring-switch-consent-input')).toBeDefined();
    });

    it('should merge the ring class with a custom class name', () => {
        render(<Switch className="custom-class" />);

        const root = screen.getByTestId('ring-switch');

        expect(root.classList.contains('ring-switch')).toBe(true);
        expect(root.classList.contains('custom-class')).toBe(true);
    });

    it('should keep the ring test ids when the consumer passes slot props', () => {
        render(<Switch slotProps={{ root: { id: 'root-id' }, input: { 'aria-label': 'Toggle' } }} />);

        const root = screen.getByTestId('ring-switch');
        const input = screen.getByTestId('ring-switch-input');

        expect(root.id).toBe('root-id');
        expect(input.getAttribute('aria-label')).toBe('Toggle');
    });

    it('should keep the ring test ids when the consumer passes slot props in the callback form', () => {
        render(
            <Switch
                slotProps={{
                    root: (): { id: string } => ({ id: 'root-id' }),
                    input: (): { 'aria-label': string } => ({ 'aria-label': 'Toggle' }),
                }}
            />,
        );

        expect(screen.getByTestId('ring-switch').id).toBe('root-id');
        expect(screen.getByTestId('ring-switch-input').getAttribute('aria-label')).toBe('Toggle');
    });

    it('should let the consumer override the ring test id', () => {
        render(<Switch slotProps={{ input: testIdSlot('custom-input') }} />);

        expect(screen.getByTestId('custom-input')).toBeDefined();
    });

    it('should forward slot props the wrapper does not touch', () => {
        render(<Switch slotProps={{ thumb: testIdSlot('thumb') }} />);

        expect(screen.getByTestId('ring-switch')).toBeDefined();
        expect(screen.getByTestId('ring-switch-input')).toBeDefined();
        expect(screen.getByTestId('thumb')).toBeDefined();
    });

    it('should call onChange with the next checked state', () => {
        const onChange = vi.fn();

        render(<Switch onChange={onChange} />);

        fireEvent.click(screen.getByTestId('ring-switch-input'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][1]).toBe(true);
    });

    it('should respect the controlled checked prop', () => {
        render(<Switch checked={true} onChange={vi.fn()} />);

        expect((screen.getByTestId('ring-switch-input') as HTMLInputElement).checked).toBe(true);
    });

    it('should disable the input when disabled', () => {
        render(<Switch disabled={true} />);

        const input = screen.getByTestId('ring-switch-input') as HTMLInputElement;

        expect(input.disabled).toBe(true);
        expect(input.closest('.MuiSwitch-switchBase')?.classList.contains('Mui-disabled')).toBe(true);
    });

    it('should apply the error color class', () => {
        render(<Switch color="error" defaultChecked={true} />);

        const base = screen.getByTestId('ring-switch').querySelector('.MuiSwitch-switchBase');

        expect(base?.classList.contains('MuiSwitch-colorError')).toBe(true);
    });

    it('should apply the small size class', () => {
        render(<Switch size="small" />);

        expect(screen.getByTestId('ring-switch').classList.contains('MuiSwitch-sizeSmall')).toBe(true);
    });

    it('should forward the ref to the switch base element', () => {
        const ref = createRef<HTMLButtonElement>();

        render(<Switch ref={ref} />);

        expect(ref.current).not.toBeNull();
        expect(ref.current).toBe(screen.getByTestId('ring-switch').querySelector('.MuiSwitch-switchBase'));
    });

    // React 18 hands `ref` only to class and forwardRef components; React 19 passes it as a prop
    // either way, so the ref assertion above cannot tell the two apart.
    it('should be a forwardRef component', () => {
        expect(typeof Switch).toBe('object');
        expect((Switch as unknown as { $$typeof: symbol }).$$typeof).toBe(Symbol.for('react.forward_ref'));
        expect(React.isValidElement(<Switch />)).toBe(true);
    });
});
