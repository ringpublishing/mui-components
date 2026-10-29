import React, { useRef, useState } from 'react';
import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import { Image } from 'lucide-react';
import {
    FileUploader,
    FileUploaderStatus,
    type FileUploaderFile,
    type FileUploaderRejection,
} from '@ringpublishing/mui-components';

const MB = 1024 * 1024;
const MAX_SIZE = 50 * MB;

// Photos already in the media library, attached without an upload — they show as idle rows.
const LIBRARY_PICKS = [
    { name: 'parliament-vote-press-gallery.jpg', size: 6.2 * MB },
    { name: 'vistula-boulevards-at-dusk.jpg', size: 4.8 * MB },
];

// Stand-in for the upload to the media library: reports progress, then settles. Bigger photos take longer.
function upload(
    file: File,
    onProgress: (percent: number) => void,
    failAt?: number,
): { done: Promise<void>; cancel: () => void } {
    const step = Math.max(3, 14 - Math.round(file.size / (4 * MB)));
    let percent = 0;
    let timer = 0;
    const done = new Promise<void>((resolve, reject) => {
        timer = window.setInterval((): void => {
            percent = Math.min(100, percent + step);

            if (failAt !== undefined && percent >= failAt) {
                window.clearInterval(timer);
                reject(new Error('Connection lost'));

                return;
            }

            onProgress(percent);

            if (percent === 100) {
                window.clearInterval(timer);
                resolve();
            }
        }, 180);
    });

    return { done, cancel: (): void => window.clearInterval(timer) };
}

export default function ArticlePhotosExample(): React.JSX.Element {
    const [photos, setPhotos] = useState<FileUploaderFile[]>([
        {
            id: 'library-cover',
            name: 'opening-night-national-theatre.jpg',
            size: 3.1 * MB,
            showRemove: true,
            icon: <Image />,
        },
    ]);
    const [rejection, setRejection] = useState<string>();
    // Demo only: the next photo you add loses its connection halfway, so you can try the retry.
    const [dropConnection, setDropConnection] = useState(false);
    const requests = useRef(new Map<string, () => void>());

    const updatePhoto = (id: string, patch: Partial<FileUploaderFile>): void =>
        setPhotos((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

    const start = (id: string, file: File, failAt?: number): void => {
        updatePhoto(id, { status: FileUploaderStatus.Uploading, progress: 0, errorMessage: undefined });
        const request = upload(file, (progress) => updatePhoto(id, { progress }), failAt);

        requests.current.set(id, request.cancel);
        request.done.then(
            () => updatePhoto(id, { status: FileUploaderStatus.Success, progress: 100 }),
            () =>
                updatePhoto(id, { status: FileUploaderStatus.Error, errorMessage: 'Upload interrupted — try again.' }),
        );
    };

    // `accept` and `maxFileSize` pass only photos up to 50 MB; the rest of the same drop arrives in `onFilesRejected`.
    const handleFilesSelected = (accepted: File[]): void => {
        setRejection(undefined);

        const rows = accepted.map((file): FileUploaderFile => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            status: FileUploaderStatus.Uploading,
            progress: 0,
            showRemove: true,
            icon: <Image />,
        }));

        setPhotos((current) => [...current, ...rows]);
        rows.forEach(
            (row, index) => row.file && start(row.id, row.file, dropConnection && index === 0 ? 50 : undefined),
        );
        setDropConnection(false);
    };

    const handleFilesRejected = (rejections: FileUploaderRejection[]): void =>
        setRejection(
            `Not added: ${rejections.map(({ file }) => file.name).join(', ')} — use JPG, PNG or TIFF up to 50 MB.`,
        );

    const addFromLibrary = (): void => {
        setPhotos((current) => [
            ...current,
            ...LIBRARY_PICKS.filter((pick) => !current.some((row) => row.name === pick.name)).map(
                (pick): FileUploaderFile => ({
                    id: `library-${pick.name}`,
                    ...pick,
                    showRemove: true,
                    icon: <Image />,
                }),
            ),
        ]);
    };

    return (
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 640 }}>
            <FileUploader
                headline="Photos for the article"
                multiple={true}
                labels={{
                    description:
                        'Upload new photos or pick them from the media library. Each one is credited to the article.',
                    dropzone: 'Drag and drop photos to add or',
                    uploadButton: 'Choose photos',
                    hint: 'JPG, PNG or TIFF, up to 50 MB each',
                    filesUploaded: '{uploaded} of {total} photos ready',
                }}
                accept="image/jpeg,image/png,image/tiff,.jpg,.jpeg,.png,.tif,.tiff"
                maxFileSize={MAX_SIZE}
                errorMessage={rejection}
                action={
                    <Button variant="outlined" onClick={addFromLibrary}>
                        From the media library
                    </Button>
                }
                files={photos}
                onFilesSelected={handleFilesSelected}
                onFilesRejected={handleFilesRejected}
                onRetry={(id): void => {
                    const photo = photos.find((row) => row.id === id);

                    if (photo?.file) {
                        start(id, photo.file);
                    }
                }}
                onRemove={(id): void => {
                    requests.current.get(id)?.();
                    setPhotos((rows) => rows.filter((row) => row.id !== id));
                }}
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={dropConnection}
                        onChange={(event): void => setDropConnection(event.target.checked)}
                    />
                }
                label="Demo: the next photo you add drops its connection halfway"
            />
        </Stack>
    );
}
