import { Button, Typography, type ButtonProps, type TypographyProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { RingFileUploaderClassKey, RingFileUploaderOwnerState } from '@ringpublishing/mui-theme';

import {
    createRingSlotStyle,
    type RingSlot,
    type RingSlotOwnerStateProps,
} from '../../../../helpers/ringComponentSlots.js';

/*
 * Every part of the FileUploader is a slot of `RingFileUploader`. Its base style is the theme's
 * `theme.ringComponents.RingFileUploader[slot]`; what an application sets in
 * `theme.components.RingFileUploader.styleOverrides[slot]` is layered on top by MUI.
 */
const name = 'RingFileUploader';

type OwnerStateProps = RingSlotOwnerStateProps<RingFileUploaderOwnerState>;
type Slot<P> = RingSlot<P, RingFileUploaderOwnerState>;

const fromTheme = createRingSlotStyle<RingFileUploaderClassKey, RingFileUploaderOwnerState>(name);

export const FileUploaderRoot = styled('div', { name, slot: 'Root' })<OwnerStateProps>(fromTheme('root'));
export const FileUploaderHeader = styled('div', { name, slot: 'Header' })<OwnerStateProps>(fromTheme('header'));

export const Dropzone = styled('div', { name, slot: 'Dropzone' })<OwnerStateProps>(fromTheme('dropzone'));
export const DropzoneBody = styled('div', { name, slot: 'DropzoneBody' })<OwnerStateProps>(fromTheme('dropzoneBody'));
export const DropzoneText = styled('div', { name, slot: 'DropzoneText' })<OwnerStateProps>(fromTheme('dropzoneText'));
export const DropzoneLinkGroup = styled('span', { name, slot: 'DropzoneLinkGroup' })<OwnerStateProps>(
    fromTheme('dropzoneLinkGroup'),
);
export const HintIcon = styled('span', { name, slot: 'HintIcon' })<OwnerStateProps>(fromTheme('hintIcon'));
export const DropzoneActions = styled('div', { name, slot: 'DropzoneActions' })<OwnerStateProps>(
    fromTheme('dropzoneActions'),
);

export const UrlSection = styled('div', { name, slot: 'UrlSection' })<OwnerStateProps>(fromTheme('urlSection'));
export const UrlRow = styled('div', { name, slot: 'UrlRow' })<OwnerStateProps>(fromTheme('urlRow'));
export const UrlSubmit: Slot<ButtonProps> = styled(Button, { name, slot: 'UrlSubmit' })<OwnerStateProps>(
    fromTheme('urlSubmit'),
);

export const FilesCounter: Slot<ButtonProps> = styled(Button, { name, slot: 'FilesCounter' })<OwnerStateProps>(
    fromTheme('filesCounter'),
);
export const FileList = styled('div', { name, slot: 'FileList' })<OwnerStateProps>(fromTheme('fileList'));

export const FileItemRoot = styled('div', { name, slot: 'FileItem' })<OwnerStateProps>(fromTheme('fileItem'));
export const FileThumbnail = styled('div', { name, slot: 'FileThumbnail' })<OwnerStateProps>(
    fromTheme('fileThumbnail'),
);
export const FileContent = styled('div', { name, slot: 'FileContent' })<OwnerStateProps>(fromTheme('fileContent'));
export const FileName: Slot<TypographyProps> = styled(Typography, { name, slot: 'FileName' })<OwnerStateProps>(
    fromTheme('fileName'),
);
export const FileMeta: Slot<TypographyProps> = styled(Typography, { name, slot: 'FileMeta' })<OwnerStateProps>(
    fromTheme('fileMeta'),
);
export const FileMetaPercent = styled('span', { name, slot: 'FileMetaPercent' })<OwnerStateProps>(
    fromTheme('fileMetaPercent'),
);
export const FileMessage: Slot<TypographyProps> = styled(Typography, { name, slot: 'FileMessage' })<OwnerStateProps>(
    fromTheme('fileMessage'),
);
export const FileProgress = styled('div', { name, slot: 'FileProgress' })<OwnerStateProps>(fromTheme('fileProgress'));
export const FileActions = styled('div', { name, slot: 'FileActions' })<OwnerStateProps>(fromTheme('fileActions'));
export const FilePercent: Slot<TypographyProps> = styled(Typography, { name, slot: 'FilePercent' })<OwnerStateProps>(
    fromTheme('filePercent'),
);
