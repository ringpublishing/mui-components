import { registerComponentsVersion } from '@ringpublishing/mui-theme';
import { HAS_UNRELEASED_CHANGES, PACKAGE_VERSION, PACKAGE_VERSION_RELEASED } from './version.generated.js';

export * from './components/index.js';
// export * from './helpers/';
export * from './types.js';
export * from './theme/index.js';

registerComponentsVersion({
    version: PACKAGE_VERSION,
    releasedVersion: PACKAGE_VERSION_RELEASED,
    hasUnreleased: HAS_UNRELEASED_CHANGES,
});
