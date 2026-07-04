import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import createContentGetter from 'Content/createContentGetter';
import { useMemo } from 'react';
import { SpendingCategory } from '@spend-watcher/contract';
import styles from './useSpendCategoryList.module.css';

export default function useSpendCategoryList() {
  const getContent = createContentGetter('SPENDING_CATEGORIES');

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
