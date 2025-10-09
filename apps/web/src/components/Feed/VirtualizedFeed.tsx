/**
 * ⚡ VIRTUALIZED FEED COMPONENT
 * High-performance virtualized list for 60fps scroll with large datasets
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MotionStyle } from 'framer-motion';
import * as RW from 'react-window';
import { useInView } from 'react-intersection-observer';
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface VirtualizedFeedProps {
  items: any[];
  itemHeight: number;
  onLoadMore: () => Promise<any[]>;
  renderItem: (props: { index: number; style: React.CSSProperties; data: any[] }) => React.ReactElement;
  className?: string;
  overscan?: number;
  threshold?: number;
}

export default function VirtualizedFeed({
  items,
  itemHeight,
  onLoadMore,
  renderItem,
  className = '',
  overscan = 5,
  threshold = 0.8
}: VirtualizedFeedProps) {
  const [feedItems, setFeedItems] = useState(items);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [containerHeight, setContainerHeight] = useState(600);

  const containerRef = useRef<HTMLDivElement>(null);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Load more items when scrolling near the end
  const handleItemsRendered = useCallback(({ visibleStopIndex }: { visibleStopIndex: number }) => {
    if (visibleStopIndex >= feedItems.length - 5 && hasMore && !isLoading) {
      loadMoreItems();
    }
  }, [feedItems.length, hasMore, isLoading]);

  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const newItems = await onLoadMore();
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setFeedItems(prev => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Memoized list component for performance
  const MemoizedList = useMemo(() => {
    const ListComponent = (RW as any).FixedSizeList as React.ComponentType<any>;
    return React.memo(({ items, itemHeight, renderItem, onItemsRendered }: { items: any[]; itemHeight: number; renderItem: any; onItemsRendered: (props: any) => void; }) => (
      <ListComponent
        height={containerHeight}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={items}
        onItemsRendered={onItemsRendered}
        overscanCount={overscan}
        className="scrollbar-hide"
      >
        {renderItem}
      </ListComponent>
    ));
  }, [containerHeight, itemHeight, overscan]);

  return (
    <div ref={containerRef} className={`h-full ${className}`}>
      <MemoizedList
        items={feedItems}
        itemHeight={itemHeight}
        renderItem={renderItem}
        onItemsRendered={handleItemsRendered}
      />
      
      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Loading more...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Optimized post item component for virtualization
interface VirtualizedPostItemProps {
  index: number;
  style: React.CSSProperties;
  data: any[];
}


export function VirtualizedPostItem({ index, style, data }: VirtualizedPostItemProps) {
  const post = data[index];
  const [isInView, setIsInView] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  useEffect(() => {
    setIsInView(inView);
  }, [inView]);

  // Only render content when in view for performance
  if (!isInView) {
    return (
      <div ref={ref} style={style} className="flex items-center justify-center">
        <div className="w-full h-96 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={style as unknown as MotionStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4"
    >
      <PostCard post={post} />
    </motion.div>
  );
}

// Simplified post card for virtualization
function PostCard({ post }: { post: any }) {
  return (
    <article className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg overflow-hidden">
      {/* Post header */}
      <div className="p-4 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200">
          <Image
            src={post.petAvatar}
            alt={post.petName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {post.petName}
          </h3>
          <p className="text-sm text-neutral-500">
            {post.timestamp.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Media */}
      <div className="relative">
        <Image
          src={post.media[0]?.url}
          alt={post.caption}
          width={400}
          height={400}
          className="w-full aspect-square object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors">
              <HeartIcon className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors">
              <ShareIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Caption */}
        <div className="mb-2">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {post.petName}
          </span>
          <span className="text-neutral-900 dark:text-neutral-100 ml-2">
            {post.caption}
          </span>
        </div>
      </div>
    </article>
  );
}

// Hook for virtualized feed management
export function useVirtualizedFeed<T>(
  initialItems: T[],
  loadMoreFn: (page: number) => Promise<T[]>,
  itemHeight: number = 600
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return [];
    
    setIsLoading(true);
    try {
      const newItems = await loadMoreFn(page);
      if (newItems.length === 0) {
        setHasMore(false);
        return [];
      }
      
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      return newItems;
    } catch (error) {
      console.error('Failed to load more items:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, loadMoreFn]);

  const refresh = useCallback(async () => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    await loadMore();
  }, [loadMore]);

  return {
    items,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    itemHeight
  };
}

// imports moved to the top of the file
