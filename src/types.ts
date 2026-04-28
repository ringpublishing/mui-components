import React, { ReactNode } from 'react';

export interface Action {
    /**
     * The label of the action
     */
    label: string;
    /**
     * The icon of the action (MUI icon component)
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
     * The icon of the action (MUI icon component)
     */
    icon?: ReactNode;
}

export interface Image {
    src: string;
    thumbnailSrc?: string;
    title?: string;
}
