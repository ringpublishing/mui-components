import { vi, describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { Video } from 'lucide-react';
import { SvgIcon } from '@mui/material';
import { createTheme, ThemeProvider, type Theme } from '@mui/material/styles';
import { FileUploader } from '../../../src/components/Organisms/FileUploader/FileUploader.js';
import {
    FileUploaderRejectionReason,
    FileUploaderSize,
    FileUploaderStatus,
    FileUploaderFile,
} from '../../../src/components/Organisms/FileUploader/fileUploader.types.js';
import { renderWithTheme, WithRingThemeHOC } from '../../test-utils/theme.js';

describe('FileUploader Component', () => {
    const defaultProps = {
        labels: {
            dropzone: 'Drag and drop file here or',
            uploadButton: 'Browse file',
            hint: 'PDF, DOC (max. 10MB)',
        },
        maxFileSize: 10 * 1024 * 1024,
        accept: '.pdf,.doc,.docx',
    };

    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    it('should render correctly with default props', () => {
        const { container } = renderWithTheme(<FileUploader {...defaultProps} />);

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with Small size', () => {
        const { container } = renderWithTheme(<FileUploader {...defaultProps} size={FileUploaderSize.Small} />);

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with Medium size', () => {
        const { container } = renderWithTheme(<FileUploader {...defaultProps} size={FileUploaderSize.Medium} />);

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with Large size', () => {
        const { container } = renderWithTheme(<FileUploader {...defaultProps} size={FileUploaderSize.Large} />);

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with uploading file', () => {
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                size: mockFile.size,
                progress: 50,
                status: FileUploaderStatus.Uploading,
                uploadedBytes: 5 * 1024 * 1024,
            },
        ];

        const { container } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with completed file', () => {
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                size: mockFile.size,
                progress: 100,
                status: FileUploaderStatus.Completed,
            },
        ];

        const { container } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with error file', () => {
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                status: FileUploaderStatus.Error,
                errorMessage: 'Upload failed',
            },
        ];

        const { container } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);

        expect(container).toMatchSnapshot();
    });

    it('should render correctly with idle file', () => {
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'existing-file.pdf',
                size: 1024,
                status: FileUploaderStatus.Idle,
            },
        ];

        const { container } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);

        expect(container).toMatchSnapshot();
    });

    it('sizes a custom file icon with its own font size through the wrapper', () => {
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                status: FileUploaderStatus.Idle,
                icon: (
                    <SvgIcon data-testid="custom-file-icon">
                        <path d="M0 0h24v24H0z" />
                    </SvgIcon>
                ),
            },
        ];

        const { container } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);
        const icon = container.querySelector('[data-testid="custom-file-icon"]') as SVGElement;

        expect(getComputedStyle(icon.parentElement as HTMLElement).fontSize).toBe('1.5rem');
        expect(getComputedStyle(icon).width).toBe('1em');
        expect(getComputedStyle(icon).height).toBe('1em');
        expect(icon.parentElement?.className).toContain('RingFileUploader-fileThumbnail');
        expect(document.head.textContent).toContain('font-size:inherit!important');
    });

    it('styles a custom Lucide file icon through its wrapper', () => {
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                status: FileUploaderStatus.Idle,
                icon: <Video />,
            },
        ];

        const { container } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);
        const icon = container.querySelector('svg.lucide-video');

        expect(icon?.getAttribute('stroke')).toBe('currentColor');
        expect(icon?.parentElement?.className).toContain('RingFileUploader-fileThumbnail');
    });

    it('should count idle files as uploaded in files counter', () => {
        const files: FileUploaderFile[] = [
            { id: '1', name: 'done.pdf', status: FileUploaderStatus.Success },
            { id: '2', name: 'backend.pdf', status: FileUploaderStatus.Idle },
            { id: '3', name: 'uploading.pdf', status: FileUploaderStatus.Uploading, progress: 50 },
        ];
        const labels = {
            ...defaultProps.labels,
            filesUploaded: '{uploaded} of {total} files uploaded',
        };

        const { getByTestId } = renderWithTheme(
            <FileUploader {...defaultProps} files={files} multiple={true} labels={labels} />,
        );

        expect(getByTestId('ring-fileuploader-expand').textContent).toBe('2 of 3 files uploaded');
    });

    it('counts a file without a status as uploaded, as its row shows it idle', () => {
        const files: FileUploaderFile[] = [
            { id: '1', name: 'library.jpg' },
            { id: '2', name: 'new.jpg', status: FileUploaderStatus.Uploading, progress: 50 },
        ];
        const { getByTestId } = renderWithTheme(<FileUploader {...defaultProps} files={files} multiple={true} />);

        expect(getByTestId('ring-fileuploader-expand').textContent).toBe('1 of 2 files uploaded');
    });

    it('should call onFilesSelected when file input changes', () => {
        const onFilesSelected = vi.fn();
        const { container } = renderWithTheme(<FileUploader {...defaultProps} onFilesSelected={onFilesSelected} />);

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(input, { target: { files: [mockFile] } });

        expect(onFilesSelected).toHaveBeenCalledWith([mockFile]);
    });

    it('should call onRemove when remove button is clicked', () => {
        const onRemove = vi.fn();
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                status: FileUploaderStatus.Completed,
                progress: 100,
                showRemove: true,
            },
        ];

        const { container } = renderWithTheme(<FileUploader {...defaultProps} files={files} onRemove={onRemove} />);

        const removeButton = container.querySelector(
            'button[aria-label*="delete"], button svg[data-testid="DeleteOutlineOutlinedIcon"]',
        )?.parentElement;

        if (removeButton) {
            fireEvent.click(removeButton);
            expect(onRemove).toHaveBeenCalledWith('1');
        }
    });

    it('should render file with custom action button', () => {
        const onActionClick = vi.fn();
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                status: FileUploaderStatus.Completed,
                progress: 100,
                showProgressBar: false,
                action: {
                    label: 'View File',
                    onClick: onActionClick,
                },
            },
        ];

        const { getByText } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);

        const actionButton = getByText('View File');

        expect(actionButton).toBeDefined();
        fireEvent.click(actionButton);
        expect(onActionClick).toHaveBeenCalled();
    });

    it('should render file with action that opens file picker when onClick is not provided', () => {
        const onFilesSelected = vi.fn();
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                status: FileUploaderStatus.Completed,
                progress: 100,
                showProgressBar: false,
                action: {
                    label: 'Change File',
                },
            },
        ];

        const { getByText, container } = renderWithTheme(
            <FileUploader {...defaultProps} files={files} onFilesSelected={onFilesSelected} />,
        );

        const actionButton = getByText('Change File');
        fireEvent.click(actionButton);

        // Find the hidden file input created by action
        const inputs = container.querySelectorAll('input[type="file"]');
        const hiddenInput = Array.from(inputs).find(
            (input) => (input as HTMLElement).style.display === 'none',
        ) as HTMLInputElement;

        expect(hiddenInput).toBeDefined();

        // Simulate file selection
        if (hiddenInput) {
            fireEvent.change(hiddenInput, { target: { files: [mockFile] } });
            expect(onFilesSelected).toHaveBeenCalledWith([mockFile]);
        }
    });

    it('should hide remove button when showRemove is false', () => {
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                status: FileUploaderStatus.Completed,
                progress: 100,
                showRemove: false,
            },
        ];

        const { container } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);

        const removeButton = container.querySelector(
            'button[aria-label*="delete"], button svg[data-testid="DeleteOutlineOutlinedIcon"]',
        );

        expect(removeButton).toBeNull();
    });

    it('should render multiple files when multiple prop is true', () => {
        const files: FileUploaderFile[] = [
            {
                id: '1',
                name: 'test.pdf',
                status: FileUploaderStatus.Completed,
                progress: 100,
            },
            {
                id: '2',
                name: 'test2.pdf',
                status: FileUploaderStatus.Uploading,
                progress: 30,
            },
        ];

        const { container } = renderWithTheme(<FileUploader {...defaultProps} files={files} multiple={true} />);

        expect(container).toMatchSnapshot();
    });

    it('should render with error message', () => {
        const { container } = renderWithTheme(<FileUploader {...defaultProps} errorMessage="Invalid file type" />);

        expect(container).toMatchSnapshot();
    });

    describe('URL Upload Section', () => {
        it('should render URL upload section when enabled', () => {
            const { getByText, getByPlaceholderText } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    slotProps={{
                        urlUploadSection: {
                            enabled: true,
                            title: 'Upload from URL',
                            placeholder: 'Enter URL',
                            submitButton: 'Upload',
                        },
                    }}
                />,
            );

            expect(getByText('Upload from URL')).toBeDefined();
            expect(getByPlaceholderText('Enter URL')).toBeDefined();
            expect(getByText('Upload')).toBeDefined();
        });

        it('should call onSubmit with URL when submit button is clicked', () => {
            const onSubmit = vi.fn();
            const testUrl = 'https://example.com/file.pdf';

            const { getByPlaceholderText, getByText } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    slotProps={{
                        urlUploadSection: {
                            enabled: true,
                            placeholder: 'Enter URL',
                            submitButton: 'Upload',
                            onSubmit,
                        },
                    }}
                />,
            );

            const input = getByPlaceholderText('Enter URL') as HTMLInputElement;
            const submitButton = getByText('Upload');

            fireEvent.change(input, { target: { value: testUrl } });
            fireEvent.click(submitButton);

            expect(onSubmit).toHaveBeenCalledWith(testUrl);
        });

        it('should call onSubmit with URL when Enter key is pressed', () => {
            const onSubmit = vi.fn();
            const testUrl = 'https://example.com/file.pdf';

            const { getByPlaceholderText } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    slotProps={{
                        urlUploadSection: {
                            enabled: true,
                            placeholder: 'Enter URL',
                            onSubmit,
                        },
                    }}
                />,
            );

            const input = getByPlaceholderText('Enter URL') as HTMLInputElement;

            fireEvent.change(input, { target: { value: testUrl } });
            fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

            expect(onSubmit).toHaveBeenCalledWith(testUrl);
        });

        it('should call onClear and clear input when clear button is clicked', () => {
            const onClear = vi.fn();
            const testUrl = 'https://example.com/file.pdf';

            const { getByPlaceholderText, container } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    slotProps={{
                        urlUploadSection: {
                            enabled: true,
                            placeholder: 'Enter URL',
                            onClear,
                        },
                    }}
                />,
            );

            const input = getByPlaceholderText('Enter URL') as HTMLInputElement;

            // Type URL to show clear button
            fireEvent.change(input, { target: { value: testUrl } });
            expect(input.value).toBe(testUrl);

            // Find and click clear button (ClearOutlined icon)
            const clearButton = container.querySelector('button[aria-label="Clear URL"]') as HTMLButtonElement;

            if (clearButton) {
                fireEvent.click(clearButton);
                expect(onClear).toHaveBeenCalled();
                expect(input.value).toBe('');
            }
        });

        it('should disable input and button when loading is true', () => {
            const { getByPlaceholderText, getByText } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    slotProps={{
                        urlUploadSection: {
                            enabled: true,
                            placeholder: 'Enter URL',
                            submitButton: 'Upload',
                            loading: true,
                        },
                    }}
                />,
            );

            const input = getByPlaceholderText('Enter URL') as HTMLInputElement;
            const submitButton = getByText('Upload').closest('button') as HTMLButtonElement;

            expect(input.disabled).toBe(true);
            expect(submitButton.disabled).toBe(true);
        });

        it('should not render URL upload section when not enabled', () => {
            const { queryByText } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    slotProps={{
                        urlUploadSection: {
                            enabled: false,
                            title: 'Upload from URL',
                        },
                    }}
                />,
            );

            expect(queryByText('Upload from URL')).toBeNull();
        });
    });

    describe('File Validation', () => {
        it('should not call onFilesSelected when file exceeds maxFileSize', () => {
            const onFilesSelected = vi.fn();
            const maxFileSize = 5 * 1024 * 1024; // 5MB
            const largeFile = new File(['x'.repeat(maxFileSize + 1)], 'large.pdf', { type: 'application/pdf' });

            Object.defineProperty(largeFile, 'size', { value: maxFileSize + 1 });

            const { container } = renderWithTheme(
                <FileUploader {...defaultProps} maxFileSize={maxFileSize} onFilesSelected={onFilesSelected} />,
            );

            const input = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(input, { target: { files: [largeFile] } });

            expect(onFilesSelected).not.toHaveBeenCalled();
        });

        it('should call onFilesSelected when file is within maxFileSize', () => {
            const onFilesSelected = vi.fn();
            const maxFileSize = 10 * 1024 * 1024; // 10MB
            const validFile = new File(['test content'], 'valid.pdf', { type: 'application/pdf' });

            Object.defineProperty(validFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB

            const { container } = renderWithTheme(
                <FileUploader {...defaultProps} maxFileSize={maxFileSize} onFilesSelected={onFilesSelected} />,
            );

            const input = container.querySelector('input[type="file"]') as HTMLInputElement;

            fireEvent.change(input, { target: { files: [validFile] } });

            expect(onFilesSelected).toHaveBeenCalledWith([validFile]);
        });

        const sized = (name: string, type: string, size: number): File => {
            const file = new File(['x'], name, { type });

            Object.defineProperty(file, 'size', { value: size });

            return file;
        };

        const drop = (dropzone: Element, files: File[]): void => {
            fireEvent.dragEnter(dropzone, { dataTransfer: { files, types: ['Files'] } });
            fireEvent.drop(dropzone, { dataTransfer: { files, types: ['Files'] } });
        };

        it('reports a file over maxFileSize instead of dropping it silently', () => {
            const onFilesSelected = vi.fn();
            const onFilesRejected = vi.fn();
            const large = sized('large.pdf', 'application/pdf', 6 * 1024 * 1024);
            const { container } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    maxFileSize={5 * 1024 * 1024}
                    onFilesSelected={onFilesSelected}
                    onFilesRejected={onFilesRejected}
                />,
            );

            fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
                target: { files: [large] },
            });

            expect(onFilesSelected).not.toHaveBeenCalled();
            expect(onFilesRejected).toHaveBeenCalledWith([
                { file: large, reason: FileUploaderRejectionReason.FileTooLarge },
            ]);
        });

        it('applies accept to dropped files and passes on the accepted ones', () => {
            const onFilesSelected = vi.fn();
            const onFilesRejected = vi.fn();
            const pdf = sized('report.PDF', 'application/pdf', 100);
            const photo = sized('photo.jpg', 'image/jpeg', 100);
            const script = sized('run.exe', 'application/x-msdownload', 100);
            const { getByTestId } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    multiple={true}
                    accept=".pdf, image/*"
                    onFilesSelected={onFilesSelected}
                    onFilesRejected={onFilesRejected}
                />,
            );

            drop(getByTestId('ring-fileuploader-dropzone'), [pdf, photo, script]);

            expect(onFilesSelected).toHaveBeenCalledWith([pdf, photo]);
            expect(onFilesRejected).toHaveBeenCalledWith([
                { file: script, reason: FileUploaderRejectionReason.FileInvalidType },
            ]);
        });

        it('takes any file with accept="*/*"', () => {
            const onFilesSelected = vi.fn();
            const file = sized('anything.bin', '', 100);
            const { getByTestId } = renderWithTheme(
                <FileUploader {...defaultProps} accept="*/*" onFilesSelected={onFilesSelected} />,
            );

            drop(getByTestId('ring-fileuploader-dropzone'), [file]);

            expect(onFilesSelected).toHaveBeenCalledWith([file]);
        });

        it('takes the first acceptable file in single mode and rejects the rest', () => {
            const onFilesSelected = vi.fn();
            const onFilesRejected = vi.fn();
            const wrong = sized('notes.txt', 'text/plain', 100);
            const first = sized('first.pdf', 'application/pdf', 100);
            const second = sized('second.pdf', 'application/pdf', 100);
            const { getByTestId } = renderWithTheme(
                <FileUploader {...defaultProps} onFilesSelected={onFilesSelected} onFilesRejected={onFilesRejected} />,
            );

            drop(getByTestId('ring-fileuploader-dropzone'), [wrong, first, second]);

            expect(onFilesSelected).toHaveBeenCalledWith([first]);
            expect(onFilesRejected).toHaveBeenCalledWith([
                { file: wrong, reason: FileUploaderRejectionReason.FileInvalidType },
                { file: second, reason: FileUploaderRejectionReason.TooManyFiles },
            ]);
        });

        it('reports a file of the wrong type and over maxFileSize as the wrong type', () => {
            const onFilesRejected = vi.fn();
            const large = sized('movie.mov', 'video/quicktime', 20 * 1024 * 1024);
            const { getByTestId } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    accept=".pdf"
                    maxFileSize={5 * 1024 * 1024}
                    onFilesRejected={onFilesRejected}
                />,
            );

            drop(getByTestId('ring-fileuploader-dropzone'), [large]);

            expect(onFilesRejected).toHaveBeenCalledWith([
                { file: large, reason: FileUploaderRejectionReason.FileInvalidType },
            ]);
        });

        it('matches a MIME wildcard against the whole type group and calls onFilesSelected first', () => {
            const onFilesSelected = vi.fn();
            const onFilesRejected = vi.fn();
            const song = sized('song.mp3', 'audio/mpeg', 100);
            const book = sized('book.m4b', 'audiobook/x-m4b', 100);
            const { getByTestId } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    multiple={true}
                    accept="audio/*"
                    onFilesSelected={onFilesSelected}
                    onFilesRejected={onFilesRejected}
                />,
            );

            drop(getByTestId('ring-fileuploader-dropzone'), [song, book]);

            expect(onFilesSelected).toHaveBeenCalledWith([song]);
            expect(onFilesRejected).toHaveBeenCalledWith([
                { file: book, reason: FileUploaderRejectionReason.FileInvalidType },
            ]);
            expect(onFilesSelected.mock.invocationCallOrder[0]).toBeLessThan(
                onFilesRejected.mock.invocationCallOrder[0],
            );
        });

        it('checks a replacement picked from a file row as well', () => {
            const onFilesSelected = vi.fn();
            const onFilesRejected = vi.fn();
            const large = sized('take-2.pdf', 'application/pdf', 20 * 1024 * 1024);
            const files: FileUploaderFile[] = [
                { id: '1', name: 'take-1.pdf', status: FileUploaderStatus.Success, action: { label: 'Replace' } },
            ];
            const { getByTestId } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    files={files}
                    onFilesSelected={onFilesSelected}
                    onFilesRejected={onFilesRejected}
                />,
            );

            fireEvent.change(getByTestId('ring-fileuploader-file-1-input'), { target: { files: [large] } });

            expect(onFilesSelected).not.toHaveBeenCalled();
            expect(onFilesRejected).toHaveBeenCalledWith([
                { file: large, reason: FileUploaderRejectionReason.FileTooLarge },
            ]);
        });

        it('should respect accept attribute for file type filtering', () => {
            const { container } = renderWithTheme(<FileUploader {...defaultProps} accept=".pdf,.doc" />);

            const input = container.querySelector('input[type="file"]') as HTMLInputElement;

            expect(input.accept).toBe('.pdf,.doc');
        });
    });

    describe('Drag and Drop', () => {
        it('should handle file drop event', () => {
            const onFilesSelected = vi.fn();
            const { container } = renderWithTheme(<FileUploader {...defaultProps} onFilesSelected={onFilesSelected} />);

            const dropzone = container.querySelector('[data-testid="ring-fileuploader-dropzone"]');
            expect(dropzone).toBeDefined();

            if (dropzone) {
                const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
                const dataTransfer = {
                    files: [file],
                    types: ['Files'],
                };

                fireEvent.dragEnter(dropzone, { dataTransfer });
                fireEvent.dragOver(dropzone, { dataTransfer });
                fireEvent.drop(dropzone, { dataTransfer });

                expect(onFilesSelected).toHaveBeenCalledWith([file]);
            }
        });

        it('should add drag-over class when dragging over dropzone', () => {
            const { container } = renderWithTheme(<FileUploader {...defaultProps} />);

            const dropzone = container.querySelector('[data-testid="ring-fileuploader-dropzone"]');
            expect(dropzone).toBeDefined();

            if (dropzone) {
                const dataTransfer = {
                    files: [],
                    types: ['Files'],
                };

                fireEvent.dragEnter(dropzone, { dataTransfer });

                expect(dropzone.className).toContain('drag-over');

                fireEvent.dragLeave(dropzone, { dataTransfer });

                expect(dropzone.className).not.toContain('drag-over');
            }
        });
    });

    describe('Multiple Files Mode', () => {
        it('should hide dropzone when multiple is false and file is uploaded', () => {
            const files: FileUploaderFile[] = [
                {
                    id: '1',
                    name: 'test.pdf',
                    status: FileUploaderStatus.Completed,
                    progress: 100,
                },
            ];

            const { container, queryByText } = renderWithTheme(
                <FileUploader {...defaultProps} files={files} multiple={false} />,
            );

            // Dropzone should not be visible
            expect(queryByText(defaultProps.labels.dropzone)).toBeNull();

            // File should be displayed
            expect(container.querySelector('[role="listitem"]')).toBeDefined();
        });

        it('should show dropzone when multiple is false and no files uploaded', () => {
            const { getByText } = renderWithTheme(<FileUploader {...defaultProps} multiple={false} />);

            // Dropzone should be visible
            expect(getByText(defaultProps.labels.dropzone)).toBeDefined();
        });

        it('should show dropzone when multiple is true regardless of files', () => {
            const files: FileUploaderFile[] = [
                {
                    id: '1',
                    name: 'test.pdf',
                    status: FileUploaderStatus.Completed,
                    progress: 100,
                },
            ];

            const { getByText } = renderWithTheme(<FileUploader {...defaultProps} files={files} multiple={true} />);

            // Dropzone should still be visible with multiple=true
            expect(getByText(defaultProps.labels.dropzone)).toBeDefined();
        });
    });

    describe('Design system details', () => {
        it('shows the size alone for an idle file', () => {
            const files: FileUploaderFile[] = [
                { id: '1', name: 'backend.pdf', size: 3.5 * 1024 * 1024, status: FileUploaderStatus.Idle },
            ];
            const { getByText, queryByText } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);

            expect(getByText('3.5mb')).toBeDefined();
            expect(queryByText(/0 Bytes/)).toBeNull();
        });

        it('renders the button labels as given', () => {
            const { getByTestId } = renderWithTheme(<FileUploader {...defaultProps} />);

            expect(getByTestId('ring-fileuploader-browse').textContent).toBe('Browse file');
        });

        it('leaves out the header without a headline or a description', () => {
            const { getByTestId } = renderWithTheme(<FileUploader {...defaultProps} />);

            expect(getByTestId('ring-fileuploader').firstElementChild).toBe(getByTestId('ring-fileuploader-dropzone'));
        });

        it('keeps the last word of the small label with a keyboard-reachable link and a focusable hint', () => {
            const onClick = vi.fn();
            const { getByTestId, getByRole } = renderWithTheme(
                <FileUploader {...defaultProps} size={FileUploaderSize.Small} />,
            );
            const link = getByTestId('ring-fileuploader-browse');
            const input = getByTestId('ring-fileuploader-input');

            input.addEventListener('click', onClick);
            fireEvent.click(link);

            expect(link.tagName).toBe('BUTTON');
            expect(link.parentElement?.textContent).toBe('orBrowse file');
            expect(onClick).toHaveBeenCalledTimes(1);
            expect(getByRole('img', { name: 'PDF, DOC (max. 10MB)' }).tabIndex).toBe(0);
        });

        it('names the remove and retry buttons after the file', () => {
            const files: FileUploaderFile[] = [
                {
                    id: '1',
                    name: 'data.csv',
                    status: FileUploaderStatus.Error,
                    errorMessage: 'Failed',
                    showRemove: true,
                },
            ];
            const { getByRole, rerender } = renderWithTheme(
                <FileUploader {...defaultProps} files={files} onRetry={vi.fn()} />,
            );

            expect(getByRole('button', { name: 'Remove data.csv' })).toBeDefined();
            expect(getByRole('button', { name: 'Retry upload of data.csv' })).toBeDefined();

            rerender(
                WithRingThemeHOC(
                    <FileUploader
                        {...defaultProps}
                        labels={{ ...defaultProps.labels, removeFile: 'Usuń {name}', retryFile: 'Ponów {name}' }}
                        files={files}
                        onRetry={vi.fn()}
                    />,
                ),
            );

            expect(getByRole('button', { name: 'Usuń data.csv' })).toBeDefined();
            expect(getByRole('button', { name: 'Ponów data.csv' })).toBeDefined();
        });

        it('keeps a file name with dollar signs intact in the button names', () => {
            const files: FileUploaderFile[] = [{ id: '1', name: "Budget $$ x$&y$'z.xlsx", showRemove: true }];
            const { getByRole } = renderWithTheme(<FileUploader {...defaultProps} files={files} />);

            expect(getByRole('button', { name: "Remove Budget $$ x$&y$'z.xlsx" })).toBeDefined();
        });

        it('exposes the files counter state and announces errors and progress politely', () => {
            const files: FileUploaderFile[] = [
                { id: '1', name: 'a.pdf', status: FileUploaderStatus.Success },
                { id: '2', name: 'b.pdf', status: FileUploaderStatus.Error, errorMessage: 'Network error' },
            ];
            const { getByTestId, container } = renderWithTheme(
                <FileUploader {...defaultProps} files={files} multiple={true} />,
            );
            const counter = getByTestId('ring-fileuploader-expand');

            expect(counter.getAttribute('aria-expanded')).toBe('true');
            fireEvent.click(counter);
            expect(counter.getAttribute('aria-expanded')).toBe('false');
            expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe(
                'Network error. 1 of 2 files uploaded',
            );
        });

        it('does not double the full stop after a message that ends its sentence', () => {
            const files: FileUploaderFile[] = [{ id: '1', name: 'a.pdf', status: FileUploaderStatus.Success }];
            const { container } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    files={files}
                    multiple={true}
                    errorMessage="Not added: notes.pdf — use JPG or PNG."
                />,
            );

            expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe(
                'Not added: notes.pdf — use JPG or PNG. 1 of 1 files uploaded',
            );
        });

        it('names the URL field by the section title and marks the submit busy while loading', () => {
            const { getByPlaceholderText, getByText, getByTestId } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    slotProps={{
                        urlUploadSection: {
                            enabled: true,
                            title: 'Or upload from URL',
                            placeholder: 'https://',
                            loading: true,
                        },
                    }}
                />,
            );
            const input = getByPlaceholderText('https://');

            expect(input.getAttribute('aria-labelledby')).toBe(getByText('Or upload from URL').id);
            expect(getByTestId('ring-fileuploader-url-submit').getAttribute('aria-busy')).toBe('true');
        });

        it('names the progress indicators after the file and hides the decorative URL spinner', () => {
            const files: FileUploaderFile[] = [
                { id: '1', name: 'photo.jpg', size: 1024, progress: 42, status: FileUploaderStatus.Uploading },
            ];
            const { getAllByRole, getByTestId } = renderWithTheme(
                <FileUploader
                    {...defaultProps}
                    files={files}
                    slotProps={{ urlUploadSection: { enabled: true, title: 'URL', loading: true } }}
                />,
            );

            const named = getAllByRole('progressbar', { name: 'photo.jpg' });

            expect(named).toHaveLength(2);
            expect(
                getByTestId('ring-fileuploader-url-submit')
                    .querySelector('[role="progressbar"]')
                    ?.getAttribute('aria-hidden'),
            ).toBe('true');
        });

        it('layers an application style override on top of the slot instead of replacing it', () => {
            const rounder = (outer: Theme): Theme =>
                createTheme(outer, {
                    components: { RingFileUploader: { styleOverrides: { dropzone: { borderRadius: 16 } } } },
                });
            const { getByTestId } = renderWithTheme(
                <ThemeProvider theme={rounder}>
                    <FileUploader {...defaultProps} />
                </ThemeProvider>,
            );
            const style = getComputedStyle(getByTestId('ring-fileuploader-dropzone'));

            // jsdom keeps shorthands as written, so the shorthands are read.
            expect(style.borderRadius).toBe('16px');
            expect(style.display).toBe('flex');
            expect(style.border).toContain('dashed');
        });

        it('keeps the drag-over state while the pointer moves over a child of the drop area', () => {
            const { getByTestId } = renderWithTheme(<FileUploader {...defaultProps} />);
            const dropzone = getByTestId('ring-fileuploader-dropzone');
            const child = getByTestId('ring-fileuploader-browse');
            const dataTransfer = { files: [], types: ['Files'] };

            fireEvent.dragEnter(dropzone, { dataTransfer });
            fireEvent.dragEnter(child, { dataTransfer });
            fireEvent.dragLeave(dropzone, { dataTransfer });
            expect(dropzone.className).toContain('drag-over');

            fireEvent.dragLeave(child, { dataTransfer });
            expect(dropzone.className).not.toContain('drag-over');
        });
    });
});
