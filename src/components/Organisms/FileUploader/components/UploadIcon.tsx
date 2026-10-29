import React from 'react';
import { FileUp } from 'lucide-react';
import type { RingFileUploaderSize } from '@ringpublishing/mui-theme';
import { FeaturedIcon, type FeaturedIconSize } from '../../../Atoms/FeaturedIcon/FeaturedIcon.js';

const ICON_SIZE: Record<RingFileUploaderSize, Exclude<FeaturedIconSize, 'inherit'>> = {
    small: 'small',
    medium: 'medium',
    large: 'large',
};

interface UploadIconProps {
    isError: boolean;
    isDragging: boolean;
    size: RingFileUploaderSize;
    dataTestId: string;
}

export function UploadIcon({ isError, isDragging, size, dataTestId }: UploadIconProps): React.JSX.Element {
    return (
        <FeaturedIcon
            icon={FileUp}
            size={ICON_SIZE[size]}
            color={isDragging ? 'primary' : isError ? 'error' : 'default'}
            dataTestId={dataTestId}
        />
    );
}
