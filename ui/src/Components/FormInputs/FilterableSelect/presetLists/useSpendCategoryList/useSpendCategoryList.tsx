import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import useContent from 'Hooks/useContent';
import { useMemo } from 'react';
import { SpendingCategory } from 'Types/SpendingCategory';
import styles from './useSpendCategoryList.module.css';

export default function useSpendCategoryList() {
  const getContent = useContent('SPENDING_CATEGORIES');

  return useMemo(() => {
    const { RESTAURANTS, GROCERIES, DRINKS, OTHER, ...rest } = SpendingCategory;
    const newOrder = [RESTAURANTS, GROCERIES, DRINKS, ...Object.values(rest), OTHER];

    return newOrder.map((category) => ({
      value: category,
      optionName: getContent(category),
      customRender: (optionName: string, value: SpendingCategory) => (
        <div className={styles.spendCategoryOption}>
          <SpendingCategoryIcon category={value} size={32} />
          <div>{optionName}</div>
        </div>
      ),
    }));
  }, [getContent]);
}
