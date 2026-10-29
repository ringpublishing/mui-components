import { LockOpen, UserRound } from 'lucide-react';
import { MediaCard, RingLucideIcon } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function StatusLabelBackingExample(): React.JSX.Element {
    // Every status label is a tag: an opaque plate with a border. The AI flag paints its
    // gradient tint over the paper base; `secondary` and `default` render as the grey `stone` tag.
    return (
        <MediaCard
            title="Title / name"
            image={getImagePath(TestImage.NEONS, ImageSize.MEDIUM)}
            ratio="4/3"
            objectFit="cover"
            sx={{ width: 240 }}
            statusLabels={[
                { label: 'AI', color: 'ai', key: 'ai' },
                { label: 'Inactive', color: 'secondary', key: 'inactive' },
                { label: 'J. Doe', color: 'secondary', icon: <RingLucideIcon icon={UserRound} />, key: 'owner' },
                { label: 'Locked', color: 'error', icon: <RingLucideIcon icon={LockOpen} />, key: 'locked' },
                { label: 'Default', color: 'default', key: 'default' },
            ]}
        />
    );
}
