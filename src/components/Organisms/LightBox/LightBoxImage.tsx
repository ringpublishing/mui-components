import { Skeleton } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface LightBoxImageProps {
    src?: string;
    alt?: string;
    style?: React.CSSProperties;
    height: string | number;
    width: string | number;
    forceLoading?: boolean;
    testId?: string;
    imageRef?: React.RefObject<HTMLImageElement | null>;
    onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onDragStart?: (event: React.DragEvent<HTMLImageElement>) => void;
    isFading?: boolean;
}

export function LightBoxImage(props: LightBoxImageProps): React.JSX.Element {
    const {
        src,
        alt,
        style,
        height,
        width,
        forceLoading,
        testId,
        imageRef,
        onLoad: onLoadProp,
        onDragStart,
        isFading = false,
    } = props;

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        if (imageRef?.current) {
            const img = imageRef.current;

            if (img.complete && img.naturalHeight !== 0) {
                setLoading(false);

                if (onLoadProp) {
                    const syntheticEvent = { currentTarget: img } as React.SyntheticEvent<HTMLImageElement>;
                    onLoadProp(syntheticEvent);
                }
            }
        }
    }, [src]);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>): void => {
        setLoading(false);

        if (onLoadProp) {
            onLoadProp(event);
        }
    };

    const showSkeleton = forceLoading || loading;
    const targetOpacity = isFading ? 0 : 1;

    return (
        <>
            {showSkeleton && (
                <Skeleton
                    variant="rectangular"
                    width={width}
                    height={height}
                    animation="wave"
                    sx={{
                        position: 'absolute',
                        ...(style && { left: style.left, top: style.top }),
                    }}
                />
            )}
            <img
                ref={imageRef}
                src={src}
                alt={alt}
                style={{
                    height,
                    width,
                    display: showSkeleton ? 'none' : 'block',
                    opacity: targetOpacity,
                    transition: 'opacity 300ms ease-in-out',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    ...style,
                }}
                onLoad={handleLoad}
                onError={(): void => {
                    setLoading(false);
                }}
                onDragStart={onDragStart}
                data-testid={testId}
            />
        </>
    );
}
