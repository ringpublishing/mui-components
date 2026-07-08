import { Chip, Avatar, Tooltip } from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';
import { get } from 'lodash';
import { Close, PhotoOutlined } from '@mui/icons-material';
import { BottomBarSlotProps } from './BottomBarContainer.js';

interface RowData {
    id: GridRowId;
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

export const ChipItem: React.FC<ChipItemProps> = ({
    selectedRow,
    fieldMap,
    onRemove,
    slotProps,
    getTooltip,
    onClick,
}) => {
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
                onClick={onClick ? () => onClick(selectedRow) : undefined}
                onDelete={() => onRemove(selectedRow.id)}
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
};
