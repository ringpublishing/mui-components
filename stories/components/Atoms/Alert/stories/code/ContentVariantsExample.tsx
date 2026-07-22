import { Stack } from '@mui/material';

import { Alert } from '@ringpublishing/mui-components';

export default function ContentVariantsExample(): React.JSX.Element {
    return (
        <Stack spacing={2}>
            <Alert title="Title only" />
            <Alert description="Description only" />
            <Alert title="Title and description" description="Description under the title" />
        </Stack>
    );
}
