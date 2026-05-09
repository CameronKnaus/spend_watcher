import clsx from 'clsx';
import Currency from 'Components/Currency/Currency';
import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import useContent from 'Hooks/useContent';
import { ComponentProps } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { RecurringSpendTransaction } from 'Types/Services/spending.model';
import formatCurrency from 'Util/Formatters/formatCurrency/formatCurrency';
import styles from './RecurringTransactionCard.module.css';

type RecurringTransactionCardPropTypes = {
  transaction: RecurringSpendTransaction;
  className?: string;
  isInactive?: boolean;
  onClick: (transaction: RecurringSpendTransaction) => void;
};

export default function RecurringTransactionCard({
  transaction,
  className,
  onClick,
  isInactive,
  ...attributes
}: RecurringTransactionCardPropTypes & Omit<ComponentProps<'button'>, 'className' | 'onClick'>) {
  const getCategoryLabel = useContent('SPENDING_CATEGORIES');
  const getContent = useContent('recurringSpending');

  return (
    <button className={clsx(styles.card, className)} {...attributes} onClick={() => onClick(transaction)}>
      <SpendingCategoryIcon isInactive={isInactive} category={transaction.category} size={42} />
      <div className={styles.transactionDetails}>
        <div className={styles.dataRow}>
          <span>{transaction.recurringSpendName}</span>
          <span className={styles.spendAmount}>
            {!isInactive && transaction.requiresMonthlyUpdate ? (
              <div className={styles.updateRequiredTag}>{getContent('updateRequired')}</div>
            ) : (
              <Currency amount={-transaction.amountSpent} isGainLoss={!isInactive} />
            )}
          </span>
        </div>
        <div className={styles.detailsRow}>
          <span>{getCategoryLabel(transaction.category)}</span>
          {!isInactive && (
            <span>
              {transaction.isVariableRecurring ? (
                getContent('estimatedLabel', [formatCurrency(-transaction.expectedMonthlyAmount)])
              ) : (
                <div className={styles.fixedTag}>{getContent('fixedLabel')}</div>
              )}
            </span>
          )}
        </div>
      </div>
      <FaChevronRight className={styles.chevron} />
    </button>
  );
}
