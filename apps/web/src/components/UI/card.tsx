import React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  ),
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

// React 19 JSX compatibility aliases (typed, no any)
export const CardComponent = Card as unknown as (
  props: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
export const CardContentComponent = CardContent as unknown as (
  props: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
export const CardHeaderComponent = CardHeader as unknown as (
  props: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
export const CardFooterComponent = CardFooter as unknown as (
  props: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
export const CardTitleComponent = CardTitle as unknown as (
  props: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }
) => React.ReactElement;
export const CardDescriptionComponent = CardDescription as unknown as (
  props: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLParagraphElement> }
) => React.ReactElement;

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
