import { Eye, Trash2 } from 'lucide-react';
import { MediaCard, RingLucideIcon } from '@ringpublishing/mui-components';
import { getImagePath, TestImage, ImageSize } from 'RingDemoImages';

export default function MediaCardFlagExample(): React.JSX.Element {
    // The flag is a status label, not a chip laid on top of the image.
    // MediaCard renders it 16px tall with a 4px radius — the design geometry.
    return (
        <MediaCard
            title="Title / name"
            image={getImagePath(TestImage.NEONS, ImageSize.MEDIUM)}
            ratio="4/3"
            objectFit="cover"
            sx={{ width: 240 }}
            statusLabels={[{ label: 'AI', color: 'ai' }]}
            fields={[{ value: 'Owner/License' }, { value: 'Author/Source' }]}
            actions={[
                { label: 'Preview', icon: <RingLucideIcon icon={Eye} /> },
                { label: 'Delete', icon: <RingLucideIcon icon={Trash2} /> },
            ]}
        />
    );
}
