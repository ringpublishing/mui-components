import React from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { TimePicker } from '../../../../../../src/index.js';
import defaultArgs from '../common/defaultArgs.js';

type Story = StoryObj<typeof TimePicker>;

const Example = (): React.JSX.Element => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
                <h3 style={{ margin: '0 0 4px 0' }}>Without paddingBottom: 3px (current)</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#666' }}>
                    Default minHeight: 32px. Standard is shorter than Outlined due to missing border height.
                </p>
                <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Standard</div>
                        <TimePicker {...defaultArgs} label="Time" />
                    </div>
                    <div>
                        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Outlined</div>
                        <TimePicker {...defaultArgs} label="Time" slotProps={{ textField: { variant: 'outlined' } }} />
                    </div>
                </div>
            </div>
            <div>
                <h3 style={{ margin: '0 0 4px 0' }}>With paddingBottom: 3px (previous)</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#666' }}>
                    InputProps.sx.paddingBottom: 3px increases Standard height slightly. Outlined gets extra bottom
                    padding.
                </p>
                <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Standard + 3px</div>
                        <TimePicker
                            {...defaultArgs}
                            label="Time"
                            slotProps={{
                                textField: {
                                    InputProps: { sx: { paddingBottom: '3px' } },
                                },
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Outlined + 3px</div>
                        <TimePicker
                            {...defaultArgs}
                            label="Time"
                            slotProps={{
                                textField: {
                                    variant: 'outlined',
                                    InputProps: { sx: { paddingBottom: '3px' } },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
            <div>
                <h3 style={{ margin: '0 0 4px 0' }}>
                    Aligned labels and input text via InputProps.sx + InputLabelProps.sx overrides
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#666' }}>
                    Standard InputProps.sx: minHeight 53px (matches Outlined natural height), alignItems flex-end +
                    paddingBottom 11.5px to align input text vertically. InputLabelProps.sx.top: 6px shifts label down
                    to match Outlined label position.
                </p>
                <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                            Standard (aligned)
                        </div>
                        <TimePicker
                            {...defaultArgs}
                            label="Time"
                            slotProps={{
                                textField: {
                                    InputLabelProps: { sx: { top: '6px' } },
                                    InputProps: {
                                        sx: {
                                            minHeight: '53px',
                                            alignItems: 'flex-end',
                                            paddingBottom: '11.5px',
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                            Outlined (natural)
                        </div>
                        <TimePicker
                            {...defaultArgs}
                            label="Time"
                            slotProps={{
                                textField: {
                                    variant: 'outlined',
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Comparison: Story = {
    args: {
        ...defaultArgs,
    },
    render: () => {
        return <Example />;
    },
};
