import React, { useRef, useState } from 'react';
import { FileUploader, FileUploaderStatus, type FileUploaderFile } from '@ringpublishing/mui-components';

/*
 * FileUploader shows what you pass in `files` — it never uploads by itself. The loop is always the same:
 * 1. `onFilesSelected` — add a row per file with status `Uploading` and start your request.
 * 2. While it runs, update the row's `progress` (0–100).
 * 3. When it settles, mark the row `Success`, or `Error` with an `errorMessage`; `onRetry` restarts it.
 * 4. `onRemove` — drop the row and cancel its request.
 */

// Stand-in for your upload request (fetch, XHR, a multipart upload): reports progress, then settles.
function upload(file: File, onProgress: (percent: number) => void): { done: Promise<void>; cancel: () => void } {
    let percent = 0;
    let timer = 0;
    const done = new Promise<void>((resolve) => {
        timer = window.setInterval((): void => {
            percent = Math.min(100, percent + 10);
            onProgress(percent);

            if (percent === 100) {
                window.clearInterval(timer);
                resolve();
            }
        }, 200);
    });

    return { done, cancel: (): void => window.clearInterval(timer) };
}

export default function HowToWireItExample(): React.JSX.Element {
    const [files, setFiles] = useState<FileUploaderFile[]>([]);
    const requests = useRef(new Map<string, () => void>());

    const updateRow = (id: string, patch: Partial<FileUploaderFile>): void =>
        setFiles((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

    const start = (id: string, file: File): void => {
        updateRow(id, { status: FileUploaderStatus.Uploading, progress: 0, errorMessage: undefined });
        const request = upload(file, (progress) => updateRow(id, { progress }));

        requests.current.set(id, request.cancel);
        request.done.then(
            () => updateRow(id, { status: FileUploaderStatus.Success, progress: 100 }),
            () => updateRow(id, { status: FileUploaderStatus.Error, errorMessage: 'Upload failed. Try again.' }),
        );
    };

    const handleFilesSelected = (selected: File[]): void => {
        const rows = selected.map((file): FileUploaderFile => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            status: FileUploaderStatus.Uploading,
            progress: 0,
            showRemove: true,
        }));

        setFiles((current) => [...current, ...rows]);
        rows.forEach((row) => row.file && start(row.id, row.file));
    };

    const handleRemove = (id: string): void => {
        requests.current.get(id)?.();
        setFiles((rows) => rows.filter((row) => row.id !== id));
    };

    const handleRetry = (id: string): void => {
        const row = files.find((candidate) => candidate.id === id);

        if (row?.file) {
            start(id, row.file);
        }
    };

    return (
        <FileUploader
            headline="Attachments"
            multiple={true}
            labels={{
                dropzone: 'Drag and drop files to add or',
                uploadButton: 'Choose files',
                hint: 'Any file, any size — this example uploads nothing',
            }}
            files={files}
            onFilesSelected={handleFilesSelected}
            onRemove={handleRemove}
            onRetry={handleRetry}
            sx={{ maxWidth: 560 }}
        />
    );
}
