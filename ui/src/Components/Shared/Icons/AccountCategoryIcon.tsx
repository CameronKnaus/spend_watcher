import { clsx } from 'clsx';
import { ComponentProps } from 'react';
import { AccountCategory } from 'Types/accountTypes';
import accountCategoryIconMapper from './accountCategoryIconMapper';
import styles from './CategoryIcon.module.css';

type AccountCategoryIconPropTypes = {
  category: AccountCategory;
  size?: number;
  isInactive?: boolean;
} & ComponentProps<'div'>;

// Should probably combine this with SpendingCategoryIcon.tsx
export default function AccountCategoryIcon({
  category,
  size = 32,
  isInactive,
  className,
  style,
}: AccountCategoryIconPropTypes) {
  const containerStyle = {
    height: size,
    width: size,
    backgroundColor: `var(--theme-color-account-category-${category})`,
    fontSize: size * 0.65,
    ...(style ?? {}),
  };

  return (
    <div className={clsx(styles.icon, isInactive && styles.inactive, className)} style={containerStyle}>
      {accountCategoryIconMapper[category]}
    </div>
  );
}
