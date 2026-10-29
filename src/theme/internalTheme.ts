import type React from 'react';
import type { ThemeConfigProps as CoreThemeConfigProps } from '@ringpublishing/mui-theme';

import { ThemeConfig as PublicThemeConfig } from './theme.js';

// Internal to the library's tests and Storybook, never exported from a package entry: the public props leave out
// `version`, which ThemeConfig still forwards.
export const ThemeConfig = PublicThemeConfig as (props: CoreThemeConfigProps) => React.ReactNode[] | React.ReactNode;
