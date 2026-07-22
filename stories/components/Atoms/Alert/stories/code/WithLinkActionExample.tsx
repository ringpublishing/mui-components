import { Alert } from '@ringpublishing/mui-components';

export default function WithLinkActionExample(): React.JSX.Element {
    return (
        <Alert
            title="Alert title"
            description="This is an alert description."
            action={{
                label: 'Open docs',
                href: 'https://example.com',
                buttonProps: {
                    target: '_blank',
                    rel: 'noreferrer noopener',
                },
            }}
        />
    );
}
