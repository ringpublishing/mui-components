import { registerComponentsVersion } from '@ringpublishing/mui-theme';
import { HAS_UNRELEASED_CHANGES, PACKAGE_VERSION, PACKAGE_VERSION_RELEASED } from './version.generated.js';

export * from './components/index.js';
export type { Action, Image } from './types.js';
export type { CommonComponentProps } from './helpers/commonTypes.js';
export type { GetItemDataTestId, WithItemDataTestId } from './helpers/dataTestId.js';
export { ThemeConfig, getCreatedTheme, type GetCreatedThemeOptions, type ThemeConfigProps } from './theme/theme.js';
export {
    CommonLanguages,
    DEFAULT_LUCIDE_ICON_SIZE,
    DEFAULT_LUCIDE_STROKE_WIDTH,
    RingIconDefaults,
    type RingIconDefaultsProps,
} from '@ringpublishing/mui-theme';
export {
    AIPencil,
    AIPencilIcon,
    EarthOff,
    EarthOffIcon,
    ListFilterOff,
    ListFilterOffIcon,
    createRingIcon,
    type RingIcon,
    type RingIconProps,
} from './icons/index.js';
export { RingLucideIcon, type RingLucideIconColor, type RingLucideIconProps } from './helpers/RingLucideIcon.js';

registerComponentsVersion({
    version: PACKAGE_VERSION,
    releasedVersion: PACKAGE_VERSION_RELEASED,
    hasUnreleased: HAS_UNRELEASED_CHANGES,
});
