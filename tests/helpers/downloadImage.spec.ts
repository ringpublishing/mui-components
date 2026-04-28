import { vi, describe, it, expect, beforeEach } from 'vitest';

import { downloadImage } from '../../src/helpers/downloadImage.js';

describe('downloadImage', () => {
    const fetchMock = vi.fn();
    const revokeObjectURLMock = vi.fn();
    const windowMock = vi.fn();
    const consoleErrorMock = vi.fn();

    global.fetch = fetchMock;
    global.URL = Object.assign(global.URL, { revokeObjectURL: revokeObjectURLMock, createObjectURL: vi.fn() });
    global.window.open = windowMock;
    global.console.error = consoleErrorMock;

    beforeEach(() => {
        fetchMock.mockReset();
        vi.spyOn(global.Math, 'random').mockReturnValue(0.21268584454109374);
    });

    it('downloads an image successfully', async () => {
        const blob = new Blob(['image data'], { type: 'image/jpeg' });
        fetchMock.mockResolvedValue({
            blob: () => Promise.resolve(blob),
        });

        const linkClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

        await downloadImage({ src: 'http://example.com/image.jpg' });

        expect(fetchMock).toHaveBeenCalledWith('http://example.com/image.jpg?piiiy');
        expect(linkClickSpy).toHaveBeenCalled();
        expect(revokeObjectURLMock).toHaveBeenCalled();
    });

    it('throws an error when the image download fails', async () => {
        fetchMock.mockRejectedValue(new Error('Failed to fetch'));

        await downloadImage('http://example.com/image.jpg');
        expect(consoleErrorMock).toHaveBeenCalled();
        expect(windowMock).toHaveBeenCalledWith('http://example.com/image.jpg', '_blank');
    });
});
