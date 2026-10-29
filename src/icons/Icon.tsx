import React from 'react';
import classNames from 'classnames';
import { useLucideContext, type LucideProps } from 'lucide-react';

export interface IconProps extends LucideProps {
    children: React.ReactNode;
    iconName?: string;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => {
    const {
        children,
        className,
        color,
        iconName = 'icon',
        size,
        strokeWidth,
        absoluteStrokeWidth,
        nonScalingStroke,
        ...otherProps
    } = props;
    const {
        size: contextSize = 24,
        color: contextColor = 'currentColor',
        strokeWidth: contextStrokeWidth = 2,
        absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
        nonScalingStroke: contextNonScalingStroke = false,
        className: contextClass = '',
    } = useLucideContext() ?? {};
    const resolvedSize = size ?? contextSize;
    const resolvedStrokeWidth = strokeWidth ?? contextStrokeWidth;
    const resolvedAbsoluteStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth;
    const numericSize = typeof resolvedSize === 'number' ? resolvedSize : Number.parseFloat(resolvedSize);
    const calculatedStrokeWidth =
        resolvedAbsoluteStrokeWidth && Number.isFinite(numericSize)
            ? (Number(resolvedStrokeWidth) * 24) / numericSize
            : resolvedStrokeWidth;
    // An explicit `absoluteStrokeWidth` has already compensated the stroke above; keeping the
    // pixel-pinned stroke from context on top would count the compensation twice, so the stroke
    // would thin out as the icon grows. `RingLucideIcon` resolves the two the same way.
    const resolvedNonScalingStroke = nonScalingStroke ?? (absoluteStrokeWidth ? false : contextNonScalingStroke);
    const hasA11yProp = Object.keys(otherProps).some(
        (key) => key.startsWith('aria-') || key === 'role' || key === 'title',
    );

    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            width={resolvedSize}
            height={resolvedSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color ?? contextColor}
            strokeWidth={calculatedStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={classNames('lucide', contextClass, `lucide-${iconName}`, className)}
            {...(!hasA11yProp && { 'aria-hidden': 'true' })}
            {...otherProps}
        >
            {/* `vector-effect` is not inherited, so it has to sit on the drawn shapes themselves —
                which is also where lucide puts it on its own icons. */}
            {resolvedNonScalingStroke
                ? React.Children.map(children, (child) =>
                      React.isValidElement<React.SVGProps<SVGElement>>(child)
                          ? React.cloneElement(child, { vectorEffect: 'non-scaling-stroke' })
                          : child,
                  )
                : children}
        </svg>
    );
});

Icon.displayName = 'Icon';
