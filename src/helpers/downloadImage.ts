import { Image } from '../types.js';
import { isImage } from './types.js';

export async function downloadImage(image: Image | string): Promise<void> {
    const imageUrl = isImage(image) ? image.src : image;

    try {
        // adds random search param query to prevent caching of the image in the browser
        const randomQueryParam = (Math.random() + 1).toString(36).substring(7);
        const response = await fetch(`${imageUrl}?${randomQueryParam}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = (isImage(image) && image.title) || 'image.jpg';
        link.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Failed to download image', e);
        window.open(imageUrl, '_blank');
    }
}
