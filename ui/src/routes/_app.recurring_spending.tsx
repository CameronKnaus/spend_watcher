import { createFileRoute } from '@tanstack/react-router';
import RecurringSpending from 'Pages/RecurringSpending/RecurringSpending';

export const Route = createFileRoute('/_app/recurring_spending')({
  component: RecurringSpending,
});
