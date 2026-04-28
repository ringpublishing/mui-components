import React from 'react';
import { Button, ButtonOwnProps, ThemeProvider, Typography, useTheme, Box } from '@mui/material';
import classNames from 'classnames';
import { CommonComponentProps } from '../../../../helpers/commonTypes.js';
import { filtersWrapperThemeCreator, SizeEnum, VariantEnum } from './filtersWrapperTheme.js';

export interface FiltersWrapperProps extends CommonComponentProps {
    /**
     * Callback function called when clear button clicked
     */
    onClear?: () => void;
    /**
     * Label of the component
     */
    label?: string;
    /**
     * Flag indicating whether the clear button should be displayed
     */
    withClearButton?: boolean;
    /**
     * Label for the clear button
     */
    clearButtonLabel?: string;
    /**
     * Variant of elements
     * @default 'standard'
     */
    variant?: VariantEnum;
    /**
     * Size of child elements
     * @default 'small'
     */
    size?: SizeEnum;
    /**
     * All buttons size and variant
     * @default {size: 'small', variant: 'contained'}
     */
    buttonStyle?: Pick<ButtonOwnProps, 'size' | 'variant'>;
}

export function FiltersWrapper(props: FiltersWrapperProps): React.JSX.Element {
    const {
        children,
        label,
        onClear,
        withClearButton,
        clearButtonLabel,
        size = SizeEnum.SMALL,
        variant = VariantEnum.STANDARD,
        sx,
        className,
        buttonStyle = { size: 'small', variant: 'contained' },
    } = props;

    const theme = useTheme();

    return (
        <ThemeProvider theme={filtersWrapperThemeCreator(size, variant, buttonStyle, theme)}>
            <Box
                sx={{
                    maxHeight: '100%',
                    overflow: 'auto',
                    padding: theme.spacing(2),
                    ...sx,
                }}
                className={classNames('ring-filters-wrapper', className)}
            >
                {(label || (withClearButton && clearButtonLabel)) && (
                    <Box
                        sx={{
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            display: 'flex',
                        }}
                    >
                        {label && (
                            <Typography variant="headline1" sx={{ p: theme.spacing(1, 0, 1, 0) }}>
                                {label}
                            </Typography>
                        )}
                        {withClearButton && onClear && (
                            <Button onClick={onClear} variant="text" size="medium">
                                {clearButtonLabel}
                            </Button>
                        )}
                    </Box>
                )}
                {children}
            </Box>
        </ThemeProvider>
    );
}
