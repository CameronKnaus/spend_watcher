import { clsx } from 'clsx';
import { spendCategoryIconMapper } from 'Components/Shared/Icons/spendCategoryIconMapper';
import { ComponentProps, useState } from 'react';
import { MdRefresh } from 'react-icons/md';
import { SpendingCategory } from '@spend-watcher/contract';
import styles from './CategoryIcon.module.css';

type SpendingCategoryIconPropTypes = {
  category: SpendingCategory;
  size: number;
  isInactive?: boolean;
  showRevolvingIcon?: boolean;
} & ComponentProps<'div'>;

export default function SpendingCategoryIcon({
  category,
  size = 32,
  className,
  isInactive,
  showRevolvingIcon = false,
  style,
}: SpendingCategoryIconPropTypes) {
  // Randomized once per mount so the stagger doesn't jump on re-renders and render stays pure.
  const [revolveDelay] = useState(() => (Math.random() * 8).toFixed(2));
  const containerStyle = {
    height: size,
    width: size,
    backgroundColor: `var(--theme-color-spend-category-${category})`,
    fontSize: size * 0.65, // Size of the icon inside is based on font-size
    ...(style ?? {}),
  };

  return (
    <div style={containerStyle} className={clsx(styles.icon, isInactive && styles.inactive, className)}>
      {showRevolvingIcon ? (
        <>
          {spendCategoryIconMapper[category]}
          <div className={styles.revolvingIcon} style={{ animationDelay: `${revolveDelay}s` }}>
            <MdRefresh />
          </div>
        </>
      ) : (
        spendCategoryIconMapper[category]
      )}
    </div>
  );
}
