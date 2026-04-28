/**
 * Utility functions for LightBox component calculations
 */

/**
 * Calculates the distance between two touch points
 * @param touch1 - First touch point
 * @param touch2 - Second touch point
 * @returns The distance between the two points
 */
export function calculateTouchDistance(
    touch1: { clientX: number; clientY: number },
    touch2: { clientX: number; clientY: number },
): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;

    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the center point between two touch points
 * @param touch1 - First touch point
 * @param touch2 - Second touch point
 * @returns The center point coordinates
 */
export function calculateTouchCenter(
    touch1: { clientX: number; clientY: number },
    touch2: { clientX: number; clientY: number },
): { x: number; y: number } {
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
    };
}

/**
 * Calculates the top bar height based on screen height
 * @returns The calculated top bar height in pixels
 */
export function getTopBarHeight(): number {
    const screenHeight = window.innerHeight;

    if (screenHeight >= 2160) {
        return 56;
    } else if (screenHeight >= 1440) {
        return 48;
    } else if (screenHeight >= 768) {
        return 40;
    }

    return 40;
}

/**
 * Calculates the carousel height based on screen height
 * @returns The calculated carousel height in pixels
 */
export function getCarouselHeight(): number {
    const screenHeight = window.innerHeight;

    if (screenHeight >= 2160) {
        return 128;
    } else if (screenHeight >= 1440) {
        return 112;
    } else if (screenHeight >= 768) {
        return 96;
    }

    return 96;
}

/**
 * Calculates the scaled dimensions of an image to fit within the viewport
 * @param imgWidth - The natural width of the image
 * @param imgHeight - The natural height of the image
 * @param containerRef - Reference to the container element
 * @param topBarHeight - Height of the top bar
 * @param carouselHeight - Height of the carousel
 * @param enableCarousel - Whether the carousel is enabled
 * @param imagesLength - Number of images
 * @param margin - Margin around the image
 * @returns Object containing the scaled width, height, and scale percentage
 */
export function calculateScaledDimensions(
    imgWidth: number,
    imgHeight: number,
    containerRef: React.RefObject<HTMLDivElement | null>,
    topBarHeight: number,
    carouselHeight: number,
    enableCarousel: boolean,
    imagesLength: number,
    margin: number,
): { width: number; height: number; scale: number } {
    if (!containerRef.current) {
        return { width: imgWidth, height: imgHeight, scale: 100 };
    }

    const viewportWidth = containerRef.current.clientWidth - margin * 2;
    const viewportHeight =
        containerRef.current.clientHeight -
        topBarHeight -
        (enableCarousel && imagesLength > 1 ? carouselHeight : 0) -
        margin * 2;

    const widthRatio = viewportWidth / imgWidth;
    const heightRatio = viewportHeight / imgHeight;
    const scale = Math.min(widthRatio, heightRatio, 1);

    return {
        width: imgWidth * scale,
        height: imgHeight * scale,
        scale: scale * 100,
    };
}

/**
 * Calculates the actual image dimensions after applying base scale and zoom
 * @param naturalWidth - Natural width of the image
 * @param naturalHeight - Natural height of the image
 * @param baseScale - Base scale percentage
 * @param zoom - Zoom percentage
 * @returns Object containing the calculated width and height
 */
export function calculateImageDimensions(
    naturalWidth: number,
    naturalHeight: number,
    baseScale: number,
    zoom: number,
): { width: number; height: number } {
    return {
        width: naturalWidth * (baseScale / 100) * (zoom / 100),
        height: naturalHeight * (baseScale / 100) * (zoom / 100),
    };
}

/**
 * Calculates the visible height of the image container (excluding top bar and carousel)
 * @param containerHeight - Total height of the container
 * @param topBarHeight - Height of the top bar
 * @param carouselHeight - Height of the carousel
 * @param enableCarousel - Whether the carousel is enabled
 * @param imagesLength - Number of images
 * @returns The visible height in pixels
 */
export function calculateVisibleHeight(
    containerHeight: number,
    topBarHeight: number,
    carouselHeight: number,
    enableCarousel: boolean,
    imagesLength: number,
): number {
    return containerHeight - topBarHeight - (enableCarousel && imagesLength > 1 ? carouselHeight : 0);
}

/**
 * Calculates the centered position for an image within the container
 * @param containerWidth - Width of the container
 * @param imageWidth - Width of the image
 * @param topBarHeight - Height of the top bar
 * @param visibleHeight - Visible height of the container
 * @param imageHeight - Height of the image
 * @returns Object containing the centered x and y positions
 */
export function calculateCenteredPosition(
    containerWidth: number,
    imageWidth: number,
    topBarHeight: number,
    visibleHeight: number,
    imageHeight: number,
): { x: number; y: number } {
    return {
        x: (containerWidth - imageWidth) / 2,
        y: topBarHeight + (visibleHeight - imageHeight) / 2,
    };
}

/**
 * Clamps a position value within specified bounds
 * @param value - Value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 */
export function clampValue(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Calculates and clamps the X position of the image based on container width
 * @param newX - New X position
 * @param imageWidth - Width of the image
 * @param containerWidth - Width of the container
 * @param margin - Margin around the image
 * @returns Clamped X position
 */
export function calculateClampedX(newX: number, imageWidth: number, containerWidth: number, margin: number): number {
    if (imageWidth > containerWidth) {
        const maxX = margin;
        const minX = containerWidth - imageWidth - margin;

        return clampValue(newX, minX, maxX);
    }

    return (containerWidth - imageWidth) / 2;
}

/**
 * Calculates and clamps the Y position of the image based on visible height
 * @param newY - New Y position
 * @param imageHeight - Height of the image
 * @param topBarHeight - Height of the top bar
 * @param visibleHeight - Visible height of the container
 * @param margin - Margin around the image
 * @returns Clamped Y position
 */
export function calculateClampedY(
    newY: number,
    imageHeight: number,
    topBarHeight: number,
    visibleHeight: number,
    margin: number,
): number {
    if (imageHeight > visibleHeight) {
        const maxY = topBarHeight + margin;
        const minY = topBarHeight + visibleHeight - imageHeight - margin;

        return clampValue(newY, minY, maxY);
    }

    return topBarHeight + (visibleHeight - imageHeight) / 2;
}

/**
 * Calculates both clamped X and Y positions for the image
 * @param newX - New X position
 * @param newY - New Y position
 * @param imageWidth - Width of the image
 * @param imageHeight - Height of the image
 * @param containerWidth - Width of the container
 * @param topBarHeight - Height of the top bar
 * @param visibleHeight - Visible height of the container
 * @param margin - Margin around the image
 * @returns Object containing clamped x and y positions
 */
export function calculateClampedPosition(
    newX: number,
    newY: number,
    imageWidth: number,
    imageHeight: number,
    containerWidth: number,
    topBarHeight: number,
    visibleHeight: number,
    margin: number,
): { x: number; y: number } {
    return {
        x: calculateClampedX(newX, imageWidth, containerWidth, margin),
        y: calculateClampedY(newY, imageHeight, topBarHeight, visibleHeight, margin),
    };
}
