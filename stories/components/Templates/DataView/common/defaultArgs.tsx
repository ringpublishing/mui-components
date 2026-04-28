import React, { ReactNode } from 'react';
import { action } from 'storybook/actions';
import {
    EditOutlined,
    InfoOutlined,
    Public,
    RocketLaunch,
    DeleteOutline,
    GridViewOutlined,
    TableRows,
} from '@mui/icons-material';
import {
    Checkbox,
    FormControlLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Slider,
    Switch,
    TextField,
    IconButton,
} from '@mui/material';
import {
    Accordion,
    Autocomplete,
    Detail as RingDetail,
    DetailDescriptionItemFieldLayout,
    DetailDescriptionItemFieldType,
    FiltersWrapper,
    SplitButton,
    ThemeConfig,
    DataViewProps,
} from '../../../../../src/index.js';

export const DefaultDataViewArgs: Partial<DataViewProps> = {
    rightSlotOpen: false,
    leftSlotOpen: true,
    leftSlotWidth: 220,
    mainSlotMinWidth: 500,
    slotProps: {
        top: {
            defaultValue: '',
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            searchFunc: () => {},
            openSlotsOnMobileLabels: {
                rightSlot: 'Detail',
                leftSlot: 'Filters',
            },
        },
    },
    leftSlotDynamicWidth: {
        enabled: false,
        minWidth: 180,
        maxWidth: 400,
    },
};

interface FilterProps {
    customCode?: string;
}

export const Filter: React.FC<FilterProps> = ({ customCode }) => {
    return (
        <ThemeConfig mode={'light'}>
            <FiltersWrapper onClear={action('Filter: onClear clicked')} label="Filters">
                <Accordion label="Basic" defaultExpanded={true}>
                    <TextField label="Text" name="basic.text" />
                    <TextField sx={{ marginTop: 1 }} label="Text2" name="basic.text2" value="default" />
                    <FormControlLabel name="basic.checkbox" value={true} label="Checkbox" control={<Checkbox />} />
                    <FormControlLabel name="basic.switch" value={true} label="Switch" control={<Switch />} />
                    <Autocomplete
                        // @ts-expect-error FIXME
                        name="basic.autocomplete"
                        labels={{
                            title: 'Autocomplete',
                        }}
                        options={[
                            { label: 'Onet', id: 1 },
                            { label: 'Fakt', id: 2 },
                            { label: 'Komputer świat', id: 3 },
                            { label: 'Newsweek', id: 4 },
                            { label: 'Forbes', id: 5 },
                            { label: 'Business insider', id: 6 },
                        ]}
                        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
                        renderInput={(params: any): ReactNode => <TextField {...params} label="Autocomplete" />}
                    />
                </Accordion>
                <Accordion label="Radio">
                    <RadioGroup name="radio" value="opt1">
                        <FormControlLabel value="opt1" label="Option 1" control={<Radio />} />
                        <FormControlLabel value="opt2" label="Option 2" control={<Radio />} />
                    </RadioGroup>
                </Accordion>
                <Accordion label="Select">
                    <FormControlLabel
                        name="select"
                        value={10}
                        label="units"
                        control={
                            <Select>
                                <MenuItem value={10}>Ten</MenuItem>
                                <MenuItem value={20}>Twenty</MenuItem>
                                <MenuItem value={30}>Thirty</MenuItem>
                            </Select>
                        }
                    />
                </Accordion>
                <Accordion label="Slider">
                    <Slider name="slider" valueLabelDisplay="auto" max={10} step={1} value={1} />
                </Accordion>
                {customCode && (
                    <Accordion label="Custom Code" defaultExpanded={false}>
                        <TextField
                            label="Code Preview"
                            multiline={true}
                            rows={8}
                            value={customCode}
                            disabled={true}
                            sx={{
                                width: '100%',
                                '& .MuiInputBase-input': {
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                },
                            }}
                        />
                    </Accordion>
                )}
            </FiltersWrapper>
        </ThemeConfig>
    );
};

export const searchBarChildren = [
    <SplitButton key={1} size="small" actions={[{ label: 'Action', onClick: action('SearchBar: Action clicked') }]} />,
    <SplitButton
        key={2}
        size="small"
        actions={[
            {
                label: 'Main Action',
                onClick: action('SearchBar: Main Action clicked'),
                disabled: false,
            },
            {
                label: 'Additional Action 1',
                onClick: action('SearchBar: Additional Action 1 clicked'),
                icon: <RocketLaunch />,
            },
        ]}
    />,
];

export const searchBarMenuActions = [
    { label: 'Edit', icon: <EditOutlined />, onClick: action('SearchBar Menu: Edit clicked') },
    { label: 'Delete', icon: <DeleteOutline />, onClick: action('SearchBar Menu: Delete clicked') },
];

interface DetailProps {
    selectedMultimediaItem?: Record<string, unknown> | null;
    detailData?: { title?: { imageUrl?: string; label?: string } } | null;
    onCloseClick?: () => void;
}

export const Detail: React.FC<DetailProps> = ({
    selectedMultimediaItem = null,
    detailData = null,
    onCloseClick = (): void => {
        /* noop */
    },
}) => {
    return (
        <RingDetail
            empty={selectedMultimediaItem === null && !detailData}
            main={{
                mediaProps: {
                    bottomIcons: [
                        {
                            icon: <InfoOutlined />,
                            onClick: action('Detail: Info button clicked'),
                            tooltip: 'Info',
                        },
                        {
                            icon: <EditOutlined />,
                            onClick: action('Detail: Edit button clicked'),
                            tooltip: 'Edit',
                        },
                    ],
                    imageFullScreenPreview: true,
                    image: selectedMultimediaItem
                        ? (selectedMultimediaItem?.image as string) ||
                          'https://ocdn.eu/pulscms-transforms/1/vKzktkuTURBXy9lMTY1ZTU0Zi00YTg4LTRmNWQtYWYwZi0xOTUzM2U4MmY4Y2YuanBlZ5GVAs0CigDDww'
                        : detailData?.title?.imageUrl,
                    objectFit: 'cover',
                },
                title: {
                    value: selectedMultimediaItem
                        ? (selectedMultimediaItem?.title as string) || 'Multimedia Item'
                        : detailData?.title?.label || 'Title',
                    onSubmit: function cb(): Promise<boolean> {
                        action('Detail: Title submitted')();

                        return new Promise((resolve) => {
                            resolve(true);
                        });
                    },
                    label: 'Title',
                },
                onCloseClick,
            }}
            descriptionItems={[
                {
                    sectionTitle: selectedMultimediaItem ? 'MULTIMEDIA DETAILS' : 'SECTION ONE',
                    fields: selectedMultimediaItem
                        ? [
                              {
                                  name: 'EDITORIAL SCORE',
                                  value:
                                      (selectedMultimediaItem?.fields as Array<{ value: string }>)?.[0]?.value ||
                                      'No score',
                              },
                              {
                                  name: 'MODIFIED',
                                  value:
                                      (selectedMultimediaItem?.fields as Array<{ value: string }>)?.[1]?.value ||
                                      'Unknown',
                              },
                              {
                                  name: 'AUTHOR',
                                  value:
                                      (selectedMultimediaItem?.fields as Array<{ value: string }>)?.[2]?.value ||
                                      'Unknown',
                              },
                              {
                                  name: 'SOURCE',
                                  value:
                                      (selectedMultimediaItem?.fields as Array<{ value: string }>)?.[3]?.value ||
                                      'Unknown',
                              },
                          ]
                        : [
                              {
                                  name: 'DESCRIPTION',
                                  type: DetailDescriptionItemFieldType.DESCRIPTION,
                                  maxLength: 100,
                                  layout: DetailDescriptionItemFieldLayout.VERTICAL,
                                  showMoreLabel: 'Show more',
                                  showLessLabel: 'Show less',
                                  value:
                                      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore' +
                                      ' magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
                                      ' consequat.',
                              },
                              {
                                  icon: <Public />,
                                  name: 'WITH ICON',
                                  value: 'Published',
                              },
                              {
                                  formatDate: true,
                                  name: 'DATE FORMATTED',
                                  value: '2023-07-27T09:32:09Z',
                              },
                              {
                                  formatDate: false,
                                  name: 'DATE NOT FORMATTED',
                                  value: '2023-08-31T21:59:59Z',
                              },
                              {
                                  name: 'EDITABLE',
                                  value: 'Editable value',
                                  type: DetailDescriptionItemFieldType.EDITABLE,
                                  onSubmit: function cb(): Promise<boolean> {
                                      action('Detail: Editable field submitted')();

                                      return new Promise((resolve) => {
                                          resolve(true);
                                      });
                                  },
                              },
                          ],
                },
            ]}
        />
    );
};

// Grid Mode Toggle Component
export interface GridModeToggleProps {
    gridMode: 'dataGrid' | 'multimediaGrid';
    onGridModeChange: (mode: 'dataGrid' | 'multimediaGrid') => void;
}

export const GridModeToggle: React.FC<GridModeToggleProps> = ({ gridMode, onGridModeChange }) => {
    const handleToggle = (): void => {
        const newMode = gridMode === 'dataGrid' ? 'multimediaGrid' : 'dataGrid';
        onGridModeChange(newMode);
    };

    return (
        <IconButton
            onClick={handleToggle}
            title={gridMode === 'dataGrid' ? 'Switch to MultimediaGrid' : 'Switch to DataGrid'}
            size="medium"
        >
            {gridMode === 'dataGrid' ? <GridViewOutlined /> : <TableRows />}
        </IconButton>
    );
};

// Dynamic Grid Additional Component
export interface DynamicGridAdditionalComponentProps {
    enabled: boolean;
    gridMode: 'dataGrid' | 'multimediaGrid';
    onGridModeChange: (mode: 'dataGrid' | 'multimediaGrid') => void;
    onAction?: (actionName: string, data?: unknown) => void;
}

export const DynamicGridAdditionalComponent: React.FC<DynamicGridAdditionalComponentProps> = ({
    enabled,
    gridMode,
    onGridModeChange,
    onAction,
}) => {
    if (!enabled) {
        return null;
    }

    return (
        <GridModeToggle
            gridMode={gridMode}
            onGridModeChange={(mode): void => {
                onAction?.('GridModeToggle: Mode changed', mode);
                onGridModeChange(mode);
            }}
        />
    );
};

// Additional Component wrapper for easier use
export interface AdditionalComponentProps {
    enableDynamicMultimediaGrid: boolean;
    gridMode: 'dataGrid' | 'multimediaGrid';
    onGridModeChange: (mode: 'dataGrid' | 'multimediaGrid') => void;
    onAction?: (actionName: string, data?: unknown) => void;
}

export const AdditionalComponent: React.FC<AdditionalComponentProps> = ({
    enableDynamicMultimediaGrid,
    gridMode,
    onGridModeChange,
    onAction,
}) => {
    if (!enableDynamicMultimediaGrid) {
        return null;
    }

    return (
        <DynamicGridAdditionalComponent
            enabled={enableDynamicMultimediaGrid}
            gridMode={gridMode}
            onGridModeChange={onGridModeChange}
            onAction={onAction}
        />
    );
};
