import React from 'react';
import { Chip, Avatar, Tooltip } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';
import { get } from 'lodash';
import { Close, PhotoOutlined } from '@mui/icons-material';
import { BottomBarSlotProps } from './BottomBarContainer.js';

interface RowData {
    id: GridRowId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface ChipItemProps {
    selectedRow: RowData;
    fieldMap: {
        id: string;
        name: string;
        image: string;
    };
    onRemove: (id: GridRowId) => void;
    slotProps?: BottomBarSlotProps;
    getTooltip?: (row: Record<string, unknown>) => React.ReactNode;
    onClick?: (item: RowData) => void;
}

export function ChipItem(props: ChipItemProps): React.JSX.Element {
    const { selectedRow, fieldMap, onRemove, slotProps, getTooltip, onClick } = props;
    const label = get(selectedRow, fieldMap.name) || String(selectedRow.id);
    const imageSrc = get(selectedRow, fieldMap.image);
    const tooltip = getTooltip ? getTooltip(selectedRow) : label;

    return (
        <Tooltip key={`tooltip-${selectedRow.id}`} title={tooltip} placement="top" enterDelay={500}>
            <Chip
                key={selectedRow.id}
                avatar={
                    imageSrc ? (
                        <Avatar src={imageSrc} sx={{ borderRadius: '5px' }} />
                    ) : slotProps?.showImagePlaceholder ? (
                        <Avatar sx={{ backgroundColor: 'transparent' }}>
                            <PhotoOutlined color="secondary" />
                        </Avatar>
                    ) : undefined
                }
                label={label}
                onClick={onClick ? (): void => onClick(selectedRow) : undefined}
                onDelete={(): void => onRemove(selectedRow.id)}
                size="medium"
                variant="filled"
                deleteIcon={<Close />}
                sx={{
                    marginRight: 1,
                    borderRadius: 1,
                    maxWidth: '200px',
                    cursor: onClick ? 'pointer' : 'default',
                }}
            />
        </Tooltip>
    );
}
