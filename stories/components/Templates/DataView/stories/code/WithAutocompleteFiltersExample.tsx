import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
    Autocomplete,
    ChipsGroup,
    type ControlledSearchBoxProps,
    DataView,
    RingDataGrid,
    SearchBox,
    type TopSlotProps,
} from '@ringpublishing/mui-components';

type FilterOption = { id: number; label: string };

interface AutocompleteFiltersContextValue {
    selectedAuthors: FilterOption[];
    selectedContentTypes: FilterOption[];
    setSelectedAuthors: React.Dispatch<React.SetStateAction<FilterOption[]>>;
    setSelectedContentTypes: React.Dispatch<React.SetStateAction<FilterOption[]>>;
}

const AutocompleteFiltersContext = React.createContext<AutocompleteFiltersContextValue | null>(null);

const contentTypes: FilterOption[] = [
    { id: 1, label: 'Article' },
    { id: 2, label: 'Gallery' },
    { id: 3, label: 'Video' },
];

const authors: FilterOption[] = [
    { id: 1, label: 'Alex Morgan' },
    { id: 2, label: 'Jordan Lee' },
    { id: 3, label: 'Taylor Kim' },
];

const columns = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 240 },
    { field: 'contentType', headerName: 'Content type', width: 150 },
    { field: 'author', headerName: 'Author', width: 180 },
    { field: 'updated', headerName: 'Last updated', width: 180 },
];

const rows = [
    {
        id: 1,
        title: 'Building a resilient editorial workflow',
        contentType: 'Article',
        author: 'Alex Morgan',
        updated: 'Sep 5, 2026',
    },
    {
        id: 2,
        title: 'Behind the scenes: the autumn collection',
        contentType: 'Gallery',
        author: 'Jordan Lee',
        updated: 'Sep 4, 2026',
    },
    {
        id: 3,
        title: 'How our newsroom plans live coverage',
        contentType: 'Video',
        author: 'Taylor Kim',
        updated: 'Sep 2, 2026',
    },
    {
        id: 4,
        title: 'Five stories readers saved this week',
        contentType: 'Article',
        author: 'Alex Morgan',
        updated: 'Sep 1, 2026',
    },
];

function getOptionLabel(option: FilterOption | string): string {
    return typeof option === 'string' ? option : option.label;
}

function isOptionEqualToValue(option: FilterOption | string, value: FilterOption | string): boolean {
    return typeof option !== 'string' && typeof value !== 'string' && option.id === value.id;
}

function isFilterOption(value: FilterOption | string): value is FilterOption {
    return typeof value !== 'string';
}

function AutocompleteFiltersTopSlot(topSlotProps: TopSlotProps): React.JSX.Element {
    const context = React.useContext(AutocompleteFiltersContext);

    if (!context) {
        throw new Error('AutocompleteFiltersTopSlot must be rendered within AutocompleteFiltersContext.');
    }

    const { selectedAuthors, selectedContentTypes, setSelectedAuthors, setSelectedContentTypes } = context;
    const selectedFilters = [
        ...selectedContentTypes.map((option) => ({ filter: 'Content type', option })),
        ...selectedAuthors.map((option) => ({ filter: 'Author', option })),
    ];

    function handleClearAll(): void {
        setSelectedContentTypes([]);
        setSelectedAuthors([]);
    }

    return (
        <Box
            sx={{
                backgroundColor: (theme) => theme.palette.background.paper,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                p: 2,
            }}
        >
            <Typography variant="subtitle1">Content library</Typography>
            <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <SearchBox
                    {...(topSlotProps as ControlledSearchBoxProps)}
                    sx={{ flex: '0 1 360px', minWidth: 0 }}
                />
                <Autocomplete
                    variant="filter"
                    labels={{ title: 'Content type', searchPlaceholder: 'Search content types' }}
                    multiple={true}
                    options={contentTypes}
                    value={selectedContentTypes}
                    getOptionLabel={getOptionLabel}
                    isOptionEqualToValue={isOptionEqualToValue}
                    onChange={(event, value): void => {
                        void event;
                        setSelectedContentTypes(Array.isArray(value) ? value.filter(isFilterOption) : []);
                    }}
                    sx={{ minWidth: 150 }}
                />
                <Autocomplete
                    variant="filter"
                    labels={{ title: 'Author', searchPlaceholder: 'Search authors' }}
                    multiple={true}
                    options={authors}
                    value={selectedAuthors}
                    getOptionLabel={getOptionLabel}
                    isOptionEqualToValue={isOptionEqualToValue}
                    onChange={(event, value): void => {
                        void event;
                        setSelectedAuthors(Array.isArray(value) ? value.filter(isFilterOption) : []);
                    }}
                    sx={{ minWidth: 150 }}
                />
            </Box>
            {selectedFilters.length > 0 && (
                <ChipsGroup
                    chips={selectedFilters.map(({ filter, option }) => ({
                        label: `${filter}: ${option.label}`,
                        onDelete: (): void => {
                            if (filter === 'Content type') {
                                setSelectedContentTypes((values) => values.filter((value) => value.id !== option.id));
                            } else {
                                setSelectedAuthors((values) => values.filter((value) => value.id !== option.id));
                            }
                        },
                    }))}
                    onDeleteAll={handleClearAll}
                    customLabels={{ deleteAll: 'Delete all' }}
                />
            )}
        </Box>
    );
}

export default function WithAutocompleteFiltersExample(): React.JSX.Element {
    const [selectedContentTypes, setSelectedContentTypes] = useState<FilterOption[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<FilterOption[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRows = rows.filter((row) => {
        const matchesSearch = row.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesContentType =
            selectedContentTypes.length === 0 ||
            selectedContentTypes.some((option) => option.label === row.contentType);
        const matchesAuthor =
            selectedAuthors.length === 0 || selectedAuthors.some((option) => option.label === row.author);

        return matchesSearch && matchesContentType && matchesAuthor;
    });

    return (
        <AutocompleteFiltersContext.Provider
            value={{ selectedAuthors, selectedContentTypes, setSelectedAuthors, setSelectedContentTypes }}
        >
            <DataView
                sx={{ height: 'calc(100vh - 38px)' }}
                slots={{
                    top: AutocompleteFiltersTopSlot,
                    main: <RingDataGrid rows={filteredRows} columns={columns} totalRowCount={filteredRows.length} />,
                }}
                slotProps={{
                    top: {
                        value: searchQuery,
                        onChange: (value): void => setSearchQuery(value),
                        labels: { placeholder: 'Search content' },
                    },
                }}
            />
        </AutocompleteFiltersContext.Provider>
    );
}
