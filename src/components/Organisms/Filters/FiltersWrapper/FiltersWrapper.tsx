import React from 'react';
import { Button, ButtonOwnProps, Typography, useTheme, Box } from '@mui/material';
import { ScopedThemeOverrides } from '@ringpublishing/mui-theme';
import classNames from 'classnames';
import { CommonComponentProps } from '../../../../helpers/commonTypes.js';
import { filtersWrapperComponents, SizeEnum, VariantEnum } from './filtersWrapperTheme.js';
import { useRingDataTestId } from '../../../../helpers/hooks/useRingDataTestId.js';

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
     * @default 'outlined'
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
        variant = VariantEnum.OUTLINE,
        sx,
        className,
        buttonStyle = { size: 'small', variant: 'contained' },
        dataTestIdSuffix,
    } = props;

    const dataTestId = useRingDataTestId('FiltersWrapper', dataTestIdSuffix);
    const theme = useTheme();

    return (
        <ScopedThemeOverrides components={filtersWrapperComponents(size, variant, buttonStyle)}>
            <Box
                sx={{
                    maxHeight: '100%',
                    overflow: 'auto',
                    padding: theme.spacing(2),
                    ...sx,
                }}
                className={classNames('ring-filters-wrapper', className)}
                data-testid={dataTestId}
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
                            <Typography variant="subtitle1" sx={{ p: theme.spacing(1, 0, 1, 0) }}>
                                {label}
                            </Typography>
                        )}
                        {withClearButton && onClear && (
                            <Button
                                onClick={onClear}
                                variant="text"
                                size="medium"
                                data-testid={`${dataTestId}-clear`}
                            >
                                {clearButtonLabel}
                            </Button>
                        )}
                    </Box>
                )}
                {children}
            </Box>
        </ScopedThemeOverrides>
    );
}
