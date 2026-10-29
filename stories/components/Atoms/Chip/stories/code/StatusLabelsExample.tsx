import { LockOpen } from 'lucide-react';
import { MediaCard, RingLucideIcon } from '@ringpublishing/mui-components';
import { getImagePath, ImageSize, TestImage } from 'RingDemoImages';

export default function StatusLabelsExample(): React.JSX.Element {
    // A status label is the chip's tag variant laid over the image: `error` (the default colour)
    // and `success` as their tags, `secondary` and `default` as the grey `stone` tag.
    // A label is at most 40% of the card wide; a longer text is cut with an ellipsis, so give
    // it the full text in `tip` — the Ring tooltip, shown on hover.
    return (
        <MediaCard
            title="Title / name"
            image={getImagePath(TestImage.NEONS, ImageSize.MEDIUM)}
            ratio="4/3"
            objectFit="cover"
            sx={{ width: 240 }}
            statusLabels={[
                {
                    label: 'Locked by Jan Zatrzymałowski',
                    tip: 'Locked by Jan Zatrzymałowski',
                    color: 'error',
                    icon: <RingLucideIcon icon={LockOpen} />,
                    key: 'locked',
                },
                { label: 'Published', color: 'success', key: 'published' },
                { label: 'Inactive', color: 'secondary', key: 'inactive' },
                { label: 'Default', color: 'default', key: 'default' },
            ]}
        />
    );
}
