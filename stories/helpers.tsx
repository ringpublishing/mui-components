import React, { ReactElement } from 'react';
import type { StoryContext } from 'storybook/internal/types';
import type { Meta } from '@storybook/react-vite';
import * as MyLibrary from '../src/index.js';
import * as TreeDynamicLoading from '../src/treeDynamicLoading.js';
import * as RingDataGridHelpers from './components/Organisms/DataGrid/common/helpers.js';
import * as RingDataGridColumnsAndRows from './components/Organisms/DataGrid/DataGrid.stories.columnsandrows.js';
import * as mui from '@mui/material';
import * as lucideIcons from 'lucide-react';
import * as muiXDatePickersPro from '@mui/x-date-pickers-pro';
import * as muiXDatePickers from '@mui/x-date-pickers';
import * as muiXDataGrid from '@mui/x-data-grid';
import * as muiXDataGridPro from '@mui/x-data-grid-pro';
import dayjs from 'dayjs';
import CustomIcon from './components/Molecules/Placeholder/CustomIcon.svg';
import * as AdapterDayjs from '@mui/x-date-pickers-pro/AdapterDayjs';
import { Playground } from 'storybook-addon-code-editor';
import * as Heading from '@tiptap/extension-heading';
import * as Code from '@tiptap/extension-code';
import * as dndKitSortable from '@dnd-kit/sortable';
import * as tanstackReactQuery from '@tanstack/react-query';
import * as RingDemoData from './helpers/ringDemoData.js';
import * as RingDemoImages from './helpers/imagesData.js';
import { setStorySourceCode, deleteStorySourceCode } from './storySourceRegistry.js';

export type CustomProps = Record<string, unknown>;

/**
 * Loosens the `argTypes` field of `Meta<T>` to accept dot-notation keys
 * (`'slots.media'`, `'slotProps.card'`, …) that aren't part of the component's
 * prop interface. Storybook supports such keys at runtime, but strict
 * `Meta<typeof X>` rejects them. Use with `satisfies`:
 *
 * ```ts
 * const meta = {
 *     component: Foo,
 *     argTypes: {
 *         'slots.bar': { ... },
 *     },
 * } satisfies LooseArgTypesMeta<typeof Foo>;
 * ```
 */
export type LooseArgTypesMeta<TComponent> = Omit<Meta<TComponent>, 'argTypes'> & {
    argTypes: Record<string, unknown>;
};

function customPropsToString(customProps: CustomProps): string {
    let customPropsString = '';

    for (const propKey in customProps) {
        if (typeof customProps[propKey] !== 'function') {
            customPropsString += `
            ${propKey}={${JSON.stringify(customProps[propKey])}}
            `;
        } else {
            customPropsString += `
            ${propKey}={()=>{}}
            `;
        }
    }

    return customPropsString;
}

export function createCodeSnippet(componentName: string, customProps: CustomProps, additionalImports: string): string {
    const customPropsString = customPropsToString(customProps);

    let componentCode = `<${componentName} ${customPropsString} 
            {...props}/>`;

    if (customProps.children) {
        const children = customProps.children;
        delete customProps.children;
        const customPropsString = customPropsToString(customProps);

        componentCode = `<${componentName} ${customPropsString} {...props}>
        ${Array.isArray(children) ? children.join('\r\n') : children}
        </${componentName}>`;
    }

    return `import { ${componentName} } from '@ringpublishing/mui-components'
${additionalImports}

export default ({props}:  React.ComponentProps<typeof ${componentName}>) => {
    return (
        ${componentCode}
    )
}
`;
}

export interface CreateCodeStoryParams<T = Record<string, unknown>> {
    context: StoryContext;
    componentName?: string | null;
    customProps?: T;
    example: ReactElement;
    customCode?: string | null;
    additionalImports?: string;
}

export function createCodeStory<T = Record<string, unknown>>({
    context,
    componentName = null,
    customProps = {} as T,
    example,
    customCode = null,
    additionalImports = '',
}: CreateCodeStoryParams<T>): React.JSX.Element {
    if (!componentName) {
        // component name should be accessible in context.kind as last string after /,
        // for example context.kind = Components/Filters/Accordion
        const kind = context.kind.split('/');
        componentName = kind?.pop() || '';
    }

    if (customCode) {
        setStorySourceCode(context.id, customCode);
    } else {
        deleteStorySourceCode(context.id);
    }

    if (context?.viewMode === 'story') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                {example}
            </div>
        );
    }

    return (
        <div className="playground-wrapper">
            <Playground
                code={
                    customCode ||
                    createCodeSnippet(componentName, customProps as Record<string, unknown>, additionalImports)
                }
                id={context.id}
                modifyEditor={(monaco: {
                    editor: {
                        setTheme: (theme: string) => void;
                    };
                }): void => {
                    monaco.editor.setTheme('vs-dark');
                }}
                availableImports={{
                    '@ringpublishing/mui-components': MyLibrary,
                    '@ringpublishing/mui-components/tree-dynamic-loading': TreeDynamicLoading,
                    '@mui/material': mui,
                    'lucide-react': lucideIcons,
                    '@mui/x-data-grid': muiXDataGrid,
                    '@mui/x-data-grid-pro': muiXDataGridPro,
                    // @ts-expect-error FIXME
                    dayjs,
                    '@mui/x-date-pickers': muiXDatePickers,
                    '@mui/x-date-pickers-pro': muiXDatePickersPro,
                    '@mui/x-date-pickers-pro/AdapterDayjs': AdapterDayjs,
                    RingDataGridHelpers,
                    RingDataGridColumnsAndRows,
                    RingDemoData,
                    RingDemoImages,
                    CustomIcon,
                    '@tiptap/extension-heading': Heading,
                    '@tiptap/extension-code': Code,
                    '@dnd-kit/sortable': dndKitSortable,
                    '@tanstack/react-query': tanstackReactQuery,
                }}
            />
        </div>
    );
}

/**
 * Ready values the Default story's controls pick from. Each `label` is the value as code, so the dropdown shows
 * exactly what reaches the prop rather than a name for it.
 */
export type Presets<T> = Record<string, { value: T; label: string }>;

/** A select over ready values: the option list shows each value as code, the prop row keeps its real type. */
export const preset = <T,>(values: Presets<T>, description: string): object => ({
    control: {
        type: 'select',
        labels: Object.fromEntries(Object.entries(values).map(([key, { label }]) => [key, label])),
    },
    options: Object.keys(values),
    mapping: Object.fromEntries(Object.entries(values).map(([key, { value }]) => [key, value])),
    description: `${description} The list holds ready values for this story and shows each one as it is passed.`,
});
