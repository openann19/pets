import { cn } from '@/lib/utils';
import React from 'react';


const AlertBase = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        className,
      )}
      {...props}
    />
  ),
);
AlertBase.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescriptionBase = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescriptionBase.displayName = 'AlertDescription';

// React 19-compatible function component wrappers
export function Alert(props: React.HTMLAttributes<HTMLDivElement>) {
  return <AlertBase {...props} />;
}
export function AlertDescription(props: React.HTMLAttributes<HTMLDivElement>) {
  return <AlertDescriptionBase {...props} />;
}
// Keep AlertTitle export for completeness
export { AlertTitle };
