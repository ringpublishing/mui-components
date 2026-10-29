import { describe, it, expect } from 'vitest';
import type { Theme } from '@mui/material';
import { render, screen } from '../../test-utils/customRenderer.js';
import { Typography } from '../../../src/components/Atoms/Typography/Typography.js';

const styleOf = (text: string): CSSStyleDeclaration => getComputedStyle(screen.getByText(text));

describe('Typography', () => {
    describe('with enableOverflow', () => {
        it('applies an sx callback that reads the theme', () => {
            render(
                <Typography
                    enableOverflow={true}
                    sx={(theme: Theme): object => ({ color: theme.palette.error.main, fontWeight: 700 })}
                >
                    callback
                </Typography>,
            );

            expect(styleOf('callback').fontWeight).toBe('700');
            expect(styleOf('callback').textOverflow).toBe('ellipsis');
        });

        it('applies every entry of an sx array', () => {
            render(
                <Typography enableOverflow={true} sx={[{ fontWeight: 700 }, (): object => ({ letterSpacing: '2px' })]}>
                    array
                </Typography>,
            );

            expect(styleOf('array').fontWeight).toBe('700');
            expect(styleOf('array').letterSpacing).toBe('2px');
            expect(styleOf('array').whiteSpace).toBe('nowrap');
        });

        it('lets an sx object override the overflow defaults', () => {
            render(
                <Typography enableOverflow={true} sx={{ width: '50%' }}>
                    object
                </Typography>,
            );

            expect(styleOf('object').width).toBe('50%');
            expect(styleOf('object').overflow).toBe('hidden');
        });
    });

    it('applies an sx callback without enableOverflow', () => {
        render(<Typography sx={(): object => ({ fontWeight: 700 })}>plain</Typography>);

        expect(styleOf('plain').fontWeight).toBe('700');
    });
});
