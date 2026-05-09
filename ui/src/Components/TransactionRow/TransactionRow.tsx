import Currency from 'Components/Currency/Currency';
import InteractiveRow from 'Components/InteractiveRow/InteractiveRow';
import SpendingCategoryIcon from 'Components/Shared/Icons/SpendingCategoryIcon';
import useContent from 'Hooks/useContent';
import { ComponentProps } from 'react';
import { DiscretionaryTransactionId } from 'Types/Services/spending.model';
import { SpendingCategory } from 'Types/SpendingCategory';

type TransactionRowPropTypes = {
  transactionId: DiscretionaryTransactionId;
  category: SpendingCategory;
  amountSpent: number;
  note?: string;
  secondaryNote?: string;
  className?: string;
  onClick: (transactionId: DiscretionaryTransactionId) => void;
};

export default function TransactionRow({
  transactionId,
  category,
  amountSpent,
  note,
  secondaryNote,
  className,
  onClick,
  ...attributes
}: TransactionRowPropTypes & Omit<ComponentProps<'button'>, 'onClick' | 'className'>) {
  const getCategoryLabel = useContent('SPENDING_CATEGORIES');

  return (
    <InteractiveRow
      icon={<SpendingCategoryIcon category={category} size={36} />}
      primaryLabel={getCategoryLabel(category)}
      primaryDataPoint={<Currency amount={-amountSpent} isGainLoss />}
      secondaryDataPoint={note}
      secondaryLabel={secondaryNote}
      className={className}
      onClick={() => onClick(transactionId)}
      {...attributes}
    />
  );
}
