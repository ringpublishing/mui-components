import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Comments, CommentsProps } from '../../../src/index.js';

describe('Comments', () => {
    const mockProps: CommentsProps = {
        initialComments: [],
        labels: {
            placeholder: 'Add a comment...',
            editing: 'Editing',
            modified: 'Modified',
            cancel: 'Cancel',
            add: 'Add',
            update: 'Update',
        },
    };

    console.error = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render correctly', () => {
        const { container } = render(<Comments {...mockProps} />);
        expect(container).toMatchSnapshot();
    });

    it('should render with initial comments', () => {
        const initialComments = [
            {
                id: 1,
                text: 'Comment 1',
                creationTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: 'Test User',
                isOwner: true,
            },
            {
                id: 2,
                text: 'Comment 2',
                creationTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: 'Test User',
                isOwner: false,
            },
        ];
        render(<Comments {...mockProps} initialComments={initialComments} />);
        const commentElements = screen.getAllByText(/Comment/i);
        expect(commentElements.length).toBe(2);
    });

    it('should not render CreatePanel if disableCreatePanel is true', () => {
        render(<Comments {...mockProps} disableCreatePanel={true} />);
        expect(screen.queryByPlaceholderText(mockProps.labels.placeholder)).toBe(null);
    });

    it('should clear input and exit add mode on cancel', () => {
        const { getByPlaceholderText, getByText, queryByText } = render(<Comments {...mockProps} />);
        const input = getByPlaceholderText(mockProps.labels.placeholder);
        fireEvent.click(input);
        fireEvent.change(input, { target: { value: 'New comment' } });
        fireEvent.click(getByText(mockProps.labels.cancel));
        expect((getByPlaceholderText(mockProps.labels.placeholder) as HTMLInputElement).value).toBe('');
        expect(queryByText(mockProps.labels.cancel)).toBeNull();
    });

    it('should add a comment and display it', async () => {
        const author = 'Test User';
        const onAdd = vi.fn().mockImplementation(async (text = '', { addComment }): Promise<void> => {
            addComment({
                id: 1,
                text,
                creationTime: new Date().toISOString(),
                author,
                isOwner: true,
            });
            await Promise.resolve();
        });
        const { getByPlaceholderText, getByText } = render(<Comments {...mockProps} onAdd={onAdd} />);
        const input = getByPlaceholderText(mockProps.labels.placeholder);
        fireEvent.click(input);
        const commentValue = 'New comment';
        fireEvent.change(input, { target: { value: commentValue } });
        const addButton = getByText(mockProps.labels.add);
        fireEvent.click(addButton);

        const commentElement = await screen.findByText(commentValue, { exact: true });
        const authorElement = await screen.findByText((content) => content.includes(author));
        expect(commentElement).toBeTruthy();
        expect(commentElement.textContent).toBe(commentValue);
        expect(authorElement).toBeTruthy();
        expect(authorElement.textContent).toContain(author);
        expect(onAdd).toHaveBeenCalledWith(
            commentValue,
            expect.objectContaining({
                addComment: expect.any(Function),
            }),
        );
    });

    it('should remove a comment from the list after clicking delete', () => {
        const onDelete = vi.fn().mockImplementation(async (id, { deleteComment }): Promise<void> => {
            deleteComment(id);
            await Promise.resolve();
        });

        const initialComments = [
            {
                id: 1,
                text: 'Comment 1',
                creationTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: 'Test User',
                isOwner: true,
            },
        ];

        render(<Comments {...mockProps} initialComments={initialComments} onDelete={onDelete} />);
        const commentElement = screen.getByText('Comment 1', { exact: true });
        expect(commentElement).toBeTruthy();
        const deleteButton = screen.getByTestId('ring-comments-1-delete');
        fireEvent.click(deleteButton);
        const removedComment = screen.queryByText('Comment 1', { exact: true });
        expect(removedComment).toBeNull();
        expect(onDelete).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                deleteComment: expect.any(Function),
                setError: expect.any(Function),
            }),
        );
    });

    it('should call onAdd when adding a comment', () => {
        const onAdd = vi.fn();
        const { getByPlaceholderText, getByText } = render(<Comments {...mockProps} onAdd={onAdd} />);
        const input = getByPlaceholderText(mockProps.labels.placeholder);
        fireEvent.click(input);
        const commentValue = 'New comment';
        fireEvent.change(input, { target: { value: commentValue } });
        const addButton = getByText(mockProps.labels.add);
        fireEvent.click(addButton);
        expect(onAdd).toHaveBeenCalledWith(
            commentValue,
            expect.objectContaining({
                addComment: expect.any(Function),
                setError: expect.any(Function),
            }),
        );
    });

    it('should call onUpdate when updating a comment', () => {
        const onUpdate = vi.fn();
        const initialComments = [
            {
                id: 1,
                text: 'Comment 1',
                creationTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: 'Test User',
                isOwner: true,
            },
        ];
        render(<Comments {...mockProps} initialComments={initialComments} onUpdate={onUpdate} />);
        const commentElement = screen.getByText(/Comment 1/i);
        fireEvent.mouseOver(commentElement);
        const editButton = screen.getByTestId('ring-comments-1-edit');
        fireEvent.click(editButton);
        const input = screen.getByTestId('ring-comments-1-text');
        const commentValue = 'New comment';
        fireEvent.change(input, { target: { value: commentValue } });
        const updateButton = screen.getByText(mockProps.labels.update);
        fireEvent.click(updateButton);
        expect(onUpdate).toHaveBeenCalledWith(
            1,
            commentValue,
            expect.objectContaining({
                updateComment: expect.any(Function),
                setError: expect.any(Function),
            }),
        );
    });

    it('should call onDelete when deleting a comment', () => {
        const onDelete = vi.fn();
        const initialComments = [
            {
                id: 1,
                text: 'Comment 1',
                creationTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: 'Test User',
                isOwner: true,
            },
        ];
        render(<Comments {...mockProps} initialComments={initialComments} onDelete={onDelete} />);
        const deleteButton = screen.getByTestId('ring-comments-1-delete');
        fireEvent.click(deleteButton);
        expect(onDelete).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                deleteComment: expect.any(Function),
                setError: expect.any(Function),
            }),
        );
    });
});
