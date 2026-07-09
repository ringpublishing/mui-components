import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';
import { get } from 'lodash';
import { Close, PhotoOutlined } from '@mui/icons-material';
import { tv } from '../../../helpers/typographyMode.js';

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
}

const IMAGE_HEIGHT = 60;
const PLACEHOLDER_WIDTH = 80;

export function ImageBoxItem(props: ImageBoxItemProps): React.JSX.Element {
    const { selectedRow, fieldMap, onRemove, getTooltip, onClick } = props;
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
                            backgroundColor: 'grey.200',
                        }}
                    >
                        <PhotoOutlined color="disabled" sx={{ fontSize: tv('1.5rem') }} />
                    </Box>
                )}
                <Box
                    className="delete-button"
                    onClick={(event): void => {
                        event.stopPropagation();
                        onRemove(selectedRow.id);
                    }}
                    sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        border: (theme) => `2px solid ${theme.colors.red[600]}`,
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <Close
                        sx={(theme): object => ({
                            fontSize: tv('1rem')(theme),
                            fontWeight: 'bold',
                            color: theme.colors.red[600],
                        })}
                    />
                </Box>
            </Box>
        </Tooltip>
    );
}
