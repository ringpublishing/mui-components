import React from 'react';
import { ThemeConfig } from '../../src/theme/theme.js';
import { render, RenderResult } from '@testing-library/react';

export function WithRingThemeHOC(component: React.ReactNode): React.ReactNode {
    return <ThemeConfig mode={'light'} version="reference">{component}</ThemeConfig>;
}

export function renderWithTheme(component: React.ReactNode): RenderResult {
    return render(WithRingThemeHOC(component));
}
