import React, { useEffect, useState } from 'react';
import {
    Box,
    Chip,
    ChipProps,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import { useGridApiRef } from '@mui/x-data-grid-pro';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import { AlarmClock, Globe, ListChecks, Lock, ScanSearch, Send, Trash2 } from 'lucide-react';
import {
    Accordion,
    Autocomplete,
    CopyIconButton,
    DataView,
    DatePicker,
    Detail,
    FiltersWrapper,
    RingDataGrid,
    RingLucideIcon,
    Switch,
    Tooltip,
    renderActionCell,
    renderComboCell,
    type Action,
} from '@ringpublishing/mui-components';
import { getImagePath, ImageSize, TestImage } from 'RingDemoImages';

// Title is the only column that grows. Every other column is as wide as its widest header or visible cell:
// MUI measures the rendered cells and clamps the result to minWidth / maxWidth. It measures once on mount
// and again whenever a web font finishes loading, since text set in the fallback font is narrower. A grid
// that loads more rows later calls `apiRef.current.autosizeColumns(AUTOSIZE_OPTIONS)` after they render.
const CONTENT_SIZED_FIELDS = ['date', 'authors', 'stage', 'status'];
const AUTOSIZE_OPTIONS = { columns: CONTENT_SIZED_FIELDS, includeHeaders: true, includeOutliers: true };

// A workflow stage labels the row, so it is a tag. Stages are configured per space; unknown ones stay neutral.
const STAGE_TAG_COLOR: Record<string, ChipProps['color']> = {
    Ready: 'success',
    Accepted: 'info',
    Draft: 'error',
};

const STATUS = {
    published: { label: 'Published', icon: <RingLucideIcon icon={Globe} fontSize="small" /> },
    scheduled: { label: 'Scheduled', icon: <RingLucideIcon icon={AlarmClock} fontSize="small" /> },
    unpublished: {
        label: 'Unpublished',
        icon: <RingLucideIcon icon={Lock} fontSize="small" color="disabled" />,
    },
};

const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 280, sortable: false, renderCell: renderComboCell },
    { field: 'date', headerName: 'Modification date', display: 'flex' },
    {
        field: 'authors',
        headerName: 'Authors',
        // A long list of authors wraps instead of taking the title's room.
        maxWidth: 220,
        renderCell: (params: GridRenderCellParams<StoryRow, string[]>) => (
            <Stack sx={{ height: '100%', justifyContent: 'center' }}>
                {params.value?.map((author) => (
                    <Typography key={author} variant="body2">
                        {author}
                    </Typography>
                ))}
            </Stack>
        ),
    },
    {
        field: 'stage',
        headerName: 'Stage',
        renderCell: (params: GridRenderCellParams<StoryRow, string>) => (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <Chip variant="tag" color={STAGE_TAG_COLOR[params.value ?? ''] ?? 'neutral'} label={params.value} />
            </Box>
        ),
    },
    {
        field: 'status',
        headerName: 'Status',
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<StoryRow, keyof typeof STATUS>) => {
            const status = STATUS[params.value ?? 'unpublished'];

            return (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tooltip title={status.label}>
                        <Box component="span" aria-label={status.label} sx={{ display: 'inline-flex' }}>
                            {status.icon}
                        </Box>
                    </Tooltip>
                </Box>
            );
        },
    },
    {
        field: 'actions',
        headerName: '',
        width: 64,
        sortable: false,
        resizable: false,
        disableColumnMenu: true,
        renderCell: renderActionCell,
    },
];

interface StoryRow {
    id: string;
    title: { label: string; caption: string; imageUrl: string };
    date: string;
    authors: string[];
    stage: string;
    status: keyof typeof STATUS;
}

const stories: StoryRow[] = [
    {
        id: '4f1c2a9e-0b7d-4e21-9c3a-1d2e5f6a7b80',
        title: {
            label: 'City council approves the new tram line after a three-year debate',
            caption: 'Article',
            imageUrl: getImagePath(TestImage.BUILDING, ImageSize.SMALL),
        },
        date: '13:36 | 17-09-2026',
        authors: ['Anna Kowalska'],
        stage: 'Ready',
        status: 'published',
    },
    {
        id: '8b3e6d12-5c4f-4a9b-b1e2-7f80a9c3d415',
        title: {
            label: 'Storm warning for the coast',
            caption: 'Live Blog',
            imageUrl: getImagePath(TestImage.BEACH, ImageSize.SMALL),
        },
        date: '12:25 | 17-09-2026',
        authors: ['Piotr Nowak', 'Maria Wiśniewska'],
        stage: 'Ready',
        status: 'published',
    },
    {
        id: 'c27a9f40-1e3b-4d6c-a8f5-2b9e0d4c7a61',
        title: {
            label: 'Ten castles worth a weekend trip',
            caption: 'Gallery · 24 photos',
            imageUrl: getImagePath(TestImage.CASTLE, ImageSize.SMALL),
        },
        date: '12:20 | 17-09-2026',
        authors: ['Katarzyna Zielińska-Wróblewska'],
        stage: 'Accepted',
        status: 'scheduled',
    },
    {
        id: '1e9d4b7c-6a2f-4c85-9e13-5a7b8c0d2f94',
        title: {
            label: 'What the new parking rules mean for residents',
            caption: 'Article',
            imageUrl: getImagePath(TestImage.CAR, ImageSize.SMALL),
        },
        date: '08:50 | 17-09-2026',
        authors: ['Tomasz Lewandowski'],
        stage: 'Draft',
        status: 'unpublished',
    },
    {
        id: '9a5f3c81-2d7e-4b40-8f6a-0c1e3b5d7a29',
        title: {
            label: 'Quiz: how well do you know the forests of Europe?',
            caption: 'Quiz',
            imageUrl: getImagePath(TestImage.FOREST, ImageSize.SMALL),
        },
        date: '08:05 | 17-09-2026',
        authors: ['Ewa Kamińska', 'Jan Wójcik', 'Ola Dąbrowska'],
        stage: 'Draft',
        status: 'unpublished',
    },
    {
        id: '6d0b8e25-9f1a-4e7c-b3d4-8a2c6e1f0b57',
        title: {
            label: 'Eagles return to the river valley',
            caption: 'Video clip',
            imageUrl: getImagePath(TestImage.EAGLE, ImageSize.SMALL),
        },
        date: '15:28 | 16-09-2026',
        authors: ['Michał Szymański'],
        stage: 'Ready',
        status: 'published',
    },
    {
        id: 'b48e1f63-7c2d-4a95-a0e8-3f5b9d2c6e14',
        title: {
            label: 'Desert marathon: the runners who finished all six stages, and the ones who almost did',
            caption: 'Article',
            imageUrl: getImagePath(TestImage.DESERT, ImageSize.SMALL),
        },
        date: '15:27 | 16-09-2026',
        authors: ['Agnieszka Woźniak'],
        stage: 'Accepted',
        status: 'published',
    },
    {
        id: '2c7f5a98-4b1e-4d03-9a6c-e8f1b3d5a720',
        title: {
            label: 'Farmers expect a record harvest',
            caption: 'Article',
            imageUrl: getImagePath(TestImage.FARM, ImageSize.SMALL),
        },
        date: '11:02 | 16-09-2026',
        authors: ['Paweł Kozłowski'],
        stage: 'Ready',
        status: 'scheduled',
    },
];

const rows: GridRowsProp = stories.map((story) => ({
    ...story,
    actions: [
        { label: 'Edit', onClick: (): void => undefined },
        { label: 'Duplicate', onClick: (): void => undefined },
    ],
}));

const option = (label: string, id: number): { id: number; label: string } => ({ id, label });
const TYPES = ['Article', 'Gallery', 'Video clip', 'Quiz', 'Poll', 'Listicle', 'Live Blog'].map(option);
const CATEGORIES = ['News', 'Business', 'Sport', 'Culture', 'Travel'].map(option);
const AUTHORS = [
    'Anna Kowalska',
    'Piotr Nowak',
    'Maria Wiśniewska',
    'Katarzyna Zielińska-Wróblewska',
    'Tomasz Lewandowski',
    'Ewa Kamińska',
    'Jan Wójcik',
    'Ola Dąbrowska',
    'Michał Szymański',
    'Agnieszka Woźniak',
    'Paweł Kozłowski',
].map(option);
const SOURCES = ['PAP', 'Reuters', 'AFP', 'Associated Press'].map(option);
const STAGES = ['Draft', 'Ready', 'Accepted'].map(option);

/** Stands in for a search request: resolves after a delay with the authors whose name contains the query. */
function searchAuthors(query: string): Promise<typeof AUTHORS> {
    const text = query.trim().toLowerCase();

    return new Promise((resolve) => {
        window.setTimeout(() => resolve(AUTHORS.filter((author) => author.label.toLowerCase().includes(text))), 800);
    });
}

function AuthorFilter({ browse }: { browse: Action }): React.JSX.Element {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<typeof AUTHORS>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setLoading(false);

            return undefined;
        }

        let latest = true;
        setLoading(true);
        const timer = window.setTimeout(() => {
            void searchAuthors(query).then((authors) => {
                // Requests can resolve out of order, so one superseded by newer input is ignored.
                if (latest) {
                    setOptions(authors);
                    setLoading(false);
                }
            });
        }, 300);

        return (): void => {
            latest = false;
            window.clearTimeout(timer);
        };
    }, [open, query]);

    return (
        <Autocomplete
            labels={{ title: 'Author' }}
            multiple={true}
            options={options}
            loading={loading}
            // The request has already filtered the options.
            filterOptions={(authors): typeof AUTHORS => authors}
            onOpen={(): void => setOpen(true)}
            onClose={(): void => setOpen(false)}
            onInputChange={(event, value): void => setQuery(value)}
            actions={[browse]}
        />
    );
}

function StoryFilters(): React.JSX.Element {
    const browse = { label: 'Browse', icon: <ScanSearch />, onClick: (): void => undefined };
    const [from, setFrom] = useState<Dayjs | null>(null);
    const [to, setTo] = useState<Dayjs | null>(null);

    return (
        <FiltersWrapper label="Filters" withClearButton={true} clearButtonLabel="Clear" onClear={(): void => undefined}>
            <TextField
                select={true}
                label="Saved filters"
                defaultValue=""
                slotProps={{ select: { displayEmpty: true } }}
                sx={{ mb: 1 }}
            >
                <MenuItem value="">Select filter</MenuItem>
                <MenuItem value="today">Published today</MenuItem>
                <MenuItem value="drafts">My drafts</MenuItem>
            </TextField>
            <Accordion label="Main" defaultExpanded={true}>
                <Stack spacing={1.5}>
                    <Autocomplete
                        labels={{ title: 'Type' }}
                        multiple={true}
                        options={TYPES}
                        defaultValue={[TYPES[0]]}
                    />
                    <Autocomplete labels={{ title: 'Category' }} options={CATEGORIES} actions={[browse]} />
                    <AuthorFilter browse={browse} />
                    <Autocomplete labels={{ title: 'Source' }} multiple={true} options={SOURCES} />
                    <TextField select={true} label="Publication" defaultValue="any">
                        <MenuItem value="any">Any</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="unpublished">Unpublished</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="trash">Trash</MenuItem>
                    </TextField>
                    <Autocomplete labels={{ title: 'Stage' }} multiple={true} options={STAGES} />
                    <FormControlLabel control={<Switch />} label="Main content only" />
                </Stack>
            </Accordion>
            <Accordion label="Dates" defaultExpanded={true}>
                <Stack spacing={1.5}>
                    <TextField select={true} label="Date" defaultValue="modification">
                        <MenuItem value="publication">Publication</MenuItem>
                        <MenuItem value="modification">Modification</MenuItem>
                        <MenuItem value="creation">Creation</MenuItem>
                    </TextField>
                    <TextField select={true} label="Date range" defaultValue="last7">
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="yesterday">Yesterday</MenuItem>
                        <MenuItem value="last7">Last 7 days</MenuItem>
                        <MenuItem value="last30">Last 30 days</MenuItem>
                        <MenuItem value="month">This month</MenuItem>
                    </TextField>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label="From" value={from} onChange={setFrom} maxDate={to ?? undefined} />
                        <DatePicker label="To" value={to} onChange={setTo} minDate={from ?? undefined} />
                    </LocalizationProvider>
                </Stack>
            </Accordion>
        </FiltersWrapper>
    );
}

function StoryDetail({ story, onClose }: { story: StoryRow | null; onClose: () => void }): React.JSX.Element {
    if (!story) {
        return <Detail empty={true} main={{ onCloseClick: onClose }} />;
    }

    return (
        <Detail
            main={{
                mediaProps: { image: story.title.imageUrl, objectFit: 'cover' },
                title: { value: story.title.label },
                onCloseClick: onClose,
            }}
            descriptionItems={[
                {
                    sectionTitle: 'Story',
                    fields: [
                        { name: 'Type', value: story.title.caption },
                        { name: 'Modification date', value: story.date },
                        { name: 'Authors', value: story.authors },
                        { name: 'Stage', value: story.stage },
                        { name: 'Status', value: STATUS[story.status].label },
                        {
                            name: 'Identifier',
                            value: story.id,
                            truncate: 'middle',
                            icon: (
                                <CopyIconButton
                                    size="small"
                                    value={story.id}
                                    labels={{ copy: 'Copy identifier', copied: 'Copied' }}
                                />
                            ),
                        },
                    ],
                },
            ]}
        />
    );
}

export default function WithSelectionModeExample(): React.JSX.Element {
    const apiRef = useGridApiRef();
    const [query, setQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(true);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedStory, setSelectedStory] = useState<StoryRow | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        const measure = (): void => void apiRef.current?.autosizeColumns(AUTOSIZE_OPTIONS);

        document.fonts.addEventListener('loadingdone', measure);

        return (): void => document.fonts.removeEventListener('loadingdone', measure);
    }, [apiRef]);

    const visibleRows = rows.filter((row) => row.title.label.toLowerCase().includes(query.toLowerCase()));

    return (
        <DataView
            sx={{ width: '100%', height: '100vh' }}
            slots={{
                left: <StoryFilters />,
                right: <StoryDetail story={selectedStory} onClose={(): void => setDetailOpen(false)} />,
                main: (
                    <RingDataGrid
                        apiRef={apiRef}
                        rows={visibleRows}
                        columns={columns}
                        totalRowCount={visibleRows.length}
                        onRowClick={(params): void => {
                            setSelectedStory(params.row as StoryRow);
                            setDetailOpen(true);
                        }}
                        getRowHeight={(): 'auto' => 'auto'}
                        columnHeaderHeight={40}
                        autosizeOnMount={true}
                        autosizeOptions={AUTOSIZE_OPTIONS}
                        disableColumnFilter={true}
                        showRingToolbar={true}
                        enableBulkActions={selectionMode}
                        onBulkActionsClose={(): void => setSelectionMode(false)}
                        additionalComponent={
                            <Tooltip title="Select stories">
                                <IconButton aria-label="Select stories" onClick={(): void => setSelectionMode(true)}>
                                    <ListChecks />
                                </IconButton>
                            </Tooltip>
                        }
                        bulkActions={[
                            { tooltip: 'Publish', icon: <Send />, onClick: (): void => undefined },
                            { tooltip: 'Move to trash', icon: <Trash2 />, onClick: (): void => undefined },
                        ]}
                        labels={{
                            results: 'Results',
                            refresh: 'Refresh',
                            enableAutoRefresh: 'Enable auto refresh',
                            disableAutoRefresh: 'Disable auto refresh',
                            selectAll: 'Select all',
                            deselectAll: 'Deselect all',
                        }}
                    />
                ),
            }}
            slotProps={{
                top: {
                    defaultValue: '',
                    searchFunc: setQuery,
                    labels: { placeholder: 'Search stories' },
                    openSlotsOnMobileLabels: { leftSlot: 'Filters', rightSlot: 'Details' },
                },
                bottom: {
                    labels: { selected: 'selected' },
                    showVisibilityToggle: true,
                    showImagePlaceholder: true,
                    fieldMap: { name: 'title.label', image: 'title.imageUrl' },
                },
            }}
            leftSlotOpen={filterOpen}
            setLeftSlotOpen={setFilterOpen}
            leftSlotWidth={260}
            rightSlotOpen={detailOpen}
            setRightSlotOpen={setDetailOpen}
        />
    );
}
