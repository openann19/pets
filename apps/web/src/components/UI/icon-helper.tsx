/**
 * React 19 compatibility helper for Hero Icons
 * Properly typed for strict mode and exactOptionalPropertyTypes
 */

import type { ComponentType } from 'react';

/**
 * Helper to properly render HeroIcons in React 19
 * This wraps the icon component to ensure it can be used as a JSX element
 */
export function Icon<T extends { className?: string | undefined }>({
    icon: IconComponent,
    className,
}: {
    icon: ComponentType<T>;
    className?: string | undefined;
}) {
    // Construct props object with proper undefined handling for exactOptionalPropertyTypes
    const iconProps: Partial<T> = {
        ...(className !== undefined ? { className } : {}),
    } as Partial<T>;

    return <IconComponent {...(iconProps as T)} />;
}