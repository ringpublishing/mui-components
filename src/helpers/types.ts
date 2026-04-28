import { Image } from '../types.js';

export function isImage(obj: unknown): obj is Image {
    return typeof obj === 'object' && obj !== null && typeof (obj as any).src === 'string';
}
