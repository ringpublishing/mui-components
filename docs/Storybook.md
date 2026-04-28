# Storybook

## Write Storybook's story

Make sure you added comments to TypeScript interface, comments will be render in argTypes array.

```typescript
export interface YourComponentProps {
    /**
     * CSS additional class
     */
    className?: string;
    /**
     * Label of YourComponent
     * @default Test
     */
    label?: string;
}
```

If your component extends MUI component add this information to storybook. Write which component is extended and add link to mui documentation.

```
parameters: {
    docs: {
        description: {
            component: 'SplitButton extens [ButtonGroup](https://mui.com/material-ui/react-button-group/).<br> All properties of MaterialUI ButtonGroup API are supported.'
        }
    }
}
```

If your component has actions (onClick, onChange, onHover etc.) in stories assign them *actions('onActionName')* as value.
This actions should be visible in *Actions* tab in storybook.
Note: this part applies only to args object, props in custom code should be normal functions.

```typescript
import { action } from 'storybook/actions';

args = {
    onClick: actions('onClick'),
    onChange: actions('onChange')
}
```

## Toolbar Switches

The Storybook toolbar includes custom toggle switches for dark mode and language. These are implemented as custom addons in `.storybook/addons/`.

### Dark Mode Switch

A toggle switch (sun/moon icons) that switches between light and dark theme. It is **automatically visible** on all stories in the `Components` section. No configuration needed — it reads/writes the `theme` global which the decorator in `preview.tsx` passes to `ThemeConfig`.

### Language Switch (PL / EN)

A toggle switch that switches between English and Polish. It is **only visible** on stories that opt in via `parameters.withLanguageSupport`.

To enable the language switch on your story, add `withLanguageSupport: true` to the story's `parameters`:

```typescript
// In meta (applies to all stories in the file):
const meta: Meta<typeof YourComponent> = {
    component: YourComponent,
    parameters: {
        withLanguageSupport: true,
    },
};

// Or on a single story:
export const Default: Story = {
    parameters: {
        withLanguageSupport: true,
    },
    // ...
};
```

When enabled, a `PL / EN` toggle appears in the toolbar. The selected locale is passed to the `ThemeConfig` decorator which provides MUI locale context to all child components.

### Adding a New Toolbar Toggle

Both switches use a shared `ToolbarToggle` component (`.storybook/addons/ToolbarToggle.tsx`). To add a new toggle:

1. Create a new file in `.storybook/addons/` (e.g., `mySwitch.tsx`)
2. Use `ToolbarToggle` with appropriate props:

```tsx
import React from 'react';
import { addons, types } from 'storybook/manager-api';
import { ToolbarToggle } from './ToolbarToggle.js';

addons.register('ring-ui/my-switch', () => {
    addons.add('ring-ui/my-switch/tool', {
        type: types.TOOL,
        title: 'My Switch',
        render: () => (
            <ToolbarToggle
                globalKey="myGlobal"      // key in Storybook globals
                onValue="valueA"          // value when toggle is ON
                offValue="valueB"         // value when toggle is OFF
                onLabel="A"               // left label
                offLabel="B"              // right label
                activeColor="#1976d2"      // track color when ON
            />
        ),
        match: ({ storyId }) => !!storyId?.startsWith('components-'),
    });
});
```

3. Import it in `.storybook/manager.ts`:

```typescript
import './addons/mySwitch.js';
```

4. Read the global value in the decorator in `.storybook/preview.tsx` via `context.globals.myGlobal`

To write story use *createCodeStory* helper. It will generate story which:
- at *story* viewmode has pure canvas (renders *example* passed to *createCodeStory*)
- at *docs* viewmode has editor with editable code snippet

*createCodeStory* will auto generate code snippet based on passed props, for more complex components it will be better to pass *customCode* property.
*customCode* is a string containing module declaration with your component.

Examples:

- **with auto generated code**

```tsx
import { createCodeStory } from '../../helpers/storybookHelpers';

export const Default: StoryObj<typeof meta> = {
    args: {
        // here children should be in jsx form but to generate code correctly 
        // you must also passe children to customProps as array of strings 
        // this part is important for *story* viewmode
        children: (
            <TextField
                required={true}
                id="outlined-required"
                label="Required"
                defaultValue="Hello World"
            />
        )
    },
    render: (args, context) => createCodeStory({
        context,
        // see form of customProps.children here
        customProps:{children: [`<TextField
                required={true}
                id="outlined-required"
                label="Required"
                defaultValue="Hello World"
            />`]},
            // if you are using external component add it's import here
        additionalImports: "import { TextField } from '@mui/material';",
        // note: example should be component, not string (important for 'story' viewmode)
        example: <FiltersSection {...args}/>
    })
};
```

- **with custom code**

```tsx
import {createCodeStory} from '../../helpers/storybookHelpers'
// import your code in raw form
import customCodeFile from 'customCode.tsx?raw'

export const Default: StoryObj<typeof meta> = {
    args: {
        // here children should be in jsx, important for *story* viewmode 
        children: (
            <TextField
                required={true}
                id="outlined-required"
                label="Required"
                defaultValue="Hello World"
            />
        )
    },
    render: (args, context) => createCodeStory({
        context,
        customCode: customCodeFile,
        // note: example should be component, not string (important for 'story' viewmode)
        example: <FiltersSection {...args}/>
    })
};
```

customCode.tsx

```tsx
import { TextField } from '@mui/material';
import { FiltersSection } from '@ringpublishing/mui-components';
import React from 'react';

export default ({props}) => {
    return (
        <FiltersSection {...props}>
             <TextField
                required={true}
                id="outlined-required"
                label="Required"
                defaultValue="Hello World"
            />
        </FiltersSection>
    );
}
```
