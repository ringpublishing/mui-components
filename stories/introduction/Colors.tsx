import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { getCreatedTheme } from '../../src/index.js';

export const Colors = (): ReactNode => {
    const theme = getCreatedTheme('light');

    const getContrastText = (hex: string): string => {
        const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (!match) {
            return '#000';
        } // fallback

        const r = parseInt(match[1], 16);
        const g = parseInt(match[2], 16);
        const b = parseInt(match[3], 16);
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

        return luminance > 0.55 ? '#000' : '#fff';
    };

    const hexToRgba = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);

            return `rgba(${r}, ${g}, ${b}, 1)`;
        }

        return hex;
    };

    const hexToHsla = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (result) {
            const r = parseInt(result[1], 16) / 255;
            const g = parseInt(result[2], 16) / 255;
            const b = parseInt(result[3], 16) / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const l = (max + min) / 2;
            let h = 0,
                s = 0;

            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                switch (max) {
                    case r: {
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    }
                    case g: {
                        h = (b - r) / d + 2;
                        break;
                    }
                    case b: {
                        h = (r - g) / d + 4;
                        break;
                    }
                }

                h /= 6;
            }

            return `hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, 1)`;
        }

        return hex;
    };

    const renderColorPalette = () => {
        if (!theme.colors) {
            return null;
        }

        return Object.entries(theme.colors).map(([colorName, colorValues]) => (
            <Box key={colorName} sx={{ mb: 4 }}>
                {/* Color Category Header */}
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', fontSize: '24px' }}>
                    # {colorName.charAt(0).toUpperCase() + colorName.slice(1)}
                </Typography>

                {/* Color Shades */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {Object.entries(colorValues).map(([shade, colorValue], index, array) => (
                        <Box
                            key={`${colorName}-${shade}`}
                            sx={{
                                display: 'flex',
                                minHeight: 100,
                            }}
                        >
                            {/* Left side - Color info */}
                            <Box
                                sx={{
                                    width: '40%',
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '18px',
                                        color: '#333',
                                    }}
                                >
                                    {colorName}/{shade}
                                </Typography>
                            </Box>

                            {/* Right side - Color swatch and values */}
                            <Box
                                sx={{
                                    width: '60%',
                                    backgroundColor: colorValue,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    p: 3,
                                    position: 'relative',
                                }}
                            >
                                {/* Color values */}
                                <Box sx={{ mt: 1 }}>
                                    {(() => {
                                        const textColor = getContrastText(colorValue as string);

                                        return (
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        fontSize: '16px',
                                                        color: textColor,
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {colorValue}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontSize: '12px',
                                                        color: textColor,
                                                        display: 'block',
                                                        opacity: 0.85,
                                                        mb: 0.25,
                                                    }}
                                                >
                                                    {hexToRgba(colorValue as string)}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontSize: '12px',
                                                        color: textColor,
                                                        display: 'block',
                                                        opacity: 0.85,
                                                    }}
                                                >
                                                    {hexToHsla(colorValue as string)}
                                                </Typography>
                                            </>
                                        );
                                    })()}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        ));
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: '24px',
                flexDirection: 'column',
            }}
        >
            <Stack direction={'column'} spacing={1}>
                <Typography variant={'h3'}>Colors</Typography>
                <Typography variant={'body2'}>All available colors from theme</Typography>
            </Stack>

            {renderColorPalette()}
        </Box>
    );
};
