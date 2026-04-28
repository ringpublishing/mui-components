import { ExpandMore } from '@mui/icons-material';
import {
    Accordion as MuiAccordion,
    AccordionDetails,
    AccordionProps as MuiAccordionProps,
    AccordionSummary,
    Stack,
    Typography,
    Button,
    Box,
} from '@mui/material';
import classNames from 'classnames';
import React from 'react';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface AccordionProps extends CommonComponentProps, Omit<MuiAccordionProps, 'sx' | 'children'> {
    /**
     * Label of Accordion
     * @default Test
     */
    label?: string;
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
    const { label = 'Test', children, className, buttonLabel, buttonOnClick, dataTestIdSuffix, ...otherProps } = props;

    // There is no ideal place to put the test id, as we do not have access to the inner button of MuiAccordion.
    const dataTestId = useRingDataTestId(Accordion.name, dataTestIdSuffix);

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
            {...otherProps}
        >
            <AccordionSummary expandIcon={<ExpandMore />} data-testid={`${dataTestId}-expand`}>
                <Stack direction={'row'} justifyContent={'space-between'} gap={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="headline2">{label}</Typography>
                    </Box>
                    {buttonLabel && (
                        <Button
                            data-testid={`${dataTestId}-button`}
                            variant="outlined"
                            color="primary"
                            size="medium"
                            onClick={onClick}
                        >
                            {buttonLabel}
                        </Button>
                    )}
                </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0, paddingBottom: 2 }}>
                <Stack spacing={2}>{children}</Stack>
            </AccordionDetails>
        </MuiAccordion>
    );
}
