import { addons } from 'storybook/manager-api';
import theme from './theme.js';
import './addons/darkModeSwitch.js';
import './addons/languageSwitch.js';

addons.setConfig({
    theme,
});
