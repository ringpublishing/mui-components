import { SwitchProps } from '../../../../../src/index.js';

// Appearance defaults only. The checked state is set per story, because several stories
// pair a checked switch with an unchecked one and rely on the absence of `defaultChecked`.
const defaultArgs: Partial<SwitchProps> = {
    color: 'primary',
    size: 'medium',
    disabled: false,
};

export default defaultArgs;
