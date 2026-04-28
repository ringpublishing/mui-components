export interface RectangleLayout {
    countPerRow: number;
    scale: number;
    width: number;
    height: number;
}

export function calculateOptimalRectangleLayout(
    availableWidth: number,
    originalWidth = 200,
    originalHeight = 300,
    columnGap = 0,
): RectangleLayout {
    if (availableWidth < 300) {
        throw new Error('Container width must be at least 300px');
    }

    if (originalWidth <= 0 || originalHeight <= 0) {
        throw new Error('Card dimensions must be positive');
    }

    if (columnGap < 0) {
        throw new Error('Column gap cannot be negative');
    }

    const idealCount = (availableWidth + columnGap) / (originalWidth + columnGap);
    const floor = Math.floor(idealCount);
    const ceil = Math.ceil(idealCount);

    const candidates = Array.from(new Set([floor, ceil].filter((count) => count >= 1))).sort((a, b) => a - b);

    let optimalCount = 1;
    let minDeviation = Infinity;

    for (const count of candidates) {
        const effectiveWidth = availableWidth - columnGap * (count - 1) - columnGap * 2;
        const scale = effectiveWidth / (count * originalWidth);
        const deviation = Math.abs(scale - 1);

        if (deviation < minDeviation) {
            minDeviation = deviation;
            optimalCount = count;
        }
    }

    const effectiveWidth = availableWidth - columnGap * (optimalCount - 1) - columnGap * 2;
    const scale = effectiveWidth / (optimalCount * originalWidth);
    const width = scale * originalWidth;
    const height = scale * originalHeight;

    return {
        countPerRow: optimalCount,
        scale,
        width,
        height,
    };
}
