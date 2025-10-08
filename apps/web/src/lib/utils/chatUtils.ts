import type { Match, User } from '../types';

/**
 * Determines the other user in a match (not the current user)
 */
export const getOtherUser = (match: Match, currentUserId: string): User => {
  return match.user1._id === currentUserId ? match.user2 : match.user1;
};

/**
 * Determines the other pet in a match (not owned by current user)
 */
export const getOtherPet = (match: Match, currentUserId: string) => {
  return match.pet1.owner === currentUserId ? match.pet2 : match.pet1;
};

/**
 * Determines the current user's pet in a match
 */
export const getCurrentUserPet = (match: Match, currentUserId: string) => {
  return match.pet1.owner === currentUserId ? match.pet1 : match.pet2;
};

/**
 * Gets the list of typing users (excluding current user)
 */
export const getTypingUsers = (
  isTyping: Record<string, boolean>,
  currentUserId: string,
  otherUser: User
): string[] => {
  return Object.keys(isTyping)
    .filter(userId => isTyping[userId] && userId !== currentUserId)
    .map(userId => {
      if (userId === otherUser._id) {
        return otherUser.firstName;
      }
      return 'Someone';
    });
};
