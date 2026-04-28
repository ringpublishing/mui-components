import { ButtonProps } from '@mui/material';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Placeholder, PlaceholderVariant } from '../../../src/components/Molecules/Placeholder/Placeholder.js';
import { defaultLabels } from '../../../src/components/Molecules/Placeholder/defaultLabels.js';
import { CommonLanguages } from '../../../src/helpers/commonTypes.js';
import { ThemeConfig } from '../../../src/theme/theme.js';

describe('Component: Placeholder', () => {
    it.each([
        {
            variant: PlaceholderVariant.ERROR,
            labels: defaultLabels.error.enUS,
        },
        {
            variant: PlaceholderVariant.ERROR_LIST,
            labels: defaultLabels.error_list.enUS,
        },
        {
            variant: PlaceholderVariant.NOT_FOUND,
            labels: defaultLabels.not_found.enUS,
        },
        {
            variant: PlaceholderVariant.EMPTY,
            labels: defaultLabels.empty.enUS,
        },
        {
            variant: PlaceholderVariant.EMPTY_BOX,
            labels: defaultLabels.empty_box.enUS,
        },
    ])('should render default labels and data-testid for $variant variant', ({ variant, labels }) => {
        const { getByTestId, getByText } = render(
            <ThemeConfig mode={'light'}>
                <Placeholder variant={variant} />
            </ThemeConfig>,
        );

        expect(getByTestId(`ring-placeholder-${variant}`)).toBeDefined();

        if (labels.header) {
            expect(getByText(labels.header)).toBeDefined();
        }

        if (labels.description) {
            expect(getByText(labels.description)).toBeDefined();
        }
    });

    it('should render labels for selected variant and language from defaults', () => {
        const { getByText } = render(
            <ThemeConfig mode={'light'} language={CommonLanguages.plPL}>
                <Placeholder variant={PlaceholderVariant.NOT_FOUND} />
            </ThemeConfig>,
        );

        expect(getByText(defaultLabels.not_found.plPL?.header ?? '')).toBeDefined();
        expect(getByText(defaultLabels.not_found.plPL?.description ?? '')).toBeDefined();
    });

    it('should prefer custom labels over default labels', () => {
        const labels = {
            header: 'Nie udało się pobrać listy',
            description: 'Odśwież stronę i spróbuj ponownie.',
            footer: 'Błąd 4009',
        };

        const { getByText, queryByText } = render(
            <ThemeConfig mode={'light'}>
                <Placeholder variant={PlaceholderVariant.ERROR_LIST} labels={labels} />
            </ThemeConfig>,
        );

        expect(getByText(labels.header)).toBeDefined();
        expect(getByText(labels.description)).toBeDefined();
        expect(getByText(labels.footer)).toBeDefined();
        expect(queryByText(defaultLabels.error_list.enUS.header ?? '')).toBeNull();
    });

    it('should update labels and data-testid when variant changes dynamically', () => {
        const { rerender, getByTestId, getByText, queryByText } = render(
            <ThemeConfig mode={'light'}>
                <Placeholder variant={PlaceholderVariant.EMPTY} />
            </ThemeConfig>,
        );

        expect(getByTestId('ring-placeholder-empty')).toBeDefined();
        expect(getByText(defaultLabels.empty.enUS.description ?? '')).toBeDefined();

        rerender(
            <ThemeConfig mode={'light'}>
                <Placeholder variant={PlaceholderVariant.NOT_FOUND} />
            </ThemeConfig>,
        );

        expect(getByTestId('ring-placeholder-not_found')).toBeDefined();
        expect(getByText(defaultLabels.not_found.enUS.header ?? '')).toBeDefined();
        expect(queryByText(defaultLabels.empty.enUS.description ?? '')).toBeNull();
    });

    it('should render custom image element when img prop is provided', () => {
        const { getByTestId } = render(
            <ThemeConfig mode={'light'}>
                <Placeholder img={<span data-testid="custom-placeholder-icon">icon</span>} />
            </ThemeConfig>,
        );

        expect(getByTestId('custom-placeholder-icon')).toBeDefined();
    });

    it('should render buttons with data test ids and call provided onClick handler', () => {
        const handleClick = vi.fn();
        const buttons: ButtonProps[] = [
            {
                children: 'Retry',
                onClick: handleClick,
            },
            {
                children: 'Details',
            },
        ];

        const { getByTestId, getByText } = render(
            <ThemeConfig mode={'light'}>
                <Placeholder buttons={buttons} dataTestIdSuffix={'actions'} />
            </ThemeConfig>,
        );

        fireEvent.click(getByText('Retry'));

        expect(handleClick).toHaveBeenCalledTimes(1);
        expect(getByTestId('ring-placeholder-error-actions-button-0')).toBeDefined();
        expect(getByTestId('ring-placeholder-error-actions-button-1')).toBeDefined();
    });

    it('should fall back to enUS labels when language does not exist in defaults', () => {
        const { getByText } = render(
            <ThemeConfig mode={'light'}>
                <Placeholder variant={PlaceholderVariant.EMPTY_BOX} language={'deDE' as CommonLanguages} />
            </ThemeConfig>,
        );

        expect(getByText(defaultLabels.empty_box.enUS.description ?? '')).toBeDefined();
    });
});
