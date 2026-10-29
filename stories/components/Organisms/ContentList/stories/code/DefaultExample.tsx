import React from 'react';
import { IconButton, Box, Alert, TextField, Tooltip, Typography, FormHelperText, Stack, Button } from '@mui/material';
import { Rocket, Undo2, Trash2, Crop, Plus, Users, Image } from 'lucide-react';
import { ContentList, Media, RingLucideIcon, Switch } from '@ringpublishing/mui-components';

// The row action sits beside the field, so `alignItems: 'center'` would centre it on the whole
// FormControl — label and helper included — and drift with the helper's line count. The label is in
// flow (20px) above a 40px input, so a 36px button meets the input's centre 22px down.
const FIELD_ACTION_OFFSET = '22px';

const BasicInfoComponent = (): React.JSX.Element => {
    return (
        <Stack spacing={1}>
            <Box>
                <TextField
                    label="Basic info"
                    fullWidth={true}
                    helperText="This name will be visible on author's pages and articles."
                />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <TextField
                    label="Disambiguation"
                    fullWidth={true}
                    helperText="Use this field when the author name is already taken. This will help you easily distinguish similarly named authors."
                />
                <Tooltip title="Undo">
                    <IconButton sx={{ marginTop: FIELD_ACTION_OFFSET }}>
                        <Undo2 />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Active</Typography>
                    <Switch />
                </Box>
                <FormHelperText>Include in suggestions</FormHelperText>
            </Box>
        </Stack>
    );
};

const ImageComponent = (): React.JSX.Element => {
    return (
        <Stack spacing={1}>
            <Typography>Here you can change your image</Typography>
            <Media
                sx={{ maxWidth: '400px' }}
                image="https://example.com/image.jpg"
                type="Image"
                ratio={'16/9'}
                actions={[
                    {
                        label: 'Crop',
                        onClick: (): void => undefined,
                        icon: <Crop />,
                    },
                    {
                        label: 'Delete',
                        onClick: (): void => undefined,
                        icon: <Trash2 />,
                    },
                ]}
            />
        </Stack>
    );
};

const SocialProfilesComponent = (): React.JSX.Element => {
    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <TextField fullWidth={true} label="Facebook" onChange={(): void => undefined} />
                <Tooltip title="Delete profile">
                    <IconButton sx={{ marginTop: FIELD_ACTION_OFFSET }} onClick={(): void => undefined}>
                        <Trash2 />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <TextField fullWidth={true} label="Instagram" onChange={(): void => undefined} />
                <Tooltip title="Delete profile">
                    <IconButton sx={{ marginTop: FIELD_ACTION_OFFSET }} onClick={(): void => undefined}>
                        <Trash2 />
                    </IconButton>
                </Tooltip>
            </Box>
        </Stack>
    );
};

export default function DefaultExample(): React.JSX.Element {
    return (
        <ContentList
            listHeader={
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <RingLucideIcon icon={Rocket} sx={{ mr: 2 }} />
                    <Typography variant="h6">List header slot example</Typography>
                </Box>
            }
            inputData={[
                {
                    header: 'Basic info',
                    beforeHeaderContent: (
                        <Box sx={{ maxWidth: '640px', margin: '0 auto' }}>
                            <Alert severity="info">There are unpublished changes</Alert>
                        </Box>
                    ),
                    additionalHeaderData: <RingLucideIcon icon={Users} fontSize="small" />,
                    children: <BasicInfoComponent />,
                },
                {
                    header: 'Image',
                    additionalHeaderData: <RingLucideIcon icon={Image} fontSize="small" />,
                    children: <ImageComponent />,
                },
                {
                    header: 'Section with text',
                    children: (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repudiandae harum facere commodi
                            sed. Veritatis qui sunt ullam repellendus fuga eligendi deleniti animi quibusdam. Animi
                            quasi facere inventore laudantium pariatur aperiam. Consectetur illum itaque expedita
                            eveniet repudiandae eaque dolorum temporibus officiis aliquam maxime, ducimus esse soluta.
                            Officia dicta ipsam earum voluptatibus ipsa unde asperiores. Corrupti est voluptate a.
                            Perspiciatis, harum assumenda?
                        </Box>
                    ),
                },
                {
                    header: 'Social profiles',
                    children: <SocialProfilesComponent />,
                    additionalHeaderData: <span style={{ width: '24px' }}>2</span>,
                    contentHeaderAction: (
                        <Button onClick={(): void => undefined} variant="text">
                            <Plus />
                            Add profile
                        </Button>
                    ),
                },
                {
                    header: 'Empty section',
                    children: (
                        <div
                            style={{ height: '400px', width: '100%', border: '1px solid lightgray', marginTop: '20px' }}
                        />
                    ),
                },
                {
                    header: 'Section with another text',
                    children: (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repudiandae harum facere commodi
                            sed. Veritatis qui sunt ullam repellendus fuga eligendi deleniti animi quibusdam. Animi
                            quasi facere inventore laudantium pariatur aperiam. Consectetur illum itaque expedita
                            eveniet repudiandae eaque dolorum temporibus officiis aliquam maxime, ducimus esse soluta.
                            Officia dicta ipsam earum voluptatibus ipsa unde asperiores. Corrupti est voluptate a.
                            Perspiciatis, harum assumenda?
                        </Box>
                    ),
                },
            ]}
        />
    );
}
