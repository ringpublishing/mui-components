import React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Chip, ChipProps, Typography } from '@mui/material';
import { Globe, Lock } from 'lucide-react';

import { renderActionCell, renderComboCell, RingLucideIcon } from '../../../../src/index.js';
import { MetricsTypes } from '../../../helpers/storiesData.js';

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

// A workflow stage labels the row, so it is a tag. Stages are configured per space; unknown ones stay neutral.
const STAGE_TAG_COLOR: Record<string, ChipProps['color']> = {
    Ready: 'success',
    Draft: 'error',
};

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

// Columns share the free width and the grid scrolls sideways only below their minimums.
const STRETCH = { flex: 1, minWidth: 90 } as const;

export const storiesColumns: GridColDef[] = [
    {
        field: 'title',
        headerName: 'Title',
        flex: 2,
        minWidth: 200,
        sortable: false,
        hideable: false,
        renderCell: renderComboCell,
    },
    {
        field: 'date',
        headerName: 'Modification date',
        flex: 1,
        minWidth: 120,
        sortable: true,
        display: 'flex',
    },
    {
        field: 'author',
        headerName: 'Author',
        ...STRETCH,
        renderCell: renderTypographyCell,
    },
    {
        field: 'source',
        headerName: 'Source',
        ...STRETCH,
        renderCell: renderTypographyCell,
    },
    {
        field: 'flags',
        headerName: 'Flags',
        ...STRETCH,
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
        ...STRETCH,
        renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <Chip variant="tag" color={STAGE_TAG_COLOR[params.value.name] ?? 'neutral'} label={params.value.name} />
            </Box>
        ),
    },
    ...Object.values(MetricsTypes).map((metric) => ({
        field: metric,
        headerName: getMetricHeader(metric),
        ...STRETCH,
        renderCell: renderTypographyCell,
    })),
    {
        field: 'status',
        headerName: 'Status',
        width: 60,
        renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {params.value === 'PUBLISHED' ? (
                    <Globe />
                ) : (
                    <RingLucideIcon icon={Lock} fontSize="small" color="disabled" />
                )}
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
