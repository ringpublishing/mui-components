import { Card, ClickAwayListener } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import { useComments } from './CommentsContextApi.js';

interface CommentCardContainerProps {
    children: ReactNode;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onHovered?: (value: boolean) => void;
    isActive?: boolean;
    canAway?: boolean;
    canHover?: boolean;
}

export const CommentContainer = ({
    children,
    isActive = false,
    canAway = true,
    onClick,
    onHovered,
    canHover = false,
}: CommentCardContainerProps): React.JSX.Element => {
    const { exitEditing } = useComments();
    const [elevation, setElevation] = useState(0);
    const variant = elevation ? undefined : 'outlined';

    const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
        if (!isActive && typeof onClick === 'function') {
            onClick(event);
        }
    };

    const handleMouseOver = (event: React.MouseEvent<HTMLDivElement>): void => {
        onHovered?.(true);
        setElevation(3);
        event.stopPropagation();
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>): void => {
        if (isActive) {
            return;
        }

        onHovered?.(false);
        setElevation(0);
        event.stopPropagation();
    };

    useEffect(() => {
        if (isActive) {
            setElevation(3);
        } else {
            onHovered?.(false);
            setElevation(0);
        }
    }, [isActive, onHovered]);

    if (canHover) {
        return (
            <ClickAwayListener
                onClickAway={(): void => {
                    if (!isActive) {
                        return;
                    }

                    if (canAway) {
                        exitEditing();
                        setElevation(0);
                        onHovered?.(false);
                    }
                }}
            >
                <Card
                    sx={{
                        paddingBottom: 0,
                        // Workaround for visual bug when transitioning from zero elevation with disabled outlined variant
                        padding: elevation ? '1px' : 0,
                    }}
                    elevation={elevation}
                    variant={variant}
                    onClick={handleClick}
                    onMouseOver={handleMouseOver}
                    onMouseLeave={handleMouseLeave}
                >
                    {children}
                </Card>
            </ClickAwayListener>
        );
    }

    return <Card variant={'outlined'}>{children}</Card>;
};
