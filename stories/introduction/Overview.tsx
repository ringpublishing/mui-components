import { ReactNode, useEffect, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    AlertTitle,
    Avatar,
    Button,
    Checkbox,
    Chip,
    IconButton,
    PaletteMode,
    Radio,
    ThemeProvider,
    Rating,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { ChevronLeft, ExpandMore } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { addons } from 'storybook/preview-api';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { getCreatedTheme } from '../../src/theme/theme.js';
import { CommonLanguages } from '../../src/helpers/commonTypes.js';

const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
        editable: true,
    },
    {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
        editable: true,
    },
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 110,
        editable: true,
    },
    {
        field: 'fullName',
        headerName: 'Full name',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,
        valueGetter: (value, row): string => {
            return `${row.firstName || ''} ${row.lastName || ''}`;
        },
    },
];

const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

let currentMode: PaletteMode = 'light';
let currentLanguage: CommonLanguages = CommonLanguages.enUS;
const listeners: Set<() => void> = new Set();
let channelSubscribed = false;

function ensureChannelSubscription(): void {
    if (channelSubscribed) return;

    channelSubscribed = true;
    const channel = addons.getChannel();

    channel.on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, unknown> }) => {
        if (globals.theme) currentMode = globals.theme as PaletteMode;
        if (globals.locale) currentLanguage = globals.locale as CommonLanguages;
        listeners.forEach((fn) => fn());
    });
}

export const Overview = (): ReactNode => {
    const [, setTick] = useState(0);
    const [expanded, setExpanded] = useState<string>('');

    useEffect(() => {
        const forceUpdate = (): void => setTick((t) => t + 1);

        ensureChannelSubscription();
        listeners.add(forceUpdate);

        return () => {
            listeners.delete(forceUpdate);
        };
    }, []);

    const deleteAction = (): number => {
        return 1;
    };

    return (
        <ThemeProvider theme={getCreatedTheme(currentMode, { language: currentLanguage })}>
            <Stack
                spacing={3}
                sx={{
                    bgcolor: 'background.default',
                    color: 'text.primary',
                    padding: '24px',
                }}
            >
                <Stack direction={'column'} spacing={1}>
                    <Typography variant={'h3'} color={'text.primary'}>
                        Typography
                    </Typography>
                    <Typography variant={'body2'} color={'text.primary'}>
                        Typography
                    </Typography>
                </Stack>
                <Stack direction={'row'} spacing={1}>
                    <Button startIcon={<ChevronLeft />} size={'large'} color={'primary'} variant={'contained'}>
                        Label
                    </Button>
                    <Button startIcon={<ChevronLeft />} size={'large'} color={'primary'} variant={'outlined'}>
                        Label
                    </Button>
                    <Button startIcon={<ChevronLeft />} size={'large'} color={'primary'} variant={'text'}>
                        Label
                    </Button>
                    <IconButton loading={true} size={'large'} color={'primary'}>
                        <ChevronLeft />
                    </IconButton>
                </Stack>
                <Stack direction={'row'} spacing={1}>
                    <Button startIcon={<ChevronLeft />} size={'medium'} color={'primary'} variant={'contained'}>
                        Label
                    </Button>
                    <Button startIcon={<ChevronLeft />} size={'medium'} color={'primary'} variant={'outlined'}>
                        Label
                    </Button>
                    <Button startIcon={<ChevronLeft />} size={'medium'} color={'primary'} variant={'text'}>
                        Label
                    </Button>
                    <IconButton loading={true} size={'medium'} color={'primary'}>
                        <ChevronLeft />
                    </IconButton>
                </Stack>
                <Stack direction={'row'} spacing={1}>
                    <Button startIcon={<ChevronLeft />} size={'small'} color={'primary'} variant={'contained'}>
                        Label
                    </Button>
                    <Button startIcon={<ChevronLeft />} size={'small'} color={'primary'} variant={'outlined'}>
                        Label
                    </Button>
                    <Button startIcon={<ChevronLeft />} size={'small'} color={'primary'} variant={'text'}>
                        Label
                    </Button>
                    <IconButton loading={true} size={'small'} color={'primary'}>
                        <ChevronLeft />
                    </IconButton>
                </Stack>
                <Stack>
                    <Tabs value={0}>
                        <Tab label="Tab" />
                        <Tab label="Tab" />
                        <Tab label="Tab" />
                        <Tab label="Tab" />
                    </Tabs>
                </Stack>
                <Stack direction={'row'} spacing={1}>
                    <Checkbox checked={true} />
                    <Radio checked={true} />
                    <Switch checked={true} />
                </Stack>
                <Stack direction={'row'} spacing={1}>
                    <Rating value={3.5} precision={0.5} />
                </Stack>
                <Stack direction={'row'} spacing={1}>
                    <Chip label={'Primary'} color={'primary'} size={'medium'} variant={'filled'} />
                    <Chip label={'Secondary'} color={'secondary'} size={'medium'} variant={'filled'} />
                    <Chip label={'Error'} color={'error'} size={'medium'} variant={'filled'} />
                    <Chip label={'Warning'} color={'warning'} size={'medium'} variant={'filled'} />
                    <Chip label={'Info'} color={'info'} size={'medium'} variant={'filled'} />
                </Stack>
                <Stack direction={'row'} spacing={1} alignItems={'center'}>
                    <Chip
                        label={'Deletable'}
                        color={'default'}
                        size={'medium'}
                        variant={'filled'}
                        onDelete={deleteAction}
                    />
                    <Chip
                        label={'Thumbnail'}
                        color={'default'}
                        size={'medium'}
                        variant={'filled'}
                        onDelete={deleteAction}
                        avatar={<Avatar>OP</Avatar>}
                    />
                    <Chip label={'Small'} color={'default'} size={'small'} variant={'filled'} />
                    <Chip label={'Outlined'} color={'default'} size={'small'} variant={'outlined'} />
                    <Chip label={'Default'} color={'default'} size={'medium'} />
                </Stack>
                <Stack direction={'row'} spacing={1} alignItems={'center'}>
                    <TextField label={'Label'} size={'medium'} value={'Value'} />
                    <TextField label={'Label'} size={'medium'} value={'Value'} variant={'filled'} />
                    <TextField label={'Label'} size={'medium'} value={'Value'} variant={'outlined'} />
                </Stack>
                <Stack>
                    <Accordion expanded={expanded === 'panel1'} onChange={(): void => setExpanded('panel1')}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography sx={{ width: '33%', flexShrink: 0 }}>Typography</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>Typography</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1">
                                Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat. Aliquam eget
                                maximus est, id dignissim quam.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel2'} onChange={(): void => setExpanded('panel2')}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="panel2bh-content"
                            id="panel2bh-header"
                        >
                            <Typography sx={{ width: '33%', flexShrink: 0 }}>Typography</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>Typography</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat. Aliquam eget
                                maximus est, id dignissim quam.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Stack>
                <Stack>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 5,
                                },
                            },
                        }}
                        pageSizeOptions={[5]}
                        checkboxSelection={true}
                        disableRowSelectionOnClick={true}
                    />
                </Stack>
                <Stack direction={'column'} spacing={3}>
                    <Alert severity={'error'}>
                        <AlertTitle>Title</AlertTitle>
                        This is a error Alert with an encouraging title.
                    </Alert>
                    <Alert severity={'error'} variant={'outlined'}>
                        <AlertTitle>Title</AlertTitle>
                        This is a error Alert with an encouraging title.
                    </Alert>
                    <Alert severity={'error'} variant={'standard'}>
                        <AlertTitle>Title</AlertTitle>
                        This is a error Alert with an encouraging title.
                    </Alert>
                    <Alert severity={'warning'}>This is a warning Alert with an encouraging title.</Alert>
                    <Alert severity={'info'}>This is a info Alert with an encouraging title.</Alert>
                    <Alert severity={'success'}>This is a success Alert with an encouraging title.</Alert>
                </Stack>
            </Stack>
        </ThemeProvider>
    );
};
