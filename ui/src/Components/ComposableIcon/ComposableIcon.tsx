import { clsx } from 'clsx';
import { ComponentProps, ReactNode } from 'react';
import styles from './ComposableIcon.module.css';

type SpendingCategoryIconPropTypes = {
  icon: ReactNode;
  size: number;
  className?: string;
  backgroundColor: string;
} & Omit<ComponentProps<'div'>, 'style'>;

export default function ComposableIcon({
  icon,
  size = 32,
  className,
  backgroundColor,
  ...props
}: SpendingCategoryIconPropTypes) {
  const containerStyle = {
    height: size,
    width: size,
    backgroundColor,
    fontSize: size * 0.6, // Size of the icon inside is based on font-size
  };

  return (
    <div {...props} style={containerStyle} className={clsx(styles.icon, className)}>
      {icon}
    </div>
  );
}
