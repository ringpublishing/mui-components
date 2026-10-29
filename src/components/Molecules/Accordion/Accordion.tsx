import {
    Accordion as MuiAccordion,
    AccordionDetails,
    AccordionProps as MuiAccordionProps,
    AccordionSummary,
    Stack,
    Typography,
    Button,
    SxProps,
    Theme,
} from '@mui/material';
import classNames from 'classnames';
import React from 'react';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

// Width of the expand chevron box the theme gives `AccordionSummary`.
const CHEVRON_ICON_PX = 20;
const ACTION_CLASS = 'ring-mui-accordion-action';

// The grid lives here, not in a story: `label` takes arbitrary nodes, but the design
// system still owns the column geometry.
const summaryContentSx: SxProps<Theme> = (theme) => ({
    display: 'grid',
    // The chevron sits outside `.MuiAccordionSummary-content`, so thirds of the content box
    // would be too narrow — each column gains a third of the icon width to match the design.
    // Its wrapper adds no padding, so the icon's own width is the whole difference.
    gridTemplateColumns: `repeat(2, calc((100% + ${theme.typography.pxToRem(CHEVRON_ICON_PX)}) / 3)) minmax(0, 1fr)`,
    alignItems: 'center',
    // Let long text truncate instead of forcing the track wider.
    '& > *': {
        minWidth: 0,
    },
    // A lone label spans the full width — narrow sidebars must not squeeze it into a third.
    '& > :only-child': {
        gridColumn: '1 / -1',
    },
    // The optional action button sits in the last column, flush with the chevron. Matched by
    // its own class rather than `.MuiButton-root`, so a Button composed into `label` keeps
    // the column it was written in.
    [`& > .${ACTION_CLASS}`]: {
        gridColumn: 3,
        justifySelf: 'end',
    },
});

export interface AccordionProps extends CommonComponentProps, Omit<MuiAccordionProps, 'sx' | 'children'> {
    /**
     * Header content. A plain string is rendered as a `body1` label; pass nodes to compose
     * extra columns, the way MUI's own `AccordionSummary` takes arbitrary children.
     * @default Test
     */
    label?: React.ReactNode;
    /**
     * Button label
     */
    buttonLabel?: string;
    /**
     * Button onClick event handler
     */
    buttonOnClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function Accordion(props: AccordionProps): React.JSX.Element {
    const {
        label = 'Test',
        children,
        className,
        buttonLabel,
        buttonOnClick,
        dataTestIdSuffix,
        disabled,
        ...otherProps
    } = props;

    // There is no ideal place to put the test id, as we do not have access to the inner button of MuiAccordion.
    const dataTestId = useRingDataTestId('Accordion', dataTestIdSuffix);

    // The action is inert inside a disabled button, so it is dropped rather than rendered.
    const showAction = Boolean(buttonLabel) && !disabled;

    const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        buttonOnClick?.(event);
    };

    return (
        <MuiAccordion
            // Cannot be `ring-accordion` as it clashes with the `ring-accordion` class from the `ring-styles` library
            className={classNames('ring-mui-accordion', className)}
            variant="borderless"
            data-testid={dataTestId}
            disabled={disabled}
            {...otherProps}
        >
            <AccordionSummary
                data-testid={`${dataTestId}-expand`}
                // The summary is a real `<button>`, so an action inside it would nest buttons.
                // A div keeps `ButtonBase` semantics; the native button stays elsewhere because
                // `ButtonBase` only gets `aria-disabled` and would still toggle.
                {...(showAction ? { component: 'div' as const } : {})}
                slotProps={{ content: { sx: summaryContentSx } }}
            >
                {/* `component="span"`: `body1` maps to <p>, invalid inside the summary button. */}
                {typeof label === 'string' || typeof label === 'number' ? (
                    <Typography variant="body1" component="span">
                        {label}
                    </Typography>
                ) : (
                    label
                )}
                {showAction && (
                    <Button
                        className={ACTION_CLASS}
                        data-testid={`${dataTestId}-button`}
                        variant="outlined"
                        color="primary"
                        size="medium"
                        onClick={onClick}
                    >
                        {buttonLabel}
                    </Button>
                )}
            </AccordionSummary>
            {/* Padding is left to the theme: `sx` outranks `styleOverrides`, so an inline
                value could not be scoped away by a consumer. */}
            <AccordionDetails>
                <Stack spacing={2}>{children}</Stack>
            </AccordionDetails>
        </MuiAccordion>
    );
}
