import { Stack } from '@mui/material';

import { Alert } from '@ringpublishing/mui-components';

export default function SeveritiesExample(): React.JSX.Element {
    const handleActionClick = (): void => undefined;

    return (
        <Stack spacing={2}>
            <Alert
                severity="info"
                title="Info"
                description="Info description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                severity="success"
                title="Success"
                description="Success description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                severity="warning"
                title="Warning"
                description="Warning description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                severity="error"
                title="Error"
                description="Error description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
        </Stack>
    );
}
