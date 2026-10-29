import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';
import { get } from 'lodash';
import { X, Image } from 'lucide-react';
import { FeaturedIcon } from '../../Atoms/FeaturedIcon/FeaturedIcon.js';
import { tv } from '../../../helpers/typographyMode.js';
import { mediaFrameFill } from '../../../helpers/mediaFrameFill.js';

interface RowData {
    id: GridRowId;
    [key: string]: unknown;
}

interface ImageBoxItemProps {
    selectedRow: RowData;
    fieldMap: {
        id: string;
        name: string;
        image: string;
    };
    onRemove: (id: GridRowId) => void;
    getTooltip?: (row: Record<string, unknown>) => React.ReactNode;
    onClick?: (item: RowData) => void;
    /**
     * Prefix for the test ids inside this tile, under its bar's; the tile renders none of its own. Its placeholder
     * glyph is `<prefix>-placeholder-icon`.
     */
    dataTestId?: string;
}

const IMAGE_HEIGHT = 60;
const PLACEHOLDER_WIDTH = 80;

export function ImageBoxItem(props: ImageBoxItemProps): React.JSX.Element {
    const { selectedRow, fieldMap, onRemove, getTooltip, onClick, dataTestId } = props;
    const labelCandidate = get(selectedRow, fieldMap.name);
    const label =
        typeof labelCandidate === 'string' && labelCandidate.trim().length > 0
            ? labelCandidate
            : String(selectedRow.id);
    const tooltip = getTooltip ? getTooltip(selectedRow) : label;

    const imageCandidate = get(selectedRow, fieldMap.image);
    const imageSrc =
        typeof imageCandidate === 'string' && imageCandidate.trim().length > 0 ? imageCandidate : undefined;

    return (
        <Tooltip key={`tooltip-${selectedRow.id}`} title={tooltip} placement="top" enterDelay={500}>
            <Box
                onClick={onClick ? (): void => onClick(selectedRow) : undefined}
                sx={{
                    position: 'relative',
                    height: IMAGE_HEIGHT,
                    width: imageSrc ? 'auto' : PLACEHOLDER_WIDTH,
                    minWidth: imageSrc ? 0 : PLACEHOLDER_WIDTH,
                    flexShrink: 0,
                    display: 'inline-flex',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    transition: 'width 0.2s ease',
                    cursor: onClick ? 'pointer' : 'default',
                    '&:hover': {
                        '& .image': {
                            filter: 'brightness(0.5)',
                        },
                        '& .delete-button': {
                            opacity: 1,
                        },
                    },
                }}
            >
                {imageSrc ? (
                    <Box
                        component="img"
                        className="image"
                        sx={{
                            display: 'block',
                            height: '100%',
                            width: 'auto',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            borderRadius: 'inherit',
                            transition: 'filter 0.2s ease',
                        }}
                        src={imageSrc}
                        alt={label}
                    />
                ) : (
                    <Box
                        className="image"
                        sx={{
                            height: '100%',
                            width: '100%',
                            borderRadius: '5px',
                            transition: 'filter 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // The same frame fill and glyph as the grid's own placeholder, so the strip
                            // matches the cards it mirrors in both colour modes.
                            backgroundColor: mediaFrameFill,
                        }}
                    >
                        <FeaturedIcon
                            size="inherit"
                            icon={Image}
                            dataTestId={dataTestId ? `${dataTestId}-placeholder-icon` : undefined}
                        />
                    </Box>
                )}
                <Box
                    className="delete-button"
                    onClick={(event): void => {
                        event.stopPropagation();
                        onRemove(selectedRow.id);
                    }}
                    sx={(theme): object => ({
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        // The overlay plate the theme gives controls over imagery (MediaCard's status
                        // labels, Media's action button): the chip's own fill is a translucent tint
                        // and disappears on a photo. Both modes, opaque glyph.
                        backgroundColor: theme.palette.components.overlay?.background,
                        borderRadius: 1,
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: tv('1rem')(theme),
                        color: theme.palette.components.overlay?.foreground,
                        '&:hover': {
                            backgroundColor: theme.palette.components.overlay?.hover,
                        },
                    })}
                >
                    <X size="1em" />
                </Box>
            </Box>
        </Tooltip>
    );
}
