import { AIPencil } from './AiPencil.js';
import { EarthOff } from './EarthOff.js';
import { ListFilterOff } from './ListFilterOff.js';
import { createRingIcon } from './createRingIcon.js';

// The custom glyphs with the MUI `SvgIcon` prop surface. The bare glyphs stay exported for the
// slots that take a `LucideIcon` (`RingLucideIcon icon={…}`, component `icon` props).
export const AIPencilIcon = createRingIcon(AIPencil, 'AIPencilIcon');
export const EarthOffIcon = createRingIcon(EarthOff, 'EarthOffIcon');
export const ListFilterOffIcon = createRingIcon(ListFilterOff, 'ListFilterOffIcon');
