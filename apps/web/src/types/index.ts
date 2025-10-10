// Re-export core types
export type {
  User,
  Pet,
  Match,
  Message,
  SwipeAction,
  SwipeResult,
} from '@pawfectmatch/core';

// Web-specific type extensions
export interface UserPreferences {
  maxDistance: number;
  ageRange: { min: number; max: number };
  sizePreference: ('small' | 'medium' | 'large')[];
  breedPreference: string[];
  temperamentPreference: string[];
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface UserStats {
  totalSwipes: number;
  totalLikes: number;
  totalMatches: number;
  totalSuperLikes: number;
  matchRate: number;
  responseRate: number;
  averageResponseTime: number;
}

// Pet-specific web extensions (if needed, otherwise use core Pet type)

export interface MedicalRecord {
  id: string;
  date: string;
  type: 'checkup' | 'surgery' | 'illness' | 'injury' | 'other';
  description: string;
  veterinarian: string;
  documents?: string[];
}

export interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDue?: string;
  veterinarian: string;
  certificateUrl?: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  width?: number;
  height?: number;
  aiAnalysis?: {
    breed: string;
    confidence: number;
    traits: string[];
    quality: number;
  };
}

export interface Video {
  id: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  size: number;
}

// Web-specific message extensions
export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

// Notification data types for different notification types
export interface MatchNotificationData {
  matchId: string;
  petId: string;
  petName: string;
  petPhoto?: string;
}

export interface MessageNotificationData {
  matchId: string;
  senderId: string;
  senderName: string;
  messagePreview: string;
  messageId: string;
}

export interface LikeNotificationData {
  likerId: string;
  likerName: string;
  likerPhoto?: string;
  petId: string;
}

export interface SuperLikeNotificationData {
  likerId: string;
  likerName: string;
  likerPhoto?: string;
  petId: string;
  message?: string;
}

export interface VisitorNotificationData {
  visitorId: string;
  visitorName: string;
  visitorPhoto?: string;
  visitCount: number;
}

export interface SystemNotificationData {
  action?: string;
  metadata?: Record<string, unknown>;
  version?: string;
}

// Union type for all notification data
export type NotificationData = 
  | MatchNotificationData 
  | MessageNotificationData 
  | LikeNotificationData 
  | SuperLikeNotificationData 
  | VisitorNotificationData 
  | SystemNotificationData;

export interface Notification {
  id: string;
  userId: string;
  type: 'match' | 'message' | 'like' | 'superlike' | 'visitor' | 'system';
  title: string;
  message: string;
  data?: NotificationData;
  imageUrl?: string;
  actionUrl?: string;
  isRead: boolean;
  isSeen: boolean;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium' | 'premium_plus';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: PaymentMethod;
  features: string[];
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedPetId?: string;
  reportedMessageId?: string;
  reason: 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  resolution?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// Weather-related types for enhanced weather service
export interface WeatherAlert {
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  start: string;
  end: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  icon: string;
}

export interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  sunrise: string;
  sunset: string;
  moonPhase: string;
  icon: string;
}

export interface AirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  category: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
}

export interface PetSafetyInfo {
  walkSafety: 'safe' | 'caution' | 'unsafe';
  recommendations: string[];
  heatRisk: 'low' | 'moderate' | 'high' | 'extreme';
  coldRisk: 'low' | 'moderate' | 'high' | 'extreme';
  uvRisk: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
  bestWalkTimes: string[];
}
