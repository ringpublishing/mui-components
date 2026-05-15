import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, ButtonProps, Button, Stack } from '@mui/material';
import { CommonComponentProps, CommonLanguages } from '../../../helpers/commonTypes.js';
import errorSVG from './images/Error.svg';
import notFoundSVG from './images/Not_found.svg';
import emptySVG from './images/Empty.svg';
import { defaultLabels } from './defaultLabels.js';
import emptyBoxSVG from './images/EmptyBox.svg';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';

export interface PlaceholderLabels {
    header?: string;
    description?: string;
    footer?: string;
}

/**
 * Labels for the error and empty placeholders rendered internally by a parent component
 * (e.g. a grid or list), plus the retry button text the parent owns. When omitted, each
 * inner `Placeholder` falls back to its default localized labels.
 */
export interface PlaceholderStateLabels {
    /** Labels for the error state placeholder (rendered when the parent is in an error state). */
    error?: PlaceholderLabels;
    /** Labels for the empty state placeholder (rendered when the parent has nothing to show). */
    empty?: PlaceholderLabels;
    /** Text for the "Try again" button rendered in the error placeholder when a retry handler is wired up. */
    tryAgainButton?: string;
}

export interface PlaceholderProps extends CommonComponentProps {
    /**
     * Labels object. If not provided, default labels are used based on the current `variant` and `theme.locale`.
     * Default values for enUS.
     * @default {
     *      'error' : {
     *         header: 'An error occurred'
     *     },
     *     'error_list' : {
     *         header: 'Failed to load the list',
     *         description: 'Refresh the page and try again. If the problem persists, please contact our technical support.'
     *     },
     *     'not_found' : {
     *         header: 'No results',
     *         description: 'Check your spelling, type the phrase differently, or change the filters.'
     *     },
     *     'empty': {
     *         description: 'Select an item to view its details'
     *     },
     *     'empty_box': {
     *         description: 'No items to display.'
     *     }
     * }
     */
    labels?: PlaceholderLabels;
    /**
     * Variant of placeholder
     * @default error
     */
    variant?: PlaceholderVariant;
    /**
     * Language of placeholder
     * @default enUS
     */
    language?: CommonLanguages;
    /**
     * Buttons visible in placeholder
     */
    buttons?: ButtonProps[];
    /**
     * Custom icon as img tag
     */
    img?: React.JSX.Element;
}

export enum PlaceholderVariant {
    ERROR = 'error',
    ERROR_LIST = 'error_list',
    NOT_FOUND = 'not_found',
    EMPTY = 'empty',
    EMPTY_BOX = 'empty_box',
}

export function Placeholder(props: PlaceholderProps): React.JSX.Element {
    const theme = useTheme();
    const {
        labels,
        variant = PlaceholderVariant.ERROR,
        language = theme.locale || CommonLanguages.enUS,
        buttons = [],
        dataTestIdSuffix,
    } = props;
    const dataTestId = useRingDataTestId(`${Placeholder.name}-${variant}`, dataTestIdSuffix);

    const getSVGIcon = (variant: PlaceholderVariant): React.JSX.Element => {
        if (props?.img) {
            return props.img;
        }

        switch (variant) {
            case PlaceholderVariant.ERROR:
                return <img src={errorSVG} alt="Error" />;
            case PlaceholderVariant.NOT_FOUND:
                return <img src={notFoundSVG} alt="Not found" />;
            case PlaceholderVariant.EMPTY:
                return <img src={emptySVG} alt="Empty" />;
            case PlaceholderVariant.EMPTY_BOX:
                return <img src={emptyBoxSVG} alt="Empty box" />;
            default:
                return <img src={errorSVG} alt="Error" />;
        }
    };

    const getLabels = (): PlaceholderLabels => {
        if (labels) {
            return labels;
        }

        return (defaultLabels[variant][language] ?? defaultLabels[variant].enUS) as PlaceholderLabels;
    };

    const getButtons = (dataTestId: string): React.JSX.Element => {
        if (buttons.length) {
            return (
                <Stack spacing={2} direction="row" sx={{ mb: 2, justifyContent: 'center' }}>
                    {buttons.map((button: ButtonProps, index: number) => {
                        return (
                            <Button
                                {...button}
                                key={`${button?.children}-${index}`}
                                data-testid={`${dataTestId}-button-${index}`}
                            />
                        );
                    })}
                </Stack>
            );
        }

        return <></>;
    };

    const [labelsToShow, setLabelsToShow] = useState<PlaceholderLabels>(getLabels());

    useEffect(() => {
        setLabelsToShow(getLabels());
    }, [labels, theme.locale, variant, language]);

    return (
        <Stack
            data-testid={dataTestId}
            spacing={3}
            sx={{ alignItems: 'center', m: 4, ...props.sx }}
            {...(props?.className ? { className: props.className } : {})}
        >
            <Box sx={{ textAlign: 'center', mb: 1 }}>{getSVGIcon(variant)}</Box>
            <Stack spacing={1} sx={{ justifyContent: 'center', maxWidth: '340px', mb: 2 }}>
                {labelsToShow?.header && (
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                        {labelsToShow.header}
                    </Typography>
                )}
                {labelsToShow?.description && (
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                        {labelsToShow.description}
                    </Typography>
                )}
            </Stack>
            {getButtons(dataTestId)}
            <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
                {labelsToShow?.footer && (
                    <Typography variant="label" sx={{ textAlign: 'center' }}>
                        {labelsToShow.footer}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}
