import { createContext } from 'react';

import type { AvatarSize } from './Avatar.js';

// `AvatarGroup` passes its size down, so every avatar in a group, the counter included, has the same size.
export const AvatarSizeContext = createContext<AvatarSize | undefined>(undefined);
