import React, { ReactNode } from 'react';

export interface Action {
    /**
     * The label of the action
     */
    label: string;
    /**
     * Called when the action is clicked.
     */
    onClick?: ((e?: React.MouseEvent<Element, MouseEvent>) => void) | React.MouseEventHandler;
    /**
     * If the action is disabled
     */
    disabled?: boolean;
    /**
     * The reason why the action is disabled
     */
    disabledReason?: string;
    /**
     * Icon shown before the label.
     */
    icon?: ReactNode;
}

export interface Image {
    src: string;
    thumbnailSrc?: string;
    /**
     * Text alternative of the image: its `alt` in `Media` and `LightBox`. Describe what the picture shows,
     * not its file name.
     */
    title?: string;
}
