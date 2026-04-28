import type { Meta } from '@storybook/react-vite';
import { FeatureTooltip } from '../../../../src/index.js';
import { Default } from './stories/Default.js';
import { WithOneAction } from './stories/WithOneAction.js';
import { WithNoActions } from './stories/WithNoActions.js';
import { WithImage } from './stories/WithImage.js';
import defaultArgs from './common/defaultArgs.js';
import FeatureTooltipMdx from './FeatureTooltip.mdx';

const meta: Meta<typeof FeatureTooltip> = {
    component: FeatureTooltip,
    parameters: {
        docs: {
            page: FeatureTooltipMdx,
        },
    },
    args: {
        ...defaultArgs,
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'Feature tooltip title displayed in the header of the tooltip card.',
            table: {
                category: 'content',
            },
        },
        message: {
            control: 'text',
            description: 'Feature tooltip message body. Not required if `videoEmbed` is passed.',
            table: {
                category: 'content',
            },
        },
        actions: {
            control: 'object',
            description:
                'Action buttons for the tooltip footer. Accepts up to two actions: `[primaryAction, secondaryAction?]`. ' +
                'Each action can have `label`, `href`, `onClick`, and `icon` fields.',
            table: {
                category: 'content',
                type: {
                    summary: '[{ label: string; href?: string; onClick?: (e) => void; icon?: ReactNode }, ...?]',
                },
            },
        },
        videoEmbed: {
            control: 'text',
            description:
                'URL to embed a video (e.g. YouTube). Ensure the URL contains `/embed/`. ' +
                'Not required if `message` is passed. Takes priority over `image`.',
            table: {
                category: 'content',
            },
        },
        image: {
            control: 'text',
            description:
                'URL to an image displayed in the tooltip card. ' + 'Not shown if `videoEmbed` is also provided.',
            table: {
                category: 'content',
            },
        },
        children: {
            description:
                'The element that triggers and anchors the tooltip. Must be a single React element (e.g. a `<div>` or `<Button>`).',
            table: {
                category: 'content',
                type: { summary: 'React.ReactElement' },
            },
        },
        id: {
            control: 'text',
            description:
                'Unique identifier for the tooltip instance. Used to track and persist display state in `localStorage`. ' +
                'Must be unique across all tooltip instances in your application.',
            table: {
                category: 'behavior',
            },
        },
        endDate: {
            control: 'text',
            description:
                'ISO date string after which the tooltip will no longer be shown. ' +
                'Example: `"2026-12-31T00:00:00.000Z"`.',
            table: {
                category: 'behavior',
            },
        },
        capping: {
            control: 'number',
            description:
                'Maximum number of times the tooltip can be shown to the user. ' +
                'The display count is persisted in `localStorage`.',
            table: {
                category: 'behavior',
                defaultValue: { summary: '1' },
            },
        },
        showDelay: {
            control: 'number',
            description: 'Delay in milliseconds before the tooltip appears after mounting.',
            table: {
                category: 'behavior',
                defaultValue: { summary: '0' },
            },
        },
        offset: {
            control: 'object',
            description: 'Positional offset applied to the tooltip: `[x-offset, y-offset]`.',
            table: {
                category: 'appearance',
                type: { summary: '[number, number]' },
            },
        },
        onShow: {
            description: 'Callback fired when the tooltip becomes visible.',
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },
        onClose: {
            description: "Callback fired when the user dismisses the tooltip by clicking the '×' close button.",
            table: {
                category: 'callbacks',
                type: { summary: '() => void' },
            },
        },
        sx: {
            control: 'object',
            description: 'MUI System properties to customize the root element style.',
            table: {
                category: 'customization',
                type: { summary: 'SxProps<Theme>' },
            },
        },
        className: {
            control: 'text',
            description: 'CSS class name applied to the root element.',
            table: {
                category: 'customization',
            },
        },
        dataTestIdSuffix: {
            control: 'text',
            description:
                'Optional suffix appended to the generated `data-testid` attribute (base: `ring-featuretooltip`).',
            table: {
                category: 'customization',
                type: { summary: 'string' },
            },
        },
    },
} satisfies Meta<typeof FeatureTooltip>;

export default meta;

export { Default, WithOneAction, WithNoActions, WithImage };
