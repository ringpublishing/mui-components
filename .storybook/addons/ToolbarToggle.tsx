import React, { useCallback } from 'react';
import { useGlobals } from 'storybook/manager-api';

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        fontSize: 13,
        padding: '0 8px',
        userSelect: 'none',
        color: '#999',
    },
    track: {
        position: 'relative',
        width: 36,
        height: 20,
        borderRadius: 10,
        transition: 'background-color 0.2s',
    },
    thumb: {
        position: 'absolute',
        top: 2,
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    },
};

interface ToolbarToggleProps {
    globalKey: string;
    onValue: string;
    offValue: string;
    onLabel: string;
    offLabel: string;
    activeColor?: string;
    onIcon?: string;
    offIcon?: string;
    onText?: string;
    offText?: string;
}

export function ToolbarToggle(props: ToolbarToggleProps): React.JSX.Element {
    const {
        globalKey,
        onValue,
        offValue,
        onLabel,
        offLabel,
        activeColor = '#1976d2',
        onIcon,
        offIcon,
        onText,
        offText,
    } = props;

    const [globals, updateGlobals] = useGlobals();
    const isOn = globals[globalKey] === onValue;
    const hasDynamicLabels = onIcon !== undefined && offIcon !== undefined;

    const toggle = useCallback(() => {
        updateGlobals({ [globalKey]: isOn ? offValue : onValue });
    }, [globalKey, isOn, onValue, offValue, updateGlobals]);

    return (
        <div
            role="switch"
            aria-checked={isOn}
            aria-label={`Toggle ${globalKey}`}
            tabIndex={0}
            title={isOn ? `Switch to ${offLabel}` : `Switch to ${onLabel}`}
            onClick={toggle}
            onKeyDown={(e): void => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
            }}
            style={styles.container}
        >
            {hasDynamicLabels ? (
                <>
                    <span style={{ fontSize: 14 }}>{isOn ? onIcon : offIcon}</span>
                    <div
                        style={{
                            ...styles.track,
                            backgroundColor: isOn ? activeColor : '#bdbdbd',
                        }}
                    >
                        <div style={{ ...styles.thumb, left: isOn ? 18 : 2 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 'bold' }}>{isOn ? onText : offText}</span>
                </>
            ) : (
                <>
                    <span style={{ fontSize: 14, fontWeight: 'bold', color: '#999', opacity: isOn ? 1 : 0.5 }}>
                        {onLabel}
                    </span>
                    <div
                        style={{
                            ...styles.track,
                            backgroundColor: isOn ? activeColor : '#bdbdbd',
                        }}
                    >
                        <div style={{ ...styles.thumb, left: isOn ? 18 : 2 }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 'bold', color: '#999', opacity: !isOn ? 1 : 0.5 }}>
                        {offLabel}
                    </span>
                </>
            )}
        </div>
    );
}
