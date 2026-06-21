import AccountCategoryIcon from 'Components/Shared/Icons/AccountCategoryIcon';
import useContent from 'Hooks/useContent/useContent';
import { useMemo } from 'react';
import { AccountCategory } from '@spend-watcher/contract';
import styles from './useAccountCategoryList.module.css';

export default function useAccountCategoryList() {
  const getContent = useContent('ACCOUNT_CATEGORIES');

  return useMemo(() => {
    return Object.values(AccountCategory).map((category) => ({
      value: category,
      optionName: getContent(category),
      customRender: (optionName: string, value: AccountCategory) => (
        <div className={styles.accountCategoryOption}>
          <AccountCategoryIcon category={value} size={32} />
          <div>{optionName}</div>
        </div>
      ),
    }));
  }, [getContent]);
}
