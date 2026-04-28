import React from 'react';
import {
    IconButton,
    Box,
    Alert,
    TextField,
    Tooltip,
    Typography,
    Switch,
    FormHelperText,
    Stack,
    Button,
} from '@mui/material';
import { RocketLaunch, RemoveDone, Delete, Crop, Add, PeopleAltOutlined, PhotoOutlined } from '@mui/icons-material';
import { ContentList, Media } from '@ringpublishing/mui-components';

const BasicInfoComponent = () => {
    return (
        <Stack spacing={1}>
            <Box>
                <TextField
                    label="Basic info"
                    fullWidth={true}
                    helperText="This name will be visible on author's pages and articles."
                />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <TextField
                    label="Disambiguation"
                    fullWidth={true}
                    helperText="Use this field when the author name is already taken. This will help you easily distinguish similarly named authors."
                />
                <Tooltip title="Delete">
                    <IconButton>
                        <RemoveDone />
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

const ImageComponent = () => {
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
                        onClick: () => console.log('Crop clicked'),
                        icon: <Crop />,
                    },
                    {
                        label: 'Delete',
                        onClick: () => console.log('Delete clicked'),
                        icon: <Delete />,
                    },
                ]}
            />
        </Stack>
    );
};

const SocialProfilesComponent = () => {
    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextField fullWidth={true} label="Facebook" onChange={() => console.log('Facebook changed')} />
                <Tooltip title="Delete profile">
                    <IconButton onClick={() => console.log('Delete Facebook')}>
                        <Delete />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextField fullWidth={true} label="Instagram" onChange={() => console.log('Instagram changed')} />
                <Tooltip title="Delete profile">
                    <IconButton onClick={() => console.log('Delete Instagram')}>
                        <Delete />
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
                    <RocketLaunch sx={{ mr: 2 }} />
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
                    additionalHeaderData: <PeopleAltOutlined />,
                    children: <BasicInfoComponent />,
                },
                {
                    header: 'Image',
                    additionalHeaderData: <PhotoOutlined />,
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
                        <Button onClick={() => console.log('Add profile clicked')} variant="text">
                            <Add />
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
