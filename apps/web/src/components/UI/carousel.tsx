import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Carousel - Main container component for the carousel system
 * Provides structure and context for carousel items and navigation
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative w-full', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Carousel.displayName = 'Carousel';

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * CarouselContent - Scrollable container for carousel items
 * Handles overflow and item layout with smooth scrolling
 */
export const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CarouselContent.displayName = 'CarouselContent';

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * CarouselItem - Individual item within the carousel
 * Provides snap points and flexible sizing
 */
export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('min-w-full snap-center flex-shrink-0', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CarouselItem.displayName = 'CarouselItem';

interface CarouselButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: 'prev' | 'next';
}

/**
 * CarouselPrevious - Navigation button to scroll to previous item
 * Positioned absolutely on the left side of the carousel
 */
export const CarouselPrevious = React.forwardRef<HTMLButtonElement, Omit<CarouselButtonProps, 'direction'>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 z-10',
          'rounded-full bg-white/90 dark:bg-gray-800/90 p-2',
          'shadow-lg hover:bg-white dark:hover:bg-gray-800',
          'transition-all hover:scale-110',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
        aria-label="Previous slide"
        {...props}
      >
        <ChevronLeftIcon className="h-5 w-5 text-gray-900 dark:text-white" />
      </button>
    );
  },
);
CarouselPrevious.displayName = 'CarouselPrevious';

/**
 * CarouselNext - Navigation button to scroll to next item
 * Positioned absolutely on the right side of the carousel
 */
export const CarouselNext = React.forwardRef<HTMLButtonElement, Omit<CarouselButtonProps, 'direction'>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 z-10',
          'rounded-full bg-white/90 dark:bg-gray-800/90 p-2',
          'shadow-lg hover:bg-white dark:hover:bg-gray-800',
          'transition-all hover:scale-110',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
        aria-label="Next slide"
        {...props}
      >
        <ChevronRightIcon className="h-5 w-5 text-gray-900 dark:text-white" />
      </button>
    );
  },
);
CarouselNext.displayName = 'CarouselNext';

// React 19 JSX compatibility aliases (typed, no any)
export const CarouselComponent = Carousel as unknown as (
  props: CarouselProps & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
export const CarouselContentComponent = CarouselContent as unknown as (
  props: CarouselContentProps & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
export const CarouselItemComponent = CarouselItem as unknown as (
  props: CarouselItemProps & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
export const CarouselPreviousComponent = CarouselPrevious as unknown as (
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> }
) => React.ReactElement;
export const CarouselNextComponent = CarouselNext as unknown as (
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> }
) => React.ReactElement;

export { type CarouselProps, type CarouselContentProps, type CarouselItemProps };
