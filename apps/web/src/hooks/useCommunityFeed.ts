import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { communityApi, type CommunityPost } from '@/services/apiClient';

export interface UseCommunityFeedReturn {
  posts: CommunityPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  error: string | null;
  newPostContent: string;
  selectedPost: CommunityPost | null;
  commentInputs: Record<string, string>;
  isSubmittingPost: boolean;
  likeSubmitting: Record<string, boolean>;
  commentSubmitting: Record<string, boolean>;
  showReportDialog: boolean;
  reportingTarget: { type: 'post' | 'user' | 'comment'; id: string; userId?: string } | null;
  moderation: {
    blockedUsers: Set<string>;
    reportedContent: Set<string>;
    isReporting: boolean;
    reportReason: string;
    reportDetails: string;
  };

  // Actions
  setNewPostContent: (content: string) => void;
  setSelectedPost: (post: CommunityPost | null) => void;
  setCommentInput: (postId: string, comment: string) => void;
  handleCreatePost: () => Promise<void>;
  handleLike: (postId: string) => Promise<void>;
  handleComment: (postId: string) => Promise<void>;
  refreshFeed: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  handleReport: (type: 'post' | 'user' | 'comment', id: string, userId?: string) => void;
  submitReport: () => Promise<void>;
  handleBlockUser: (userId: string) => Promise<void>;
  setShowReportDialog: (show: boolean) => void;
  updateModeration: (updates: Partial<typeof moderation>) => void;
}

const POSTS_PER_PAGE = 20;

export const useCommunityFeed = (): UseCommunityFeedReturn => {
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [likeSubmitting, setLikeSubmitting] = useState<Record<string, boolean>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportingTarget, setReportingTarget] = useState<{ type: 'post' | 'user' | 'comment'; id: string; userId?: string } | null>(null);

  const [moderation, setModeration] = useState({
    blockedUsers: new Set<string>(),
    reportedContent: new Set<string>(),
    isReporting: false,
    reportReason: '',
    reportDetails: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Query for posts data
  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['community-posts', currentPage],
    queryFn: async () => {
      const response = await communityApi.getFeed({ page: currentPage, limit: POSTS_PER_PAGE });
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const posts = postsData?.posts || [];
  const hasNextPage = postsData ? postsData.posts.length === POSTS_PER_PAGE : false;

  // Infinite scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
          setCurrentPage(prev => prev + 1);
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
  }, [hasNextPage]);

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      return await communityApi.createPost({ content });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['community-posts', 1], (oldData: any) => ({
        ...oldData,
        posts: [response.post, ...(oldData?.posts || [])],
      }));
      setNewPostContent('');
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await communityApi.likePost(postId);
    },
    onSuccess: (response, postId) => {
      queryClient.setQueryData(['community-posts', currentPage], (oldData: any) => ({
        ...oldData,
        posts: oldData?.posts?.map((post: CommunityPost) =>
          post._id === postId ? { ...post, likes: response.post.likes, liked: response.post.liked } : post
        ),
      }));
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, comment }: { postId: string; comment: string }) => {
      return await communityApi.addComment(postId, comment);
    },
    onSuccess: (response, { postId }) => {
      queryClient.setQueryData(['community-posts', currentPage], (oldData: any) => ({
        ...oldData,
        posts: oldData?.posts?.map((post: CommunityPost) =>
          post._id === postId ? { ...post, comments: [...post.comments, response.comment] } : post
        ),
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      return await communityApi.reportContent(reportData);
    },
    onSuccess: () => {
      setModeration(prev => ({
        ...prev,
        reportedContent: new Set([...prev.reportedContent, reportingTarget?.id || '']),
      }));
      setShowReportDialog(false);
      setReportingTarget(null);
      setModeration(prev => ({
        ...prev,
        reportReason: '',
        reportDetails: '',
        isReporting: false,
      }));
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await communityApi.blockUser(userId);
    },
    onSuccess: (_, userId) => {
      setModeration(prev => ({
        ...prev,
        blockedUsers: new Set([...prev.blockedUsers, userId]),
      }));
      // Remove posts from blocked user
      queryClient.setQueryData(['community-posts', currentPage], (oldData: any) => ({
        ...oldData,
        posts: oldData?.posts?.filter((post: CommunityPost) => post.author._id !== userId),
      }));
    },
  });

  // Actions
  const handleCreatePost = useCallback(async () => {
    const trimmedContent = newPostContent.trim();
    if (!trimmedContent) return;

    try {
      setIsSubmittingPost(true);
      await createPostMutation.mutateAsync(trimmedContent);
    } finally {
      setIsSubmittingPost(false);
    }
  }, [newPostContent, createPostMutation]);

  const handleLike = useCallback(async (postId: string) => {
    try {
      setLikeSubmitting(prev => ({ ...prev, [postId]: true }));
      await likeMutation.mutateAsync(postId);
    } finally {
      setLikeSubmitting(prev => {
        const { [postId]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [likeMutation]);

  const handleComment = useCallback(async (postId: string) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    try {
      setCommentSubmitting(prev => ({ ...prev, [postId]: true }));
      await commentMutation.mutateAsync({ postId, comment });
    } finally {
      setCommentSubmitting(prev => {
        const { [postId]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [commentInputs, commentMutation]);

  const refreshFeed = useCallback(async () => {
    setCurrentPage(1);
    await refetch();
  }, [refetch]);

  const loadMorePosts = useCallback(async () => {
    if (!hasNextPage) return;
    setCurrentPage(prev => prev + 1);
  }, [hasNextPage]);

  const handleReport = useCallback((type: 'post' | 'user' | 'comment', id: string, userId?: string) => {
    setReportingTarget({ type, id, userId });
    setShowReportDialog(true);
  }, []);

  const submitReport = useCallback(async () => {
    if (!reportingTarget || !moderation.reportReason.trim()) return;

    try {
      setModeration(prev => ({ ...prev, isReporting: true }));
      await reportMutation.mutateAsync({
        targetType: reportingTarget.type,
        targetId: reportingTarget.id,
        reason: moderation.reportReason,
        details: moderation.reportDetails,
      });
    } catch (error) {
      console.error('Report submission failed:', error);
      setModeration(prev => ({ ...prev, isReporting: false }));
    }
  }, [reportingTarget, moderation.reportReason, moderation.reportDetails, reportMutation]);

  const handleBlockUser = useCallback(async (userId: string) => {
    await blockUserMutation.mutateAsync(userId);
  }, [blockUserMutation]);

  const setCommentInput = useCallback((postId: string, comment: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: comment }));
  }, []);

  const updateModeration = useCallback((updates: Partial<typeof moderation>) => {
    setModeration(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    posts,
    isLoading,
    isRefreshing: false, // Could be derived from mutations
    isLoadingMore: currentPage > 1 && isLoading,
    hasNextPage,
    error: error?.message || null,
    newPostContent,
    selectedPost,
    commentInputs,
    isSubmittingPost,
    likeSubmitting,
    commentSubmitting,
    showReportDialog,
    reportingTarget,
    moderation,

    // Actions
    setNewPostContent,
    setSelectedPost,
    setCommentInput,
    handleCreatePost,
    handleLike,
    handleComment,
    refreshFeed,
    loadMorePosts,
    handleReport,
    submitReport,
    handleBlockUser,
    setShowReportDialog,
    updateModeration,
  };
};
