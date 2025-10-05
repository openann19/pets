import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  ScrollViewProps,
  Haptics,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, AnimationConfigs } from '../styles/GlobalStyles';
import { useTheme } from '../contexts/ThemeContext';

// === ELITE CONTAINER COMPONENTS ===

interface EliteContainerProps {
  children: ReactNode;
  gradient?: string;
  style?: ViewStyle;
}

export const EliteContainer: React.FC<EliteContainerProps> = ({ 
  children, 
  gradient = 'gradientPrimary',
  style 
}) => {
  const { colors, styles } = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors[gradient as keyof typeof colors] as string[] || colors.gradientPrimary}
        style={styles.backgroundGradient}
      />
      <SafeAreaView style={styles.safeArea}>
        {children}
      </SafeAreaView>
    </View>
  );
};

interface EliteScrollContainerProps extends ScrollViewProps {
  children: ReactNode;
  gradient?: keyof typeof Colors;
}

export const EliteScrollContainer: React.FC<EliteScrollContainerProps> = ({ 
  children, 
  gradient = 'gradientPrimary',
  ...props 
}) => {
  return (
    <EliteContainer gradient={gradient}>
      <ScrollView 
        contentContainerStyle={GlobalStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        {...props}
      >
        {children}
      </ScrollView>
    </EliteContainer>
  );
};

// === ELITE HEADER COMPONENTS ===

interface EliteHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  onBack?: () => void;
  rightComponent?: ReactNode;
  blur?: boolean;
}

export const EliteHeader: React.FC<EliteHeaderProps> = ({
  title,
  subtitle,
  showLogo = false,
  onBack,
  rightComponent,
  blur = true,
}) => {
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const HeaderContent = (
    <View style={GlobalStyles.headerContent}>
      {onBack && (
        <TouchableOpacity
          onPress={() => {
            runOnJS(triggerHaptic)();
            onBack();
          }}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
      )}
      
      <View style={styles.headerTitleContainer}>
        <Text style={GlobalStyles.heading2}>{title}</Text>
        {subtitle && (
          <Text style={GlobalStyles.bodySmall}>{subtitle}</Text>
        )}
      </View>

      <View style={styles.headerRight}>
        {rightComponent}
      </View>
    </View>
  );

  if (blur) {
    return (
      <View style={GlobalStyles.headerBlur}>
        <BlurView intensity={95} style={{ flex: 1 }}>
          {HeaderContent}
        </BlurView>
      </View>
    );
  }

  return <View style={styles.headerContainer}>{HeaderContent}</View>;
};

interface ElitePageHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const ElitePageHeader: React.FC<ElitePageHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
}) => {
  return (
    <Animated.View style={GlobalStyles.header}>
      {showLogo && (
        <BlurView intensity={20} style={GlobalStyles.logoContainer}>
          <Text style={GlobalStyles.logo}>🐾 PawfectMatch</Text>
        </BlurView>
      )}
      <Text style={GlobalStyles.title}>{title}</Text>
      {subtitle && (
        <Text style={GlobalStyles.subtitle}>{subtitle}</Text>
      )}
    </Animated.View>
  );
};

// === ELITE CARD COMPONENTS ===

interface EliteCardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  gradient?: boolean;
  blur?: boolean;
  shadow?: keyof typeof Shadows;
}

export const EliteCard: React.FC<EliteCardProps> = ({
  children,
  style,
  onPress,
  gradient = false,
  blur = false,
  shadow = 'lg',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, AnimationConfigs.spring);
    if (onPress) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfigs.spring);
  };

  const CardContent = (
    <View style={[GlobalStyles.cardContent, style]}>
      {children}
    </View>
  );

  const cardStyle = [
    gradient ? GlobalStyles.cardGlass : GlobalStyles.card,
    Shadows[shadow],
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={cardStyle}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          {gradient ? (
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              style={{ borderRadius: BorderRadius['2xl'] }}
            >
              {blur ? (
                <BlurView intensity={15} style={{ borderRadius: BorderRadius['2xl'] }}>
                  {CardContent}
                </BlurView>
              ) : (
                CardContent
              )}
            </LinearGradient>
          ) : (
            CardContent
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyle}>
      {gradient ? (
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={{ borderRadius: BorderRadius['2xl'] }}
        >
          {blur ? (
            <BlurView intensity={15} style={{ borderRadius: BorderRadius['2xl'] }}>
              {CardContent}
            </BlurView>
          ) : (
            CardContent
          )}
        </LinearGradient>
      ) : (
        CardContent
      )}
    </View>
  );
};

// === ELITE BUTTON COMPONENTS ===

interface EliteButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  gradient?: string[];
}

export const EliteButton: React.FC<EliteButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  gradient,
  style,
  onPress,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, AnimationConfigs.spring);
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfigs.spring);
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return GlobalStyles.buttonSecondary;
      case 'ghost':
        return GlobalStyles.buttonGhost;
      default:
        return GlobalStyles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return GlobalStyles.buttonTextSecondary;
      case 'ghost':
        return GlobalStyles.buttonTextSecondary;
      default:
        return GlobalStyles.buttonTextPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm };
      case 'large':
        return { paddingHorizontal: Spacing['4xl'], paddingVertical: Spacing.xl };
      default:
        return GlobalStyles.buttonContent;
    }
  };

  const buttonGradient = gradient || (variant === 'primary' ? [Colors.primary, Colors.primaryLight] : undefined);

  const ButtonContent = (
    <View style={[getSizeStyle(), { opacity: disabled ? 0.6 : 1 }]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} />
      ) : (
        <>
          {icon && (
            <Ionicons 
              name={icon} 
              size={20} 
              color={variant === 'primary' ? Colors.white : Colors.primary} 
            />
          )}
          <Text style={[GlobalStyles.buttonText, getTextStyle()]}>
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        {...props}
      >
        {buttonGradient && variant === 'primary' ? (
          <LinearGradient colors={buttonGradient} style={{ borderRadius: BorderRadius['2xl'] }}>
            {ButtonContent}
          </LinearGradient>
        ) : (
          ButtonContent
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// === ELITE LOADING COMPONENTS ===

interface EliteLoadingProps {
  title?: string;
  subtitle?: string;
}

export const EliteLoading: React.FC<EliteLoadingProps> = ({
  title = "Loading...",
  subtitle,
}) => {
  return (
    <View style={GlobalStyles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={GlobalStyles.loadingText}>{title}</Text>
      {subtitle && (
        <Text style={[GlobalStyles.bodySmall, GlobalStyles.textCenter, GlobalStyles.mt2]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

// === ELITE EMPTY STATE COMPONENTS ===

interface EliteEmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EliteEmptyState: React.FC<EliteEmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionTitle,
  onAction,
}) => {
  return (
    <View style={GlobalStyles.emptyContainer}>
      <Ionicons name={icon} size={80} color={Colors.gray300} />
      <Text style={GlobalStyles.emptyTitle}>{title}</Text>
      <Text style={GlobalStyles.emptySubtitle}>{subtitle}</Text>
      {actionTitle && onAction && (
        <EliteButton
          title={actionTitle}
          onPress={onAction}
          variant="primary"
        />
      )}
    </View>
  );
};

// === ELITE AVATAR COMPONENT ===

interface EliteAvatarProps {
  source: { uri: string };
  size?: 'small' | 'medium' | 'large';
  online?: boolean;
  style?: ViewStyle;
}

export const EliteAvatar: React.FC<EliteAvatarProps> = ({
  source,
  size = 'medium',
  online = false,
  style,
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return GlobalStyles.avatarSmall;
      case 'large':
        return GlobalStyles.avatarLarge;
      default:
        return GlobalStyles.avatarMedium;
    }
  };

  return (
    <View style={[{ position: 'relative' }, style]}>
      <Animated.Image
        source={source}
        style={[GlobalStyles.avatar, getSizeStyle()]}
      />
      {online && (
        <View style={styles.onlineIndicator} />
      )}
    </View>
  );
};

// === STYLES ===
const styles = {
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glassWhite,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center' as const,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end' as const,
  },
  onlineIndicator: {
    position: 'absolute' as const,
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
};

export default {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  ElitePageHeader,
  EliteCard,
  EliteButton,
  EliteLoading,
  EliteEmptyState,
  EliteAvatar,
};
