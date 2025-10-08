'use client';

import React from 'react';

import { THEME } from '@/theme/unified-design-system';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'body' | 'bodyLarge' | 'caption' | 'small';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  color?: keyof typeof THEME.colors.primary      ;
  weight?: keyof typeof THEME.typography.fontWeight;
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  variant = 'body',
  as,
  color = 'neutral',
  weight,
  children,
  className = '',
  ...props
}) => {
  const textStyle = THEME.typography.textStyles[variant];
  const Component = as || (variant.startsWith('heading') ? variant.replace('heading', 'h') as any : 'p');

  const getColorValue = () => {
    if (color === 'primary') return THEME.colors.primary[600];
    if (color === 'error') return THEME.colors.error[600];
    if (color === 'success') return THEME.colors.success[600];
    return THEME.colors.neutral[900];
  };

  return (
    <Component
      className={className}
      style={{
        fontSize: textStyle.fontSize,
        fontWeight: weight ? THEME.typography.fontWeight[weight] : textStyle.fontWeight,
        lineHeight: textStyle.lineHeight,
        color: getColorValue(),
        margin: 0,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Text;
