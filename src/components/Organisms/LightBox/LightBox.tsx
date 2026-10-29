import React, { useState, useMemo } from 'react';
import { DialogProps, Box, Skeleton, Dialog, GlobalStyles, IconButton, Theme, ThemeProvider } from '@mui/material';
import classNames from 'classnames';
import {
    ArrowLeft,
    ArrowRight,
    Download,
    GalleryHorizontal,
    Info,
    Maximize,
    Minimize,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { getCreatedTheme } from '../../../theme/theme.js';
import { lucidePaletteRules } from '@ringpublishing/mui-theme';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { Image } from '../../../types.js';
import { CommonComponentProps } from '../../../helpers/commonTypes.js';
import { downloadImage } from '../../../helpers/downloadImage.js';
import { useRingDataTestId } from '../../../helpers/hooks/useRingDataTestId.js';
import { LightBoxImage } from './LightBoxImage.js';
import { Detail, DETAIL_WIDTH, LightBoxDetailProps } from '../Detail/Detail.js';
import {
    getTopBarHeight,
    getCarouselHeight,
    calculateScaledDimensions,
    calculateImageDimensions,
    calculateVisibleHeight,
    calculateCenteredPosition,
    calculateClampedPosition,
    calculateTouchDistance,
    calculateTouchCenter,
} from './lightBoxUtils.js';
import { useImageTransition } from './hooks/useImageTransition.js';
import { useCarouselAutoScroll } from './hooks/useCarouselAutoScroll.js';
import { useLightBoxReset } from './hooks/useLightBoxReset.js';
import { useAutoCenterImage } from './hooks/useAutoCenterImage.js';
import { useFullscreenReposition } from './hooks/useFullscreenReposition.js';
import { useDetailPanelReposition } from './hooks/useDetailPanelReposition.js';
import { useWindowResize } from './hooks/useWindowResize.js';
import { usePanPinchEventListeners } from './hooks/usePanPinchEventListeners.js';
import { useTopBarAutoHide } from './hooks/useTopBarAutoHide.js';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation.js';
import { useCarouselScrollCheck } from './hooks/useCarouselScrollCheck.js';
import { tv } from '../../../helpers/typographyMode.js';

export interface LightBoxProps extends CommonComponentProps, Omit<DialogProps, 'children' | 'onClose'> {
    /**
     * Called when the LightBox closes. `reason` is set for Escape and backdrop clicks, and omitted when the close
     * button is used.
     * @param event The event object.
     * @param reason The reason for closing the LightBox.
     */
    onClose: (event: object, reason?: 'escapeKeyDown' | 'backdropClick') => void;

    /**
     * An array of images with their source URLs, optional thumbnail URLs for carousel, and titles.
     */
    images: (Image & { id?: string | number })[];

    /**
     * Whether to show the carousel of images at the bottom of the LightBox.
     * @default true
     */
    enableCarousel?: boolean;

    /**
     * Whether to hide the download icon in the toolbar.
     * @default true
     */
    enableDownloadIcon?: boolean;

    /**
     * Callback function called when user scrolls to the end of the images and more images could be loaded.
     */
    onImagesScrollEnd?: () => void;

    /**
     * Whether more images are currently being loaded and loading indicator should be shown in the carousel.
     */
    moreImagesLoading?: boolean;

    /**
     * Callback function called when the user clicks the download button.
     */
    handleImageDownload?: (image: Image) => void;

    /**
     * Callback function called when the displayed image changes.
     */
    onImageChange?: (image?: Image & { id?: string | number }) => void;

    /**
     * Initial imageId of the image to be displayed when the LightBox is opened.
     */
    initialImageId?: string | number;

    /**
     * Detail props to show the detail panel alongside the image.
     */
    detail?: LightBoxDetailProps;
}

const MOBILE_SCREEN_WIDTH_THRESHOLD = 768;
const LOAD_MORE_THRESHOLD = 600;
const MARGIN = 32;
const HIDE_TOP_BAR_DELAY = 5000;
const ZOOM_SENSITIVITY = 1.2;
const LIGHTBOX_CLASS_NAME = 'ring-lightbox';

function lightBoxIconPaletteRules(theme: Theme): ReturnType<typeof lucidePaletteRules> {
    return lucidePaletteRules(theme, `.${LIGHTBOX_CLASS_NAME}`);
}

/**
 * The LightBox component is used to display images in a separate dialog/gallery.
 * It allows users to navigate through multiple images, zoom in/out, reset zoom, download the image, and view the image in full screen mode.
 */
export function LightBox(props: LightBoxProps): React.JSX.Element {
    const {
        onClose,
        images,
        enableCarousel = true,
        open = false,
        className,
        onImagesScrollEnd,
        moreImagesLoading,
        handleImageDownload,
        enableDownloadIcon = true,
        dataTestIdSuffix,
        onImageChange,
        initialImageId,
        detail,
        ...otherProps
    } = props;

    // Inside the LightBox the media-toolbar download/zoom buttons are redundant (the LightBox
    // provides its own), so force them off on the embedded Detail.
    const embeddedDetailMain = detail?.main && {
        ...detail.main,
        mediaProps: detail.main.mediaProps && {
            ...detail.main.mediaProps,
            enableDownloadIcon: false,
            enableFullScreenIcon: false,
        },
    };

    const initialIndex =
        initialImageId !== undefined
            ? Math.max(
                  images.findIndex((img) => img?.id === initialImageId),
                  0,
              )
            : 0;

    const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
    const [displayedImageIndex, setDisplayedImageIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(100);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [previousImageDimensions, setPreviousImageDimensions] = useState<{ width: number; height: number } | null>(
        null,
    );
    const [baseScale, setBaseScale] = useState(100);
    const [isPanning, setIsPanning] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
    const [hasManuallyPanned, setHasManuallyPanned] = useState(false);
    const [isPinching, setIsPinching] = useState(false);
    const [initialPinchDistance, setInitialPinchDistance] = useState(0);
    const [initialPinchZoom, setInitialPinchZoom] = useState(100);
    const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 });
    const [showTopBar, setShowTopBar] = useState(true);
    const [showCarousel, setShowCarousel] = useState(true);
    const [isFading, setIsFading] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const imageRef = React.useRef<HTMLImageElement>(null);
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const hideTopBarTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const fullScreenHandle = useFullScreenHandle();

    const dataTestId = useRingDataTestId('LightBox', dataTestIdSuffix);

    // A full dark Ring theme, so palette extensions such as `palette.components.*` get their dark values instead of
    // the ambient light theme's.
    const darkTheme = useMemo(() => getCreatedTheme('dark'), []);

    const [topBarHeight, setTopBarHeight] = useState(getTopBarHeight());
    const [carouselHeight, setCarouselHeight] = useState(getCarouselHeight());

    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>): void => {
        const img = event.currentTarget;

        const scaled = calculateScaledDimensions(
            img.naturalWidth,
            img.naturalHeight,
            containerRef,
            topBarHeight,
            carouselHeight,
            enableCarousel,
            images.length,
            MARGIN,
        );

        setBaseScale(scaled.scale);
        setZoom(100);
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };

    useImageTransition({
        currentImageIndex,
        displayedImageIndex,
        imageDimensions,
        setIsFading,
        setPreviousImageDimensions,
        setDisplayedImageIndex,
        setImageDimensions,
        setZoom,
        setBaseScale,
        setImagePos,
        setHasManuallyPanned,
    });

    useCarouselAutoScroll({
        currentImageIndex,
        enableCarousel,
        imagesLength: images.length,
        carouselRef,
    });

    useLightBoxReset({
        open,
        images,
        setImageDimensions,
        setZoom,
        setBaseScale,
        setImagePos,
        setHasManuallyPanned,
        setCurrentImageIndex,
        setDisplayedImageIndex,
        onImageChange,
        initialImageId,
    });

    useAutoCenterImage({
        containerRef,
        imageDimensions,
        baseScale,
        zoom,
        hasManuallyPanned,
        topBarHeight,
        carouselHeight,
        enableCarousel,
        imagesLength: images.length,
        setImagePos,
    });

    useFullscreenReposition({
        fullScreenActive: fullScreenHandle.active,
        containerRef,
        imageDimensions,
        zoom,
        topBarHeight,
        carouselHeight,
        enableCarousel,
        imagesLength: images.length,
        setHasManuallyPanned,
        setBaseScale,
        setImagePos,
    });

    useDetailPanelReposition({
        showDetail,
        containerRef,
        imageDimensions,
        zoom,
        topBarHeight,
        carouselHeight,
        enableCarousel,
        imagesLength: images.length,
        setHasManuallyPanned,
        setBaseScale,
        setImagePos,
    });

    useWindowResize({
        open,
        containerRef,
        imageDimensions,
        baseScale,
        zoom,
        imagePos,
        topBarHeight,
        carouselHeight,
        enableCarousel,
        imagesLength: images.length,
        setTopBarHeight,
        setCarouselHeight,
        setBaseScale,
        setImagePos,
    });

    const handleZoomAtPoint = React.useCallback(
        (newZoom: number, focalX: number, focalY: number): void => {
            if (!containerRef.current || !imageDimensions) {
                setZoom(Math.max(newZoom, 100));

                return;
            }

            const container = containerRef.current;
            const clampedNewZoom = Math.max(newZoom, 100);

            const visibleHeight = calculateVisibleHeight(
                container.clientHeight,
                topBarHeight,
                carouselHeight,
                enableCarousel,
                images.length,
            );

            const { width: oldImageWidth, height: oldImageHeight } = calculateImageDimensions(
                imageDimensions.width,
                imageDimensions.height,
                baseScale,
                zoom,
            );

            const imagePointX = focalX - imagePos.x;
            const imagePointY = focalY - imagePos.y;

            const relativeX = imagePointX / oldImageWidth;
            const relativeY = imagePointY / oldImageHeight;

            const { width: newImageWidth, height: newImageHeight } = calculateImageDimensions(
                imageDimensions.width,
                imageDimensions.height,
                baseScale,
                clampedNewZoom,
            );

            const newImagePointX = relativeX * newImageWidth;
            const newImagePointY = relativeY * newImageHeight;

            const newX = focalX - newImagePointX;
            const newY = focalY - newImagePointY;

            const clampedPos = calculateClampedPosition(
                newX,
                newY,
                newImageWidth,
                newImageHeight,
                container.clientWidth,
                topBarHeight,
                visibleHeight,
                MARGIN,
            );

            setZoom(clampedNewZoom);
            setImagePos(clampedPos);
            setHasManuallyPanned(true);
        },
        [
            containerRef,
            imageDimensions,
            baseScale,
            zoom,
            imagePos,
            topBarHeight,
            carouselHeight,
            enableCarousel,
            images.length,
            setZoom,
            setImagePos,
            setHasManuallyPanned,
        ],
    );

    const handleZoom = (direction: -1 | 1): void => {
        if (!containerRef.current) {
            setZoom((prevZoom) => Math.max(prevZoom + direction * 10, 100));

            return;
        }

        const container = containerRef.current;
        const newZoom = direction > 0 ? zoom + 10 : zoom - 10;

        const visibleHeight = calculateVisibleHeight(
            container.clientHeight,
            topBarHeight,
            carouselHeight,
            enableCarousel,
            images.length,
        );

        const viewportCenterX = container.clientWidth / 2;
        const viewportCenterY = topBarHeight + visibleHeight / 2;

        handleZoomAtPoint(newZoom, viewportCenterX, viewportCenterY);
    };

    const handleZoomIn = (): void => handleZoom(1);
    const handleZoomOut = (): void => handleZoom(-1);

    const handleWheel = React.useCallback(
        (e: WheelEvent) => {
            if (!e.ctrlKey || !containerRef.current || !imageDimensions) {
                return;
            }

            e.preventDefault();

            const newZoom = zoom - e.deltaY * ZOOM_SENSITIVITY;

            handleZoomAtPoint(newZoom, e.clientX, e.clientY);
        },
        [containerRef, imageDimensions, zoom, handleZoomAtPoint],
    );

    const handleResetZoom = (): void => {
        if (!containerRef.current || !imageDimensions) {
            setZoom(100);

            return;
        }

        const container = containerRef.current;
        const currentActualZoom = Math.round((baseScale * zoom) / 100);

        const targetZoom = currentActualZoom === 100 ? 100 : (100 / baseScale) * 100;

        const { width: imageWidth, height: imageHeight } = calculateImageDimensions(
            imageDimensions.width,
            imageDimensions.height,
            baseScale,
            targetZoom,
        );

        const visibleHeight = calculateVisibleHeight(
            container.clientHeight,
            topBarHeight,
            carouselHeight,
            enableCarousel,
            images.length,
        );

        const centeredPos = calculateCenteredPosition(
            container.clientWidth,
            imageWidth,
            topBarHeight,
            visibleHeight,
            imageHeight,
        );

        setZoom(targetZoom);
        setImagePos(centeredPos);
        setHasManuallyPanned(currentActualZoom !== 100);
    };

    const handlePrevImage = (): void => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
            onImageChange?.(images[currentImageIndex - 1]);
        }
    };

    const handleNextImage = (): void => {
        if (currentImageIndex < images.length - 1) {
            const newIndex = currentImageIndex + 1;
            setCurrentImageIndex(newIndex);
            onImageChange?.(images[newIndex]);

            if (onImagesScrollEnd && !moreImagesLoading && newIndex >= images.length - 3) {
                onImagesScrollEnd();
            }
        }
    };

    const handleMouseDown = (e: React.MouseEvent): void => {
        if (!canPan) {
            return;
        }

        setIsPanning(true);
        setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleTouchStart = (e: React.TouchEvent): void => {
        if (e.touches.length === 2) {
            // Pinch gesture starting
            setIsPinching(true);
            setIsPanning(false);
            const distance = calculateTouchDistance(e.touches[0], e.touches[1]);
            const center = calculateTouchCenter(e.touches[0], e.touches[1]);
            setInitialPinchDistance(distance);
            setInitialPinchZoom(zoom);
            setPinchCenter(center);
        } else if (e.touches.length === 1 && canPan) {
            setIsPanning(true);
            setIsPinching(false);
            setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
    };

    const handleMouseMove = React.useCallback(
        (e: MouseEvent) => {
            if (!isPanning || !containerRef.current || !imageDimensions) {
                return;
            }

            e.preventDefault();

            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;

            const newX = imagePos.x + dx;
            const newY = imagePos.y + dy;

            const { width: imageWidth, height: imageHeight } = calculateImageDimensions(
                imageDimensions.width,
                imageDimensions.height,
                baseScale,
                zoom,
            );

            const containerWidth = containerRef.current.clientWidth;
            const visibleHeight = calculateVisibleHeight(
                containerRef.current.clientHeight,
                topBarHeight,
                carouselHeight,
                enableCarousel,
                images.length,
            );

            const clampedPos = calculateClampedPosition(
                newX,
                newY,
                imageWidth,
                imageHeight,
                containerWidth,
                topBarHeight,
                visibleHeight,
                MARGIN,
            );

            setImagePos(clampedPos);

            setHasManuallyPanned(true);
            setStartPos({ x: e.clientX, y: e.clientY });
        },
        [
            isPanning,
            imageDimensions,
            baseScale,
            zoom,
            imagePos,
            startPos,
            topBarHeight,
            carouselHeight,
            enableCarousel,
            images.length,
        ],
    );

    const handleMouseUp = React.useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleTouchMove = React.useCallback(
        (e: TouchEvent) => {
            if (!containerRef.current || !imageDimensions) {
                return;
            }

            e.preventDefault();

            if (isPinching && e.touches.length === 2) {
                // Handle pinch zoom
                const currentDistance = calculateTouchDistance(e.touches[0], e.touches[1]);
                const currentCenter = calculateTouchCenter(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialPinchDistance;
                const newZoom = Math.max(initialPinchZoom * scale, 100);

                const container = containerRef.current;
                const visibleHeight = calculateVisibleHeight(
                    container.clientHeight,
                    topBarHeight,
                    carouselHeight,
                    enableCarousel,
                    images.length,
                );

                // Calculate zoom around the pinch center point
                const { width: oldImageWidth, height: oldImageHeight } = calculateImageDimensions(
                    imageDimensions.width,
                    imageDimensions.height,
                    baseScale,
                    zoom,
                );

                const imagePointX = pinchCenter.x - imagePos.x;
                const imagePointY = pinchCenter.y - imagePos.y;

                const relativeX = imagePointX / oldImageWidth;
                const relativeY = imagePointY / oldImageHeight;

                const { width: newImageWidth, height: newImageHeight } = calculateImageDimensions(
                    imageDimensions.width,
                    imageDimensions.height,
                    baseScale,
                    newZoom,
                );

                const newImagePointX = relativeX * newImageWidth;
                const newImagePointY = relativeY * newImageHeight;

                const newX = currentCenter.x - newImagePointX;
                const newY = currentCenter.y - newImagePointY;

                const containerWidth = container.clientWidth;

                const clampedPos = calculateClampedPosition(
                    newX,
                    newY,
                    newImageWidth,
                    newImageHeight,
                    containerWidth,
                    topBarHeight,
                    visibleHeight,
                    MARGIN,
                );

                setZoom(newZoom);
                setImagePos(clampedPos);
                setHasManuallyPanned(true);
                setPinchCenter(currentCenter);
            } else if (isPanning && e.touches.length === 1) {
                // Handle panning
                const dx = e.touches[0].clientX - startPos.x;
                const dy = e.touches[0].clientY - startPos.y;

                const newX = imagePos.x + dx;
                const newY = imagePos.y + dy;

                const { width: imageWidth, height: imageHeight } = calculateImageDimensions(
                    imageDimensions.width,
                    imageDimensions.height,
                    baseScale,
                    zoom,
                );

                const containerWidth = containerRef.current.clientWidth;
                const visibleHeight = calculateVisibleHeight(
                    containerRef.current.clientHeight,
                    topBarHeight,
                    carouselHeight,
                    enableCarousel,
                    images.length,
                );

                const clampedPos = calculateClampedPosition(
                    newX,
                    newY,
                    imageWidth,
                    imageHeight,
                    containerWidth,
                    topBarHeight,
                    visibleHeight,
                    MARGIN,
                );

                setImagePos(clampedPos);

                setHasManuallyPanned(true);
                setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
            }
        },
        [
            isPanning,
            isPinching,
            imageDimensions,
            baseScale,
            zoom,
            imagePos,
            startPos,
            pinchCenter,
            initialPinchDistance,
            initialPinchZoom,
            topBarHeight,
            carouselHeight,
            enableCarousel,
            images.length,
        ],
    );

    const handleTouchEnd = React.useCallback(() => {
        setIsPanning(false);
        setIsPinching(false);
    }, []);

    usePanPinchEventListeners({
        isPanning,
        isPinching,
        containerRef,
        handleMouseMove,
        handleMouseUp,
        handleTouchMove,
        handleTouchEnd,
        handleWheel,
    });

    const canPan = React.useMemo(() => {
        if (!containerRef.current || !imageDimensions || zoom <= 100) {
            return false;
        }

        const { width: imageWidth, height: imageHeight } = calculateImageDimensions(
            imageDimensions.width,
            imageDimensions.height,
            baseScale,
            zoom,
        );
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = calculateVisibleHeight(
            containerRef.current.clientHeight,
            topBarHeight,
            carouselHeight,
            enableCarousel,
            images.length,
        );

        return imageWidth > containerWidth || imageHeight > containerHeight;
    }, [imageDimensions, baseScale, zoom, topBarHeight, carouselHeight, enableCarousel, images.length]);

    const handleClose = React.useCallback(
        (event: object, reason?: 'escapeKeyDown' | 'backdropClick') => {
            if (fullScreenHandle.active) {
                fullScreenHandle.exit();
            }

            setCurrentImageIndex(0);
            setDisplayedImageIndex(0);
            onImageChange?.(undefined);
            setShowCarousel(true);
            setShowTopBar(true);

            onClose(event, reason);
        },
        [onClose, fullScreenHandle, onImageChange],
    );

    const showTopBarOnHover = React.useCallback(() => {
        setShowTopBar(true);

        if (hideTopBarTimeoutRef.current) {
            clearTimeout(hideTopBarTimeoutRef.current);
        }
    }, []);

    const hideTopBarWithDelay = React.useCallback(() => {
        if (hideTopBarTimeoutRef.current) {
            clearTimeout(hideTopBarTimeoutRef.current);
        }

        const isMobile = window.innerWidth < MOBILE_SCREEN_WIDTH_THRESHOLD;

        if (!isMobile) {
            hideTopBarTimeoutRef.current = setTimeout(() => {
                setShowTopBar(false);
            }, HIDE_TOP_BAR_DELAY);
        }
    }, []);

    useTopBarAutoHide({
        open,
        hideTopBarTimeoutRef,
        hideTopBarWithDelay,
        setShowTopBar,
    });

    useKeyboardNavigation({
        open,
        currentImageIndex,
        imagesLength: images.length,
        handlePrevImage,
        handleNextImage,
    });

    const handleCarouselScroll = React.useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            if (!onImagesScrollEnd || moreImagesLoading) {
                return;
            }

            const target = e.currentTarget;
            const scrollLeft = target.scrollLeft;
            const scrollWidth = target.scrollWidth;
            const clientWidth = target.clientWidth;

            if (scrollLeft + clientWidth >= scrollWidth - LOAD_MORE_THRESHOLD) {
                onImagesScrollEnd();
            }
        },
        [onImagesScrollEnd, moreImagesLoading],
    );

    useCarouselScrollCheck({
        open,
        enableCarousel,
        imagesLength: images.length,
        moreImagesLoading,
        carouselRef,
        onImagesScrollEnd,
    });

    return (
        <ThemeProvider theme={darkTheme}>
            {/* The page-wide `color="error"` rules for plain lucide icons follow the page theme;
                inside the dialog they have to follow the dark one. */}
            {open && <GlobalStyles styles={lightBoxIconPaletteRules} />}
            <Dialog
                data-testid={dataTestId}
                onClose={handleClose}
                open={open}
                className={classNames(LIGHTBOX_CLASS_NAME, className)}
                fullScreen={true}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: 'black',
                        },
                    },
                }}
                {...otherProps}
            >
                <FullScreen handle={fullScreenHandle}>
                    <Box
                        sx={{
                            width: '100vw',
                            height: '100vh',
                            display: 'flex',
                            backgroundColor: darkTheme.palette.grey[900],
                            flexDirection: 'row',
                            position: 'relative',
                            // The global scrollbar colour follows the app's mode, not this dark theme,
                            // so set the dark thumb once here; the strip and the Detail panel inherit it.
                            scrollbarColor: darkTheme.palette._native
                                ? `${darkTheme.palette._native.scrollbarBackground} transparent`
                                : undefined,
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                minWidth: 0,
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                onMouseEnter={showTopBarOnHover}
                                onMouseLeave={hideTopBarWithDelay}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${topBarHeight}px`,
                                    zIndex: 999,
                                    pointerEvents: 'auto',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    backdropFilter: 'blur(5px)',
                                    height: `${topBarHeight}px`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: darkTheme.spacing(1),
                                    paddingX: darkTheme.spacing(1),
                                    zIndex: 1000,
                                    flexShrink: 0,
                                    transform: showTopBar ? 'translateY(0)' : 'translateY(-100%)',
                                    transition: 'transform 0.3s ease-in-out',
                                    pointerEvents: showTopBar ? 'auto' : 'none',
                                }}
                            >
                                <IconButton
                                    data-testid={`${dataTestId}-close`}
                                    onClick={(event): void => handleClose(event)}
                                    aria-label="close"
                                    sx={{ color: 'white' }}
                                >
                                    <X size={24} />
                                </IconButton>
                                <Box sx={{ display: 'flex', gap: darkTheme.spacing(1), alignItems: 'center' }}>
                                    <IconButton
                                        data-testid={`${dataTestId}-zoom-out`}
                                        onClick={handleZoomOut}
                                        aria-label="zoom out"
                                        disabled={zoom <= 100}
                                        sx={{
                                            color: 'white',
                                            '&.Mui-disabled': {
                                                color: 'grey.700',
                                            },
                                        }}
                                    >
                                        <ZoomOut size={24} />
                                    </IconButton>
                                    <Box
                                        onClick={handleResetZoom}
                                        sx={(
                                            theme,
                                        ): {
                                            color: string;
                                            fontSize: string;
                                            fontWeight: number;
                                            minWidth: string;
                                            textAlign: string;
                                            userSelect: string;
                                            cursor: string;
                                            '&:hover': { color: string };
                                        } => ({
                                            color: 'white',
                                            fontSize: tv('0.875rem')(theme),
                                            fontWeight: 500,
                                            minWidth: '50px',
                                            textAlign: 'center',
                                            userSelect: 'none',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                color: 'grey.300',
                                            },
                                        })}
                                    >
                                        {Math.round((baseScale * zoom) / 100)}%
                                    </Box>
                                    <IconButton
                                        data-testid={`${dataTestId}-zoom-in`}
                                        onClick={handleZoomIn}
                                        aria-label="zoom in"
                                        sx={{ color: 'white' }}
                                    >
                                        <ZoomIn size={24} />
                                    </IconButton>
                                    <IconButton
                                        data-testid={`${dataTestId}-fullscreen`}
                                        onClick={
                                            fullScreenHandle.active ? fullScreenHandle.exit : fullScreenHandle.enter
                                        }
                                        aria-label="toggle full screen"
                                        sx={{ color: 'white' }}
                                    >
                                        {fullScreenHandle.active ? <Minimize size={24} /> : <Maximize size={24} />}
                                    </IconButton>
                                    {enableDownloadIcon && (
                                        <IconButton
                                            data-testid={`${dataTestId}-download`}
                                            sx={{ color: 'white' }}
                                            aria-label="download image"
                                            onClick={(): void => {
                                                if (handleImageDownload) {
                                                    handleImageDownload(images[currentImageIndex]);
                                                } else {
                                                    downloadImage(images[currentImageIndex]);
                                                }
                                            }}
                                        >
                                            <Download size={24} />
                                        </IconButton>
                                    )}
                                    {detail && (
                                        <IconButton
                                            data-testid={`${dataTestId}-toggle-detail`}
                                            onClick={(): void => setShowDetail(!showDetail)}
                                            aria-label="toggle detail panel"
                                            sx={{ color: 'white' }}
                                        >
                                            <Info size={24} />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                            <Box
                                ref={containerRef}
                                sx={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    cursor: isPanning ? 'grabbing' : canPan ? 'grab' : 'default',
                                    minHeight: 0,
                                    zIndex: 1,
                                    touchAction: canPan ? 'none' : 'auto',
                                }}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                            >
                                {images.length > 1 && currentImageIndex > 0 && (
                                    <IconButton
                                        onClick={handlePrevImage}
                                        aria-label="previous image"
                                        data-testid={`${dataTestId}-previous`}
                                        sx={{
                                            position: 'absolute',
                                            left: 16,
                                            top: '50%',
                                            transform: 'translateY(-47%)',
                                            zIndex: 1001,
                                            backgroundColor: 'transparent',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'grey.800',
                                            },
                                        }}
                                    >
                                        <ArrowLeft size={24} />
                                    </IconButton>
                                )}
                                {images.length > 1 && currentImageIndex < images.length - 1 && (
                                    <IconButton
                                        data-testid={`${dataTestId}-next`}
                                        onClick={handleNextImage}
                                        aria-label="next image"
                                        sx={{
                                            position: 'absolute',
                                            right: 16,
                                            top: '50%',
                                            transform: 'translateY(-53%)',
                                            zIndex: 1001,
                                            backgroundColor: 'transparent',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'grey.800',
                                            },
                                        }}
                                    >
                                        <ArrowRight size={24} />
                                    </IconButton>
                                )}
                                {images.length > 0 && (imageDimensions || previousImageDimensions) && (
                                    <LightBoxImage
                                        imageRef={imageRef}
                                        testId={`${dataTestId}-image`}
                                        src={images[displayedImageIndex]?.src}
                                        alt={images[displayedImageIndex]?.title || `Image ${displayedImageIndex + 1}`}
                                        onLoad={handleImageLoad}
                                        onDragStart={(e): void => e.preventDefault()}
                                        width={`${((imageDimensions || previousImageDimensions)?.width ?? 0) * (baseScale / 100) * (zoom / 100)}px`}
                                        height={`${((imageDimensions || previousImageDimensions)?.height ?? 0) * (baseScale / 100) * (zoom / 100)}px`}
                                        isFading={isFading}
                                        style={{
                                            position: 'absolute',
                                            left: `${imagePos.x}px`,
                                            top: `${imagePos.y}px`,
                                            objectFit: 'contain',
                                        }}
                                    />
                                )}
                                {images.length > 0 && !imageDimensions && !previousImageDimensions && (
                                    <img
                                        ref={imageRef}
                                        src={images[displayedImageIndex]?.src}
                                        alt={images[displayedImageIndex]?.title || `Image ${displayedImageIndex + 1}`}
                                        onLoad={handleImageLoad}
                                        onDragStart={(e): void => e.preventDefault()}
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: `calc(${topBarHeight}px + (100% - ${topBarHeight}px - ${enableCarousel && images.length > 1 ? carouselHeight : 0}px) / 2)`,
                                            transform: 'translate(-50%, -50%)',
                                            maxWidth: `calc(100% - ${MARGIN * 2}px)`,
                                            maxHeight: `calc(100% - ${topBarHeight + (enableCarousel && images.length > 1 ? carouselHeight : 0) + MARGIN * 2}px)`,
                                            objectFit: 'contain',
                                            userSelect: 'none',
                                            pointerEvents: 'none',
                                            opacity: 0,
                                        }}
                                    />
                                )}
                            </Box>
                            {enableCarousel && images.length > 1 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${carouselHeight}px`,
                                        transform: showCarousel ? 'translateY(0)' : 'translateY(100%)',
                                        transition: 'transform 0.3s ease-in-out',
                                        zIndex: 1000,
                                    }}
                                >
                                    {moreImagesLoading && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '3px',
                                                overflow: 'hidden',
                                                zIndex: 1,
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: '-100%',
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: darkTheme.palette.primary.main,
                                                    animation: 'loadingSlide 1s infinite ease-in-out',
                                                },
                                                '@keyframes loadingSlide': {
                                                    '0%': {
                                                        left: '-100%',
                                                    },
                                                    '100%': {
                                                        left: '100%',
                                                    },
                                                },
                                            }}
                                        />
                                    )}
                                    <IconButton
                                        disableRipple={true}
                                        onClick={(): void => setShowCarousel(!showCarousel)}
                                        sx={{
                                            position: 'absolute',
                                            top: '-48px',
                                            height: '48px',
                                            width: '48px',
                                            backgroundColor: '#000',
                                            borderRadius: 0,
                                        }}
                                    >
                                        <GalleryHorizontal size={24} />
                                    </IconButton>
                                    <Box
                                        ref={carouselRef}
                                        onScroll={handleCarouselScroll}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                            backdropFilter: 'blur(5px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: darkTheme.spacing(1),
                                            padding: darkTheme.spacing(1),
                                            overflowX: 'auto',
                                            overflowY: 'hidden',
                                            WebkitOverflowScrolling: 'touch',
                                            flexShrink: 0,
                                            // Set here so the strip stays thin whatever the theme's CSS baseline sets.
                                            scrollbarWidth: 'thin',
                                        }}
                                    >
                                        {images.map((image, index) => (
                                            <Box
                                                key={index}
                                                onClick={(): void => {
                                                    setCurrentImageIndex(index);
                                                    onImageChange?.(images[index]);
                                                }}
                                                sx={{
                                                    width: '80px',
                                                    minWidth: '80px',
                                                    maxWidth: '80px',
                                                    flexShrink: 0,
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                    outline:
                                                        currentImageIndex === index
                                                            ? `2px solid ${darkTheme.palette.primary.main}`
                                                            : '2px solid transparent',
                                                    overflow: 'hidden',
                                                    transition: 'border-color 0.2s ease-in-out',
                                                    '&:hover': {
                                                        outlineColor:
                                                            currentImageIndex === index
                                                                ? darkTheme.palette.primary.main
                                                                : darkTheme.palette.grey[500],
                                                    },
                                                    backgroundColor: darkTheme.palette.grey[900],
                                                }}
                                            >
                                                <img
                                                    src={image.thumbnailSrc || image.src}
                                                    alt={image.title || `Thumbnail ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        overflow: 'hidden',
                                                        userSelect: 'none',
                                                        pointerEvents: 'none',
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                        {moreImagesLoading && (
                                            <Box
                                                sx={{
                                                    width: '80px',
                                                    minWidth: '80px',
                                                    maxWidth: '80px',
                                                    flexShrink: 0,
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Skeleton
                                                    variant="rectangular"
                                                    width="100%"
                                                    height="100%"
                                                    animation="wave"
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        {detail && (
                            <Box
                                sx={{
                                    width: showDetail ? `${DETAIL_WIDTH}px` : '0px',
                                    height: '100%',
                                    transition: 'width 0.3s ease-in-out',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    borderLeft: showDetail ? `1px solid ${darkTheme.palette.grey[800]}` : 'none',
                                }}
                            >
                                <Detail
                                    {...detail}
                                    main={embeddedDetailMain}
                                    sx={{
                                        ...detail?.sx,
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </FullScreen>
            </Dialog>
        </ThemeProvider>
    );
}
