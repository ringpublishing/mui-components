import type { StyledComponent } from '@emotion/styled';
import type { Theme } from '@mui/material/styles';

/** The `ownerState` every slot of a Ring component takes. */
export interface RingSlotOwnerStateProps<OwnerState> {
    ownerState: OwnerState;
}

// A slot on a MUI component is typed by hand: the declaration build cannot name the MUI type `styled` infers for it.
export type RingSlot<Props, OwnerState> = StyledComponent<Props & RingSlotOwnerStateProps<OwnerState>>;

type RingSlotStyle<OwnerState> = object | ((props: { ownerState: OwnerState; theme: Theme }) => object);

/**
 * Reads the base style of a Ring component's slots from `theme.ringComponents[component]`; what an application sets in
 * `theme.components[component].styleOverrides[slot]` is layered on top by MUI.
 */
export function createRingSlotStyle<ClassKey extends string, OwnerState>(component: keyof Theme['ringComponents']) {
    return (slot: ClassKey) =>
        ({ theme, ownerState }: RingSlotOwnerStateProps<OwnerState> & { theme: Theme }): object => {
            // A theme without the component's styles (a plain MUI theme) leaves the slot unstyled.
            const styles = theme.ringComponents?.[component] as Partial<Record<ClassKey, RingSlotStyle<OwnerState>>>;
            const style = styles?.[slot];

            return (typeof style === 'function' ? style({ theme, ownerState }) : style) ?? {};
        };
}
