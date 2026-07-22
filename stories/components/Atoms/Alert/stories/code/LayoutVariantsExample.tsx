import { Stack } from '@mui/material';

import { Alert } from '@ringpublishing/mui-components';

export default function LayoutVariantsExample(): React.JSX.Element {
    const handleActionClick = (): void => undefined;

    return (
        <Stack spacing={2}>
            <Alert
                layoutVariant="outline"
                actionsPlacement="right"
                title="Outline right"
                description="Description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                layoutVariant="outline"
                actionsPlacement="bottom"
                title="Outline bottom"
                description="Description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                layoutVariant="inline"
                actionsPlacement="right"
                title="Inline right"
                description="Description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
            <Alert
                layoutVariant="inline"
                actionsPlacement="bottom"
                title="Inline bottom"
                description="Description"
                action={{ label: 'Label', onClick: handleActionClick }}
                onClose={(): void => undefined}
            />
        </Stack>
    );
}
