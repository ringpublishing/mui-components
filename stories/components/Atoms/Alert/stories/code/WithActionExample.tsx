import { Alert } from '@ringpublishing/mui-components';

const handleActionClick = (): void => undefined;

export default function WithActionExample(): React.JSX.Element {
    return (
        <Alert
            title="Alert title"
            description="This is an alert description."
            action={{ label: 'Action', onClick: handleActionClick }}
        />
    );
}
