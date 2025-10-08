/**
 * 🎨 ICON SYSTEM
 * React components for Heroicons subset with consistent styling
 */

import {
  HeartIcon as HeartOutline,
  XMarkIcon as XOutline,
  StarIcon as StarOutline,
  SparklesIcon as SparklesOutline,
  ArrowPathIcon as ArrowPathOutline,
  UserIcon as UserOutline,
  ChatBubbleLeftRightIcon as ChatOutline,
  MapPinIcon as MapPinOutline,
  CameraIcon as CameraOutline,
  PhotoIcon as PhotoOutline,
  VideoCameraIcon as VideoOutline,
  PhoneIcon as PhoneOutline,
  EnvelopeIcon as EnvelopeOutline,
  BellIcon as BellOutline,
  Cog6ToothIcon as CogOutline,
  HomeIcon as HomeOutline,
  MagnifyingGlassIcon as SearchOutline,
  PlusIcon as PlusOutline,
  MinusIcon as MinusOutline,
  CheckIcon as CheckOutline,
  ExclamationTriangleIcon as WarningOutline,
  InformationCircleIcon as InfoOutline,
  XCircleIcon as ErrorOutline,
} from '@heroicons/react/24/outline';
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
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  LanguageIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  BookmarkIcon,
  ShareIcon,
  DownloadIcon,
  UploadIcon,
  DocumentIcon,
  FolderIcon,
  TrashIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ClipboardIcon,
  PrinterIcon,
  ArchiveBoxIcon,
  CubeIcon,
  GiftIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  LightBulbIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  BeakerIcon,
  WrenchIcon,
  PaintBrushIcon,
  ScissorsIcon,
  CursorArrowRaysIcon,
  HandRaisedIcon,
  FingerPrintIcon,
  QrCodeIcon,
  CreditCardIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  BookOpenIcon,
  GraduationCapIcon,
  PresentationChartLineIcon,
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartBarIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  MagnifyingGlassCircleIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  FunnelIcon as FunnelOutlineIcon,
  AdjustmentsHorizontalIcon as AdjustmentsOutlineIcon,
  Cog6ToothIcon as CogOutlineIcon,
  UserIcon as UserOutlineIcon,
  HeartIcon as HeartOutlineIcon,
  StarIcon as StarOutlineIcon,
  BookmarkIcon as BookmarkOutlineIcon,
  ShareIcon as ShareOutlineIcon,
  ChatBubbleLeftRightIcon as ChatOutlineIcon,
  BellIcon as BellOutlineIcon,
  HomeIcon as HomeOutlineIcon,
  MagnifyingGlassIcon as SearchOutlineIcon,
  PlusIcon as PlusOutlineIcon,
  MinusIcon as MinusOutlineIcon,
  CheckIcon as CheckOutlineIcon,
  XMarkIcon as XOutlineIcon,
  ExclamationTriangleIcon as WarningOutlineIcon,
  InformationCircleIcon as InfoOutlineIcon,
  XCircleIcon as ErrorOutlineIcon,
} from '@heroicons/react/24/solid';
import React from 'react';


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
    <HeartOutline className="w-full h-full" />
  </IconWrapper>
);

export const XOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <XOutline className="w-full h-full" />
  </IconWrapper>
);

export const StarOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <StarOutline className="w-full h-full" />
  </IconWrapper>
);

export const SparklesOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <SparklesOutline className="w-full h-full" />
  </IconWrapper>
);

export const RefreshOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <ArrowPathOutline className="w-full h-full" />
  </IconWrapper>
);

export const UserOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <UserOutline className="w-full h-full" />
  </IconWrapper>
);

export const ChatOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <ChatOutline className="w-full h-full" />
  </IconWrapper>
);

export const LocationOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <MapPinOutline className="w-full h-full" />
  </IconWrapper>
);

export const CameraOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <CameraOutline className="w-full h-full" />
  </IconWrapper>
);

export const PhotoOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <PhotoOutline className="w-full h-full" />
  </IconWrapper>
);

export const VideoOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <VideoOutline className="w-full h-full" />
  </IconWrapper>
);

export const PhoneOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <PhoneOutline className="w-full h-full" />
  </IconWrapper>
);

export const EmailOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <EnvelopeOutline className="w-full h-full" />
  </IconWrapper>
);

export const NotificationOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <BellOutline className="w-full h-full" />
  </IconWrapper>
);

export const SettingsOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <CogOutline className="w-full h-full" />
  </IconWrapper>
);

export const HomeOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <HomeOutline className="w-full h-full" />
  </IconWrapper>
);

export const SearchOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <SearchOutline className="w-full h-full" />
  </IconWrapper>
);

export const PlusOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <PlusOutline className="w-full h-full" />
  </IconWrapper>
);

export const MinusOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <MinusOutline className="w-full h-full" />
  </IconWrapper>
);

export const CheckOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <CheckOutline className="w-full h-full" />
  </IconWrapper>
);

export const WarningOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <WarningOutline className="w-full h-full" />
  </IconWrapper>
);

export const InfoOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <InfoOutline className="w-full h-full" />
  </IconWrapper>
);

export const ErrorOutline = (props: BaseIconProps) => (
  <IconWrapper {...props}>
    <ErrorOutline className="w-full h-full" />
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
