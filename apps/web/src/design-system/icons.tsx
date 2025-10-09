/**
 * 🎨 ICON SYSTEM
 * React components for Heroicons subset with consistent styling
 */

import React from 'react';
// Solid variant icons actually used
import {
  HeartIcon,
  XMarkIcon,
  StarIcon,
  SparklesIcon,
  ArrowPathIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  CameraIcon,
  PhotoIcon,
  VideoCameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

// Outline variant icons
import {
  HeartIcon as HeartOutlineIcon,
  XMarkIcon as XOutlineIcon,
  StarIcon as StarOutlineIcon,
  SparklesIcon as SparklesOutlineIcon,
  ArrowPathIcon as RefreshOutlineIcon,
  UserIcon as UserOutlineIcon,
  ChatBubbleLeftRightIcon as ChatOutlineIcon,
  MapPinIcon as LocationOutlineIcon,
  CameraIcon as CameraOutlineIcon,
  PhotoIcon as PhotoOutlineIcon,
  VideoCameraIcon as VideoOutlineIcon,
  PhoneIcon as PhoneOutlineIcon,
  EnvelopeIcon as EmailOutlineIcon,
  BellIcon as NotificationOutlineIcon,
  Cog6ToothIcon as SettingsOutlineIcon,
  HomeIcon as HomeOutlineIcon,
  MagnifyingGlassIcon as SearchOutlineIcon,
  PlusIcon as PlusOutlineIcon,
  MinusIcon as MinusOutlineIcon,
  CheckIcon as CheckOutlineIcon,
  ExclamationTriangleIcon as WarningOutlineIcon,
  InformationCircleIcon as InfoOutlineIcon,
  XCircleIcon as ErrorOutlineIcon,
} from '@heroicons/react/24/outline';

// Icon size variants
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Icon color variants
export type IconColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral' | 'white' | 'black';

// Base icon props
export interface BaseIconProps {
  size?: IconSize;
  color?: IconColor;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

// Icon size mapping
const ICON_SIZES: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

// Icon color mapping
const ICON_COLORS: Record<IconColor, string> = {
  primary: 'text-primary-500',
  secondary: 'text-secondary-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
  error: 'text-error-500',
  neutral: 'text-neutral-500',
  white: 'text-white',
  black: 'text-black',
};

// Base icon wrapper component
const IconWrapper: React.FC<BaseIconProps & { children: React.ReactNode }> = ({
  size = 'md',
  color = 'neutral',
  className = '',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = true,
  children,
}) => {
  const sizeClass = ICON_SIZES[size];
  const colorClass = ICON_COLORS[color];
  
  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClass} ${colorClass} ${className}`}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
    >
      {children}
    </span>
  );
};

// Solid icons
export const Heart = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <HeartIcon className="w-full h-full" />
  </IconWrapper>
);

export const X = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <XMarkIcon className="w-full h-full" />
  </IconWrapper>
);

export const Star = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <StarIcon className="w-full h-full" />
  </IconWrapper>
);

export const Sparkles = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <SparklesIcon className="w-full h-full" />
  </IconWrapper>
);

export const Refresh = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <ArrowPathIcon className="w-full h-full" />
  </IconWrapper>
);

export const User = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <UserIcon className="w-full h-full" />
  </IconWrapper>
);

export const Chat = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <ChatBubbleLeftRightIcon className="w-full h-full" />
  </IconWrapper>
);

export const Location = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <MapPinIcon className="w-full h-full" />
  </IconWrapper>
);

export const Camera = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <CameraIcon className="w-full h-full" />
  </IconWrapper>
);

export const Photo = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <PhotoIcon className="w-full h-full" />
  </IconWrapper>
);

export const Video = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <VideoCameraIcon className="w-full h-full" />
  </IconWrapper>
);

export const Phone = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <PhoneIcon className="w-full h-full" />
  </IconWrapper>
);

export const Email = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <EnvelopeIcon className="w-full h-full" />
  </IconWrapper>
);

export const Notification = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <BellIcon className="w-full h-full" />
  </IconWrapper>
);

export const Settings = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <Cog6ToothIcon className="w-full h-full" />
  </IconWrapper>
);

export const Home = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <HomeIcon className="w-full h-full" />
  </IconWrapper>
);

export const Search = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <MagnifyingGlassIcon className="w-full h-full" />
  </IconWrapper>
);

export const Plus = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <PlusIcon className="w-full h-full" />
  </IconWrapper>
);

export const Minus = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <MinusIcon className="w-full h-full" />
  </IconWrapper>
);

export const Check = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <CheckIcon className="w-full h-full" />
  </IconWrapper>
);

export const Warning = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <ExclamationTriangleIcon className="w-full h-full" />
  </IconWrapper>
);

export const Info = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <InformationCircleIcon className="w-full h-full" />
  </IconWrapper>
);

export const Error = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <XCircleIcon className="w-full h-full" />
  </IconWrapper>
);

// Outline icons
export const HeartOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <HeartOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const XOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <XOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const StarOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <StarOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const SparklesOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <SparklesOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const RefreshOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <RefreshOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const UserOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <UserOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const ChatOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <ChatOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const LocationOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <LocationOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const CameraOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <CameraOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const PhotoOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <PhotoOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const VideoOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <VideoOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const PhoneOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <PhoneOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const EmailOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <EmailOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const NotificationOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <NotificationOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const SettingsOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <SettingsOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const HomeOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <HomeOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const SearchOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <SearchOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const PlusOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <PlusOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const MinusOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <MinusOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const CheckOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <CheckOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const WarningOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <WarningOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const InfoOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <InfoOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

export const ErrorOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <ErrorOutlineIcon className="w-full h-full" />
  </IconWrapper>
);

// Icon collections for easy importing
export const Icons = {
  // Solid icons
  solid: {
    Heart,
    X,
    Star,
    Sparkles,
    Refresh,
    User,
    Chat,
    Location,
    Camera,
    Photo,
    Video,
    Phone,
    Email,
    Notification,
    Settings,
    Home,
    Search,
    Plus,
    Minus,
    Check,
    Warning,
    Info,
    Error,
  },
  
  // Outline icons
  outline: {
    Heart: HeartOutline,
    X: XOutline,
    Star: StarOutline,
    Sparkles: SparklesOutline,
    Refresh: RefreshOutline,
    User: UserOutline,
    Chat: ChatOutline,
    Location: LocationOutline,
    Camera: CameraOutline,
    Photo: PhotoOutline,
    Video: VideoOutline,
    Phone: PhoneOutline,
    Email: EmailOutline,
    Notification: NotificationOutline,
    Settings: SettingsOutline,
    Home: HomeOutline,
    Search: SearchOutline,
    Plus: PlusOutline,
    Minus: MinusOutline,
    Check: CheckOutline,
    Warning: WarningOutline,
    Info: InfoOutline,
    Error: ErrorOutline,
  },
};

// Utility functions
export const getIconSize = (size: IconSize) => ICON_SIZES[size];
export const getIconColor = (color: IconColor) => ICON_COLORS[color];

export default Icons;
