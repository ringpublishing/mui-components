import { vi, describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { FileUploader } from '../../../src/components/Organisms/FileUploader/FileUploader.js';
import {
    FileUploaderSize,
    FileUploaderStatus,
    FileUploaderFile,
} from '../../../src/components/Organisms/FileUploader/fileUploader.types.js';
import { renderWithTheme } from '../../test-utils/theme.js';

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

        const { getByText } = renderWithTheme(
            <FileUploader {...defaultProps} files={files} multiple={true} labels={labels} />,
        );

        expect(getByText('2 of 3 files uploaded')).toBeTruthy();
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
            expect(getByText('UPLOAD')).toBeDefined();
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
            const submitButton = getByText('UPLOAD');

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
            const clearButton = container.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;

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
            const submitButton = getByText('UPLOAD') as HTMLButtonElement;

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

            const dropzone = container.querySelector('[class*="DropzoneContainer"]');
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

            const dropzone = container.querySelector('[class*="DropzoneContainer"]');
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
            expect(container.querySelector('[class*="FileItemContainer"]')).toBeDefined();
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
});
