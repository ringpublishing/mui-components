import React, { useRef, useState } from 'react';
import {
    Card,
    CardContent,
    Box,
    CardMedia,
    Typography,
    Chip,
    ChipProps,
    Tooltip,
    useTheme,
    SxProps,
    IconOwnProps,
} from '@mui/material';
import { MessageSquare, Image, ImageOff } from 'lucide-react';
import {
    useGridRootProps,
    GridRowHeightParams,
    GridValidRowModel,
    useGridApiContext,
    useGridSelector,
    gridDensityFactorSelector,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import { ActionBox } from '../../Molecules/ActionBox/ActionBox.js';
import { RingLucideIcon } from '../../../helpers/RingLucideIcon.js';
import { FeaturedIcon } from '../../Atoms/FeaturedIcon/FeaturedIcon.js';
import { mediaFrameFill } from '../../../helpers/mediaFrameFill.js';
import { useCellDataTestId } from './dataGridTestIdContext.js';
import { getCellViewMode, prepareChips } from './helpers.js';

export type ComboCellChips = string | string[] | Omit<ChipProps, 'size'>[];
export interface ComboCellProps {
    /**
     * Main label
     */
    label: string;
    /**
     * Caption
     */
    caption?: string;
    /**
     * Image Url
     */
    imageUrl?: string;
    /**
     * When true, placeholder is shown if imageUrl is not provided.
     * @default false
     */
    showPlaceholder?: boolean;
    /**
     * Chips rendered below text
     */
    chips?: ComboCellChips;
    /**
     * Comment icon next to main label
     * @default false
     */
    withComment?: boolean;
    /**
     * Additional badge shown next to main label
     */
    badge?: string | number;
    /**
     * Additional badge shown next to main label
     */
    commentIconColor?: Pick<IconOwnProps, 'color'>;
}

export function renderComboCell<T extends ComboCellProps>(params: GridRenderCellParams<Array<T>>): React.JSX.Element {
    const {
        value: {
            label,
            caption,
            imageUrl,
            showPlaceholder = false,
            chips,
            withComment = false,
            badge,
            commentIconColor,
        },
    } = params;

    const rootProps = useGridRootProps();
    const { density, rowHeight } = rootProps;
    const apiRef = useGridApiContext();
    const densityFactor = useGridSelector(apiRef, gridDensityFactorSelector);
    const getRowHeightParams: GridRowHeightParams = {
        id: params.id,
        densityFactor,
        model: { standard: 1 } as GridValidRowModel,
    };

    // Keyed to the url that failed, so a row that gets another url, or loses it, leaves the error state.
    const [failedImageUrl, setFailedImageUrl] = useState<string>();
    const errorLoadingImage = Boolean(imageUrl) && failedImageUrl === imageUrl;

    const getRowHeight = rootProps?.getRowHeight ? rootProps.getRowHeight(getRowHeightParams) : null;

    const viewMode = getCellViewMode({ getRowHeight, rowHeight, density });

    const theme = useTheme();
    const ref = useRef<HTMLDivElement>(null);
    const dataTestId = useCellDataTestId(params.id as string | number, params.field);

    const preparedChips = prepareChips(chips);
    const thumbnailFill = mediaFrameFill(theme);

    const renderBadge = (): React.ReactElement => {
        return (
            <Chip
                label={badge}
                variant="outlined"
                color="secondary"
                size="small"
                sx={{ height: '20px', marginLeft: 1 }}
            />
        );
    };

    const createLabelSx = (): SxProps => {
        if (viewMode === 'full') {
            return {
                textWrap: 'wrap',
            };
        } else {
            return {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textWrap: 'nowrap',
            };
        }
    };

    return (
        <>
            <Card
                data-testid={dataTestId}
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    width: '100%',
                    height: '100%',
                    paddingY: 1,
                }}
            >
                {/*if view mode is small or image url and show placeholder are falsy do not render image/placeholder*/}
                {viewMode === 'small' || (!imageUrl && !showPlaceholder) ? null : (!imageUrl && showPlaceholder) || // if no image url and show placeholder is true or error loading image render placeholder, otherwise render image
                  errorLoadingImage ? (
                    <Box
                        sx={{
                            width: 75,
                            height: viewMode === 'full' ? 48 : 40,
                            background: thumbnailFill,
                            marginRight: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                        }}
                    >
                        <FeaturedIcon
                            size="inherit"
                            icon={errorLoadingImage ? ImageOff : Image}
                            dataTestId={`${dataTestId}-placeholder-icon`}
                        />
                    </Box>
                ) : (
                    <CardMedia
                        component="img"
                        // The thumbnail illustrates the label beside it, so it is decorative.
                        alt=""
                        sx={{
                            width: 75,
                            height: viewMode === 'full' ? 48 : 40,
                            marginRight: 2,
                            objectFit: 'scale-down',
                            background: thumbnailFill,
                            borderRadius: 1,
                        }}
                        image={imageUrl}
                        onError={() => {
                            setFailedImageUrl(imageUrl);
                        }}
                    />
                )}
                <CardContent
                    sx={{
                        padding: 0,
                        // image width 75px + icon 16px = 91px
                        width: 'calc(100% - 91px)',
                        '&:last-child': {
                            paddingBottom: 0,
                        },
                    }}
                >
                    <Box sx={{ alignItems: 'start', display: 'flex', width: '100%' }}>
                        {withComment && (
                            <RingLucideIcon
                                icon={MessageSquare}
                                fontSize="small"
                                sx={{ marginRight: 1 }}
                                {...(commentIconColor ? { color: commentIconColor } : {})}
                            />
                        )}
                        {/* A div, not body2's <p>: in full view the badge Chip (a div) flows inline inside the label. */}
                        <Typography component="div" variant="body2" color="text.primary" sx={createLabelSx()}>
                            {label}
                            {badge && viewMode === 'full' && renderBadge()}
                        </Typography>
                        {badge && viewMode !== 'full' && renderBadge()}
                    </Box>
                    {viewMode !== 'small' && (
                        <>
                            {caption && (
                                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'nowrap' }}>
                                    <Tooltip title={caption}>
                                        <Typography variant="caption" color="text.secondary">
                                            {caption}
                                        </Typography>
                                    </Tooltip>
                                </Box>
                            )}
                            {/* The first three chips render inline; the `+N` chip opens the rest as a menu,
                                which lists only chips with a string label. */}
                            {Boolean(preparedChips.chips.length) && viewMode === 'full' && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                        marginTop: '5px',
                                    }}
                                >
                                    {preparedChips.chips.map((item) => item)}
                                    {Boolean(preparedChips.additionalChips.length) && (
                                        <>
                                            <Chip
                                                sx={{ cursor: 'pointer' }}
                                                size="small"
                                                label={`+${preparedChips.additionalChips.length}`}
                                                ref={ref}
                                                data-testid={`${dataTestId}-more`}
                                            />
                                            <ActionBox
                                                actions={preparedChips.additionalChips}
                                                anchorEl={ref}
                                                dataTestId={`${dataTestId}-more-menu`}
                                            />
                                        </>
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
