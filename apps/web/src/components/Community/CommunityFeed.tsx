import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { communityApi, type CommunityPost } from '@/services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DialogComponent as Dialog,
  DialogContentComponent as DialogContent,
  DialogHeaderComponent as DialogHeader,
  DialogTitleComponent as DialogTitle,
} from '@/components/ui/dialog';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Textarea } from '@/components/ui/textarea';
import { ErrorBoundary, useErrorHandler } from '@/components/ErrorBoundary';
import {
  AlertTriangle,
  Calendar,
  Flag,
  Heart,
  Image,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  Send,
  Share2,
  Shield,
  Smile,
  Users,
  UserX,
} from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface CommunityFeedProps {
  userId: string;
  onCreatePost?: (content: string, images?: string[]) => void;
  onLikePost?: (postId: string) => void;
  onCommentOnPost?: (postId: string, comment: string) => void;
  onSharePost?: (postId: string) => void;
  onJoinActivity?: (activityId: string) => void;
}

// Moderation types
interface ReportReason {
  id: string;
  label: string;
  description: string;
}

interface ModerationState {
  blockedUsers: Set<string>;
  reportedContent: Set<string>;
  isReporting: boolean;
  reportReason: string;
  reportDetails: string;
}

// Optimized Image Component with lazy loading and responsive images
const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* Optimized image with responsive srcSet */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          // Add srcSet for responsive images (basic implementation)
          srcSet={`${src} 1x, ${src} 2x`}
        />
      )}
    </div>
  );
});

export const CommunityFeed = ({
  userId: _userId,
  onCreatePost,
  onLikePost,
  onCommentOnPost,
  onSharePost,
  onJoinActivity,
}: CommunityFeedProps): React.ReactElement => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [likeSubmitting, setLikeSubmitting] = useState<Record<string, boolean>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Infinite scroll state
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const POSTS_PER_PAGE = 20;

  // Moderation state
  const [moderation, setModeration] = useState<ModerationState>({
    blockedUsers: new Set(),
    reportedContent: new Set(),
    isReporting: false,
    reportReason: '',
    reportDetails: '',
  });
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportingTarget, setReportingTarget] = useState<{ type: 'post' | 'user' | 'comment'; id: string; userId?: string | undefined } | null>(null);

  // Follow state
  const [followSubmitting, setFollowSubmitting] = useState<Record<string, boolean>>({});

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const { handleError, handleAsyncError } = useErrorHandler();

  // Report reasons for moderation
  const reportReasons: ReportReason[] = [
    { id: 'spam', label: 'Spam', description: 'Unsolicited commercial content or repetitive posts' },
    { id: 'harassment', label: 'Harassment', description: 'Bullying, threats, or abusive behavior' },
    { id: 'inappropriate', label: 'Inappropriate Content', description: 'Nudity, violence, or offensive material' },
    { id: 'misinformation', label: 'Misinformation', description: 'False information about pets or health' },
    { id: 'copyright', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted content' },
    { id: 'other', label: 'Other', description: 'Other violation of community guidelines' },
  ];

  const formatTimeAgo = useCallback((dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  const syncSelectedPost = useCallback(
    (updatedPosts: CommunityPost[]) => {
      if (!selectedPost) return;
      const matching = updatedPosts.find((post) => post._id === selectedPost._id);
      if (matching) {
        setSelectedPost(matching);
      }
    },
    [selectedPost],
  );

  const loadPosts = useCallback(async (isRefresh = false, page = 1) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (page > 1) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await handleAsyncError(
        () => communityApi.getFeed({ page, limit: POSTS_PER_PAGE }),
        'loading community posts'
      );

      if (isRefresh || page === 1) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }

      // Update pagination state
      setHasNextPage(response.posts.length === POSTS_PER_PAGE);
      setCurrentPage(page);

      syncSelectedPost(response.posts);
    } catch (err) {
      const errorResult = handleError(err as Error, 'loading community posts');
      setError(errorResult.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [syncSelectedPost, handleAsyncError, handleError, POSTS_PER_PAGE]);

  const refreshFeed = useCallback(() => {
    void loadPosts(true);
  }, [loadPosts]);

  // Infinite scroll function
  const loadMorePosts = useCallback(async () => {
    if (!hasNextPage || isLoadingMore) return;
    await loadPosts(false, currentPage + 1);
  }, [hasNextPage, isLoadingMore, currentPage, loadPosts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
          void loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isLoadingMore, loadMorePosts]);

  // Moderation functions
  const handleReport = useCallback((type: 'post' | 'user' | 'comment', id: string, userId?: string) => {
    setReportingTarget({ type, id, userId });
    setShowReportDialog(true);
  }, []);

  const submitReport = useCallback(async () => {
    if (!reportingTarget || !moderation.reportReason.trim()) return;

    try {
      setModeration(prev => ({ ...prev, isReporting: true }));

      await handleAsyncError(
        () => communityApi.reportContent({
          targetType: reportingTarget.type,
          targetId: reportingTarget.id,
          reason: moderation.reportReason,
          details: moderation.reportDetails,
        }),
        'submitting report'
      );

      setModeration(prev => ({
        ...prev,
        reportedContent: new Set([...prev.reportedContent, reportingTarget.id])
      }));

      setShowReportDialog(false);
      setReportingTarget(null);
      setModeration(prev => ({
        ...prev,
        reportReason: '',
        reportDetails: '',
      }));
    } catch (err) {
      handleError(err as Error, 'submitting report');
    } finally {
      setModeration(prev => ({ ...prev, isReporting: false }));
    }
  }, [reportingTarget, moderation.reportReason, moderation.reportDetails, handleAsyncError, handleError]);

  const handleBlockUser = useCallback(async (userId: string) => {
    try {
      await handleAsyncError(
        () => communityApi.blockUser(userId),
        'blocking user'
      );

      setModeration(prev => ({
        ...prev,
        blockedUsers: new Set([...prev.blockedUsers, userId])
      }));

      // Remove posts from blocked users
      setPosts(prev => prev.filter(post => post.author._id !== userId));
    } catch (err) {
      handleError(err as Error, 'blocking user');
    }
  }, [handleAsyncError, handleError]);

  // Follow functions
  const handleFollow = useCallback(async (userId: string) => {
    try {
      setFollowSubmitting((prev) => ({ ...prev, [userId]: true }));
      await handleAsyncError(
        () => communityApi.followUser(userId),
        'following user'
      );

      // Update follow status in posts
      setPosts((prev) => prev.map((post) =>
        post.author._id === userId
          ? { ...post, authorFollowed: true }
          : post
      ));
    } catch (err) {
      handleError(err as Error, 'following user');
    } finally {
      setFollowSubmitting((prev) => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [handleAsyncError, handleError]);

  const handleUnfollow = useCallback(async (userId: string) => {
    try {
      setFollowSubmitting((prev) => ({ ...prev, [userId]: true }));
      await handleAsyncError(
        () => communityApi.unfollowUser(userId),
        'unfollowing user'
      );

      // Update follow status in posts
      setPosts((prev) => prev.map((post) =>
        post.author._id === userId
          ? { ...post, authorFollowed: false }
          : post
      ));
    } catch (err) {
      handleError(err as Error, 'unfollowing user');
    } finally {
      setFollowSubmitting((prev) => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [handleAsyncError, handleError]);

  // Notification functions
  const checkNotificationSupport = useCallback(() => {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }, []);

  const checkNotificationPermission = useCallback(async () => {
    if (!checkNotificationSupport()) return;

    const permission = Notification.permission;
    setNotificationPermission(permission);

    if (permission === 'granted') {
      setNotificationsEnabled(true);
    } else if (permission === 'default') {
      setShowNotificationPrompt(true);
    }
  }, [checkNotificationSupport]);

  const requestNotificationPermission = useCallback(async () => {
    if (!checkNotificationSupport()) return;

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        await subscribeToNotifications();
        setNotificationsEnabled(true);
      }
    } catch (error) {
      handleError(error as Error, 'requesting notification permission');
    }
    setShowNotificationPrompt(false);
  }, [checkNotificationSupport, handleError]);

  const subscribeToNotifications = useCallback(async () => {
    if (!checkNotificationSupport()) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'] || '',
      });

      await handleAsyncError(
        () => communityApi.subscribeToNotifications(subscription),
        'subscribing to notifications'
      );
    } catch (error) {
      handleError(error as Error, 'subscribing to notifications');
    }
  }, [checkNotificationSupport, handleAsyncError, handleError]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Global keyboard shortcuts
    if (event.key === 'n' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      // Focus on post creation area
      const postCreation = document.getElementById('community-post-creation');
      postCreation?.focus();
    }

    if (event.key === 'Escape') {
      // Close any open dialogs
      if (showReportDialog) {
        setShowReportDialog(false);
        setReportingTarget(null);
      }
      if (selectedPost) {
        setSelectedPost(null);
      }
    }
  }, [showReportDialog, selectedPost]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management for dialogs
  useEffect(() => {
    if (showReportDialog || selectedPost) {
      // Focus trap for dialogs - focus first focusable element
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      firstFocusable?.focus();
    }
  }, [syncSelectedPost, handleAsyncError, handleError, POSTS_PER_PAGE]);

  const handleCreatePost = useCallback(async () => {
    const trimmedContent = newPostContent.trim();
    if (!trimmedContent) return;

    try {
      setIsSubmittingPost(true);
      const response = await handleAsyncError(
        () => communityApi.createPost({ content: trimmedContent }),
        'creating community post'
      );
      setPosts((prev) => {
        const updated = [response.post, ...prev];
        syncSelectedPost(updated);
        return updated;
      });
      setNewPostContent('');
      onCreatePost?.(response.post.content, response.post.images);
    } catch (err) {
      handleError(err as Error, 'creating community post');
    } finally {
      setIsSubmittingPost(false);
    }
  }, [newPostContent, onCreatePost, syncSelectedPost, handleAsyncError, handleError]);

  const handleLike = useCallback(
    async (postId: string) => {
      try {
        setLikeSubmitting((prev) => ({ ...prev, [postId]: true }));
        const response = await communityApi.likePost(postId);
        setPosts((prev) => {
          const updated = prev.map((post) =>
            post._id === postId
              ? {
                ...post,
                likes: response.post.likes,
                liked: response.post.liked ?? post.liked ?? false,
              }
              : post,
          );
          syncSelectedPost(updated);
          return updated;
        });
        onLikePost?.(postId);
      } catch (err) {
        setError((err as Error).message || 'Failed to like post');
      } finally {
        setLikeSubmitting((prev) => {
          const { [postId]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [onLikePost, syncSelectedPost],
  );

  const handleComment = useCallback(
    async (postId: string) => {
      const comment = commentInputs[postId]?.trim();
      if (!comment) return;

      try {
        setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));
        const response = await communityApi.addComment(postId, comment);
        setPosts((prev) => {
          const updated = prev.map((post) =>
            post._id === postId
              ? { ...post, comments: [...post.comments, response.comment] }
              : post,
          );
          syncSelectedPost(updated);
          return updated;
        });
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        onCommentOnPost?.(postId, comment);
      } catch (err) {
        setError((err as Error).message || 'Failed to add comment');
      } finally {
        setCommentSubmitting((prev) => {
          const { [postId]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [commentInputs, onCommentOnPost, syncSelectedPost],
  );

  const PostCard = useCallback(
    ({ post, showFullContent = false }: { post: CommunityPost; showFullContent?: boolean }) => (
      <Card className="mb-4">
        <CardContent className="p-4">
          <header className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={post.author.avatar || ''}
                  alt={`${post.author.name}'s profile picture`}
                />
                <AvatarFallback aria-label={`${post.author.name}'s avatar`}>
                  {post.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{post.author.name}</h3>
                  {post.packName && (
                    <>
                      <span className="text-gray-400" aria-hidden="true">in</span>
                      <Badge variant="outline" className="text-xs">
                        {post.packName}
                      </Badge>
                    </>
                  )}
                </div>
                <time
                  className="text-sm text-gray-500"
                  dateTime={post.createdAt}
                  aria-label={`Posted ${formatTimeAgo(post.createdAt)}`}
                >
                  {formatTimeAgo(post.createdAt)}
                </time>
              </div>
            </div>

            <div className="flex gap-1">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReport('post', post._id, post.author._id)}
                  title="Report post"
                  aria-label={`Report post by ${post.author.name}`}
                >
                  <Flag className="h-4 w-4" aria-hidden="true" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleBlockUser(post.author._id)}
                  title="Block user"
                  aria-label={`Block ${post.author.name}`}
                >
                  <UserX className="h-4 w-4" aria-hidden="true" />
                </Button>
              </motion.div>
            </div>
          </header>

          <section aria-label="Post content">
            <p className="text-gray-900 whitespace-pre-wrap">
              {showFullContent
                ? post.content
                : post.content.slice(0, 200) + (post.content.length > 200 ? '...' : '')}
            </p>
          </section>

          {post.images && post.images.length > 0 && (
            <section aria-label={`Photo gallery with ${post.images.length} image${post.images.length > 1 ? 's' : ''}`}>
              <div
                className={`grid gap-2 mb-3 ${post.images.length === 1
                    ? 'grid-cols-1'
                    : post.images.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-2 md:grid-cols-3'
                  }`}
              >
                {post.images.map((image, index) => (
                  <OptimizedImage
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1} by ${post.author.name}`}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    priority={index === 0} // Only prioritize the first image
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ))}
              </div>
            </section>
          )}

          {post.type === 'activity' && post.activityDetails && (
            <section aria-labelledby={`activity-${post._id}`} className="mb-3">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      <h4 id={`activity-${post._id}`} className="font-medium text-blue-900">
                        Upcoming Activity
                      </h4>
                    </div>
                    <Badge variant="secondary" aria-label={`${post.activityDetails.currentAttendees} out of ${post.activityDetails.maxAttendees} attendees`}>
                      {post.activityDetails.currentAttendees}/{post.activityDetails.maxAttendees} attending
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      <time dateTime={post.activityDetails.date}>
                        {new Date(post.activityDetails.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      <address className="not-italic">{post.activityDetails.location}</address>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => onJoinActivity?.(post._id)}
                    aria-label={`Join ${post.activityDetails.currentAttendees + 1} of ${post.activityDetails.maxAttendees} attendees for this activity`}
                  >
                    <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                    Join Activity
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}

          <section aria-label="Post statistics">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-4">
                <span aria-label={`${post.likes} people liked this post`}>{post.likes} likes</span>
                <span aria-label={`${post.comments.length} comments on this post`}>{post.comments.length} comments</span>
              </div>
            </div>
          </section>

          <nav aria-label="Post actions">
            <div className="flex items-center gap-1 border-t pt-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleLike(post._id)}
                  className="w-full"
                  disabled={Boolean(likeSubmitting[post._id])}
                  aria-label={likeSubmitting[post._id] ? "Liking post..." : "Like this post"}
                  aria-pressed={post.liked}
                >
                  <Heart className="h-4 w-4 mr-2" aria-hidden="true" />
                  Like
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPost(post)}
                  className="w-full"
                  aria-label="View and add comments to this post"
                  aria-expanded={selectedPost?._id === post._id}
                >
                  <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                  Comment
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSharePost?.(post._id)}
                  className="w-full"
                  aria-label="Share this post"
                >
                  <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Share
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  variant={post.authorFollowed ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => post.authorFollowed ? handleUnfollow(post.author._id) : handleFollow(post.author._id)}
                  disabled={Boolean(followSubmitting[post.author._id])}
                  className="w-full"
                  aria-label={post.authorFollowed ? `Unfollow ${post.author.name}` : `Follow ${post.author.name} to see their posts`}
                  aria-pressed={post.authorFollowed}
                >
                  {post.authorFollowed ? 'Following' : 'Follow'}
                </Button>
              </motion.div>
            </div>
          </nav>
        </CardContent>
      </Card>
    ),
    [formatTimeAgo, handleLike, likeSubmitting, onJoinActivity, handleFollow, handleUnfollow, followSubmitting, onSharePost, handleBlockUser, handleReport, selectedPost],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">Loading community feed...</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main" aria-labelledby="community-feed-heading">
      {/* Skip Link for Accessibility */}
      <a
        href="#community-post-creation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Skip to create post
      </a>

      <Card>
        <CardHeader>
          <CardTitle id="community-feed-heading" className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" aria-hidden="true" />
            Community Feed
          </CardTitle>
          <CardDescription>Stay connected with your pack groups and fellow pet lovers</CardDescription>
        </CardHeader>
      </Card>

      {/* Notification Permission Prompt */}
      {showNotificationPrompt && checkNotificationSupport() && (
        <Card
          className="border-blue-200 bg-blue-50 dark:bg-blue-900/20"
          role="region"
          aria-labelledby="notification-prompt-heading"
          aria-live="polite"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    id="notification-prompt-heading"
                    className="font-semibold text-blue-900 dark:text-blue-100"
                  >
                    Stay Updated!
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Get notified about new posts, activities, and messages from your community.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotificationPrompt(false)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Dismiss notification prompt"
                  >
                    Later
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    onClick={requestNotificationPermission}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    aria-label="Enable push notifications for community updates"
                  >
                    Enable Notifications
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card role="alert" aria-live="assertive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadPosts()}
                  aria-label="Retry loading community posts"
                >
                  Retry
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card id="community-post-creation" role="region" aria-labelledby="post-creation-heading">
        <CardHeader>
          <CardTitle id="post-creation-heading">Share with Your Community</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarFallback aria-label="Your profile avatar">You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share something with your community..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[80px] resize-none"
                aria-label="Write your community post"
                aria-describedby="post-hint"
              />
              <div id="post-hint" className="sr-only">
                Share updates, photos, or organize activities with fellow pet owners
              </div>
              <div className="flex items-center justify-between mt-3">
                <fieldset className="flex items-center gap-2">
                  <legend className="sr-only">Post attachments</legend>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Add photos to your post"
                    >
                      <Image className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Add location to your post"
                    >
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Add emoji to your post"
                    >
                      <Smile className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </motion.div>
                </fieldset>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => void handleCreatePost()}
                    disabled={!newPostContent.trim() || isSubmittingPost}
                    aria-label={isSubmittingPost ? "Creating post..." : "Share your post with the community"}
                  >
                    <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                    {isSubmittingPost ? "Posting..." : "Post"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className="space-y-4"
        role="feed"
        aria-label="Community posts feed"
        aria-live="polite"
        aria-busy={isLoading}
      >
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => (
            <motion.article
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05, // Staggered entrance
                ease: "easeOut"
              }}
              layout // Smooth layout changes
              className="focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded-lg"
              tabIndex={-1}
            >
              <PostCard post={post} />
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* Infinite scroll loading indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading more posts...</span>
        </div>
      )}

      {/* Intersection observer target */}
      {hasNextPage && !isLoadingMore && (
        <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Scroll for more posts
          </div>
        </div>
      )}

      {/* End of feed indicator */}
      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-5 w-5" />
            <span>You've seen all posts!</span>
          </div>
        </div>
      )}

      {selectedPost && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Dialog
              open={!!selectedPost}
              onOpenChange={() => setSelectedPost(null)}
            >
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post Details</DialogTitle>
                </DialogHeader>

                <PostCard post={selectedPost} showFullContent />

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Comments</h4>

                  {selectedPost.comments.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {selectedPost.comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar || ''} />
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <div className="font-semibold text-sm">{comment.author.name}</div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-4">No comments yet.</p>
                  )}

                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="Write a comment..."
                        value={commentInputs[selectedPost._id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [selectedPost._id]: e.target.value,
                          }))
                        }
                        className="min-h-[60px] resize-none"
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => void handleComment(selectedPost._id)}
                          disabled={
                            !commentInputs[selectedPost._id]?.trim() || Boolean(commentSubmitting[selectedPost._id])
                          }
                          className="self-end"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Report Dialog */}
      {showReportDialog && reportingTarget && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report {reportingTarget.type}</DialogTitle>
                  <DialogDescription>
                    Help us keep the community safe by reporting inappropriate content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason for report</label>
                    <select
                      value={moderation.reportReason}
                      onChange={(e) => setModeration(prev => ({ ...prev, reportReason: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select a reason...</option>
                      {reportReasons.map((reason) => (
                        <option key={reason.id} value={reason.id}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Additional details (optional)</label>
                    <Textarea
                      value={moderation.reportDetails}
                      onChange={(e) => setModeration(prev => ({ ...prev, reportDetails: e.target.value }))}
                      placeholder="Provide more context about this report..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={submitReport}
                        disabled={!moderation.reportReason.trim() || moderation.isReporting}
                      >
                        {moderation.isReporting ? 'Reporting...' : 'Submit Report'}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
