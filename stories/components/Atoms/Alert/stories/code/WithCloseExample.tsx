import { Alert } from '@ringpublishing/mui-components';

export default function WithCloseExample(): React.JSX.Element {
    return <Alert title="Alert title" description="This is an alert description." onClose={(): void => undefined} />;
}
