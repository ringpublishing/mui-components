import React, { useRef, useState } from 'react';
import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import {
    FileUploader,
    FileUploaderRejectionReason,
    FileUploaderStatus,
    type FileUploaderFile,
    type FileUploaderRejection,
} from '@ringpublishing/mui-components';

const MAX_SIZE = 500 * 1024 * 1024;

// What the editor reads when a file is not taken; the uploader says why through `onFilesRejected`.
const REJECTED: Record<FileUploaderRejectionReason, (name: string) => string> = {
    [FileUploaderRejectionReason.FileInvalidType]: (name) => `${name} is not an MP3 file.`,
    [FileUploaderRejectionReason.FileTooLarge]: (name) => `${name} is larger than 500 MB.`,
    [FileUploaderRejectionReason.TooManyFiles]: () => 'An episode has one audio file — add them one at a time.',
};

// Stand-in for the episode upload (a multipart upload in a real app): reports progress, then settles.
// `failAt` drops the connection at that percentage, so the error and the retry can be tried here.
function upload(
    file: File,
    onProgress: (percent: number) => void,
    failAt?: number,
): { done: Promise<void>; cancel: () => void } {
    let percent = 0;
    let timer = 0;
    const done = new Promise<void>((resolve, reject) => {
        timer = window.setInterval((): void => {
            percent = Math.min(100, percent + 4);

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
        }, 150);
    });

    return { done, cancel: (): void => window.clearInterval(timer) };
}

export default function PodcastEpisodeExample(): React.JSX.Element {
    const [episode, setEpisode] = useState<FileUploaderFile | null>(null);
    const [rejection, setRejection] = useState<string>();
    // Demo only: lets you see the failed upload and the retry.
    const [dropConnection, setDropConnection] = useState(false);
    const request = useRef<{ cancel: () => void } | null>(null);

    const updateEpisode = (patch: Partial<FileUploaderFile>): void =>
        setEpisode((current) => (current ? { ...current, ...patch } : current));

    const start = (file: File): void => {
        request.current?.cancel();
        setEpisode({
            id: `${file.name}-${file.lastModified}`,
            file,
            name: file.name,
            size: file.size,
            status: FileUploaderStatus.Uploading,
            progress: 0,
            showRemove: true,
        });

        const run = upload(file, (progress) => updateEpisode({ progress }), dropConnection ? 60 : undefined);

        // The demo drops only the next upload, so the retry goes through.
        setDropConnection(false);

        request.current = run;
        run.done.then(
            // Once uploaded, the file can be swapped for a new take without removing it first.
            () => updateEpisode({ status: FileUploaderStatus.Success, progress: 100, action: { label: 'Replace' } }),
            () =>
                updateEpisode({
                    status: FileUploaderStatus.Error,
                    errorMessage: 'The connection dropped. Your file is safe — try again.',
                }),
        );
    };

    // `accept` and `maxFileSize` let only an MP3 under 500 MB through; anything else arrives in `onFilesRejected`.
    const handleFilesSelected = ([file]: File[]): void => {
        setRejection(undefined);
        start(file);
    };

    const handleFilesRejected = ([{ file, reason }]: FileUploaderRejection[]): void =>
        setRejection(REJECTED[reason](file.name));

    return (
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 560 }}>
            <FileUploader
                headline="Episode audio"
                labels={{
                    description: 'The episode uploads as soon as you add it, so you can go on filling in its details.',
                    dropzone: 'Drag and drop the episode file or',
                    uploadButton: 'Choose a file',
                    hint: 'MP3, up to 500 MB',
                }}
                accept="audio/mpeg,.mp3"
                maxFileSize={MAX_SIZE}
                errorMessage={rejection}
                files={episode ? [episode] : []}
                onFilesSelected={handleFilesSelected}
                onFilesRejected={handleFilesRejected}
                onRetry={(): void => {
                    if (episode?.file) {
                        start(episode.file);
                    }
                }}
                onRemove={(): void => {
                    request.current?.cancel();
                    setEpisode(null);
                    setRejection(undefined);
                }}
            />
            {/* With a file in place the drop area is hidden, so a rejected replacement is explained below it. */}
            {episode && rejection && (
                <Typography variant="body2" color="error">
                    {rejection}
                </Typography>
            )}
            <FormControlLabel
                control={
                    <Switch
                        checked={dropConnection}
                        onChange={(event): void => setDropConnection(event.target.checked)}
                    />
                }
                label="Demo: the next upload drops its connection at 60%"
            />
        </Stack>
    );
}
