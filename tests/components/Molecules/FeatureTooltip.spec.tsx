import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeatureTooltip, FeatureTooltipProps } from '../../../src/index.js';
import { render } from '../../test-utils/customRenderer.js';

const localStorageMock = (function (): object {
    return {
        getItem: function (): string {
            return JSON.stringify([{ endDate: '2026-06-24T10:49:20.823Z', id: 'test2', shown: 1 }]);
        },
        setItem: vi.fn(),
        removeItem: vi.fn(),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('FeatureTooltip', () => {
    it('should render correctly', async () => {
        const mockProps: FeatureTooltipProps = {
            title: 'Standard tooltip',
            id: 'test1',
            message: 'Test1',
            actions: [
                {
                    label: 'Default action',
                    href: 'https://ringpublishing.com/',
                },
                {
                    label: 'Secondary action',
                    onClick: vi.fn(),
                },
            ],
            endDate: '2026-06-24T10:49:20.823Z',
            children: <div>test1</div>,
        };

        const { findByRole } = render(<FeatureTooltip {...mockProps} />);
        const tooltipText = await findByRole('tooltip');

        expect(tooltipText).toMatchSnapshot();
    });
    it('should not render tooltip because already seen', async () => {
        const mockProps: FeatureTooltipProps = {
            children: <div>test2</div>,
            title: 'Standard tooltip',
            id: 'test2',
            message: 'Test2',
            actions: [
                {
                    label: 'Default action',
                    href: 'https://ringpublishing.com/',
                },
                {
                    label: 'Secondary action',
                    onClick: vi.fn(),
                },
            ],
            endDate: '2026-06-24T10:49:20.823Z',
        };

        const { queryByRole } = render(<FeatureTooltip {...mockProps} />);
        await waitFor(() => expect(queryByRole('tooltip')).toBeNull());
    });
});
