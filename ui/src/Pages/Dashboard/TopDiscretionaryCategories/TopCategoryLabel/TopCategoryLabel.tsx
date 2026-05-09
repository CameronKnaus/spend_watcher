import Currency from 'Components/Currency/Currency';
import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import { CSSProperties } from 'react';
import { SpendingCategory } from 'Types/SpendingCategory';
import styles from './TopCategoryLabel.module.css';

type TopCategoryLabelPropTypes = {
  label: string;
  isVerticalList: boolean;
  category: SpendingCategory;
  amount: number;
  percentage: number;
  customIconStyles?: CSSProperties;
  onClick?: () => void;
};

export default function TopCategoryLabel({
  label,
  isVerticalList,
  category,
  amount,
  percentage,
  customIconStyles,
  onClick,
}: TopCategoryLabelPropTypes) {
  const iconSize = 20;
  const containerStyle = {
    flexBasis: isVerticalList ? '100%' : 'calc(50% - (var(--category-list-item-gap)) / 2)',
  };

  return (
    <button className={styles.categoryListItem} style={containerStyle} onClick={onClick}>
      <SpendingCategoryIcon
        category={category}
        size={iconSize}
        className={styles.categoryIcon}
        style={customIconStyles}
      />
      <span>{label}</span>
      <div className={styles.amountContainer}>
        <Currency amount={amount} isGainLoss />
        <span className={styles.percentageValue}>{`(${percentage}%)`}</span>
      </div>
    </button>
  );
}
