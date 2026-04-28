import React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Chip, Typography } from '@mui/material';
import { Public, PublicOff } from '@mui/icons-material';

import { renderActionCell, renderComboCell } from '../../../../src/index.js';
import { hexToRgb } from '../../../../src/helpers/colors.js';
import { MetricsTypes } from '../../../../src/helpers/stories/storiesData.js';

function renderTypographyCell(params: GridRenderCellParams): React.JSX.Element {
    return (
        <Typography
            variant="body2"
            sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            {params.value}
        </Typography>
    );
}

function getChipBackgroundColor(colorHex: string): string {
    const rgb = hexToRgb(colorHex);

    return `rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.15)`;
}

function getMetricHeader(metric: string): string {
    const divided = metric.split(/(?=[A-Z])/).join(' ');

    return divided.charAt(0).toUpperCase() + divided.slice(1);
}

export const initialColumnsHidden = ['charactersCount', 'tagsCount', 'topicsCount'];

export const initialColumnsHiddenInCodeStories = [...initialColumnsHidden, 'date', 'wordCount'];

export function getInitialColumnVisibilityModel(inCode = false): Record<string, boolean> {
    const columnsHidden = inCode ? initialColumnsHiddenInCodeStories : initialColumnsHidden;

    return columnsHidden.reduce(
        (acc, column) => {
            acc[column] = false;

            return acc;
        },
        {} as Record<string, boolean>,
    );
}

export const storiesColumns: GridColDef[] = [
    {
        field: 'title',
        headerName: 'Title',
        width: 300,
        sortable: false,
        hideable: false,
        renderCell: renderComboCell,
    },
    {
        field: 'date',
        headerName: 'Modification date',
        width: 140,
        sortable: true,
        display: 'flex',
    },
    {
        field: 'author',
        headerName: 'Author',

        renderCell: renderTypographyCell,
    },
    {
        field: 'source',
        headerName: 'Source',

        renderCell: renderTypographyCell,
    },
    {
        field: 'flags',
        headerName: 'Flags',
        renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {params.value.map((flag: string) => (
                    <Typography variant="body2" sx={{ overflow: 'hidden', textWrap: 'nowrap' }} key={flag}>
                        {flag}
                    </Typography>
                ))}
            </Box>
        ),
    },
    {
        field: 'stage',
        headerName: 'Stage',
        renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Chip
                    size="small"
                    label={params.value.name}
                    sx={{
                        backgroundColor: getChipBackgroundColor(params.value.color),
                        color: params.value.color,
                    }}
                />
            </Box>
        ),
    },
    ...Object.values(MetricsTypes).map((metric) => ({
        field: metric,
        headerName: getMetricHeader(metric),
        renderCell: renderTypographyCell,
    })),
    {
        field: 'status',
        headerName: 'Status',
        width: 60,
        renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {params.value === 'PUBLISHED' ? <Public /> : <PublicOff color="disabled" />}
            </Box>
        ),
    },
    {
        field: 'actions',
        width: 70,
        headerName: 'Action',
        renderCell: renderActionCell,
    },
];
