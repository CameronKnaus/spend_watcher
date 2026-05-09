import SkeletonLoader from 'Components/Shared/SkeletonLoader';
import styles from './TopCategoryLabel.module.css';

type TopCategoryLabelPropTypes = {
  isVerticalList?: boolean;
};

export default function TopCategoryLabelLoader({ isVerticalList }: TopCategoryLabelPropTypes) {
  const iconSize = 20;
  const containerStyle = {
    flexBasis: isVerticalList ? '100%' : 'calc(50% - (var(--category-list-item-gap)) / 2)',
  };

  return (
    <div className={styles.categoryListItem} style={containerStyle}>
      <SkeletonLoader
        className={styles.categoryIcon}
        style={{ minHeight: iconSize, minWidth: iconSize, width: iconSize, height: iconSize }}
      />
      <SkeletonLoader style={{ maxWidth: 100 }} />
      <SkeletonLoader style={{ maxWidth: 70, marginLeft: 'auto' }} />
    </div>
  );
}
