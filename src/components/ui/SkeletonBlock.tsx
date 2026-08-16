import React from 'react';

export interface SkeletonBlockProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className = '',
  width,
  height,
  rounded = 'rounded-btn',
}) => {
  return (
    <div
      className={`animate-pulse bg-border/60 ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
};
