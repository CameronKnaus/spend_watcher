import {
    CategoryDetails,
    SpendCategoryOverview,
    SummaryTotals,
    TotalsByCategory,
    TransactionTotalWithPercentage,
} from '@routes/spending/spending.model';
import { SpendingCategory } from '@type/categoryTypes';
import initTransactionTotalWithPercentage from '@utils/CalculationHelpers/initTransactionTotalWithPercentage';
import roundNumber from '@utils/CalculationHelpers/roundNumber';

// Returns a list of category details sorted by discretionary amount spent, highest to lowest
export default function generateCategoryOverview(
    totalsByCategory: TotalsByCategory,
    summary: SummaryTotals,
): SpendCategoryOverview {
    // Total amount spent in all categories
    const totalAmount = summary.total.amount;
    // Total number of transactions in all categories
    const totalCount = summary.total.count;
    // Total amount spent in discretionary categories
    const discretionaryTotal = summary.discretionaryTotals.amount;
    // Total number of transactions in discretionary categories
    const discretionaryTotalCount = summary.discretionaryTotals.count;
    // Total amount spent in recurring categories
    const recurringTotal = summary.recurringTotals.amount;
    // Total number of transactions in recurring categories
    const recurringTotalCount = summary.recurringTotals.count;
    // Total number of categories with transactions
    let categoriesWithTransactionsCount = 0;
    // Total number of categories with discretionary transactions
    let categoriesWithDiscretionaryTransactionsCount = 0;
    // Total number of categories with recurring transactions
    let categoriesWithRecurringTransactionsCount = 0;

    const categoryDetailsList: CategoryDetails[] = Object.entries(totalsByCategory).map(
        ([category, categoryTotals]) => {
            if (categoryTotals.total.count > 0) {
                categoriesWithTransactionsCount++;
            }

            if (categoryTotals.discretionaryTotals.count > 0) {
                categoriesWithDiscretionaryTransactionsCount++;
            }

            if (categoryTotals.recurringTotals.count > 0) {
                categoriesWithRecurringTransactionsCount++;
            }

            return {
                category: category as SpendingCategory,
                combinedTotals: {
                    amount: categoryTotals.total.amount,
                    count: categoryTotals.total.count,
                    percentageOfTotalAmount: roundNumber((categoryTotals.total.amount / totalAmount) * 100),
                    percentageOfTotalCount: roundNumber((categoryTotals.total.count / totalCount) * 100),
                },
                discretionaryTotals: {
                    amount: categoryTotals.discretionaryTotals.amount,
                    count: categoryTotals.discretionaryTotals.count,
                    percentageOfTotalAmount: roundNumber(
                        (categoryTotals.discretionaryTotals.amount / discretionaryTotal) * 100,
                    ),
                    percentageOfTotalCount: roundNumber(
                        (categoryTotals.discretionaryTotals.count / discretionaryTotalCount) * 100,
                    ),
                },
                recurringTotals: {
                    amount: categoryTotals.recurringTotals.amount,
                    count: categoryTotals.recurringTotals.count,
                    percentageOfTotalAmount: roundNumber(
                        (categoryTotals.recurringTotals.amount / recurringTotal) * 100,
                    ),
                    percentageOfTotalCount: roundNumber(
                        (categoryTotals.recurringTotals.count / recurringTotalCount) * 100,
                    ),
                },
            };
        },
    );
    // TODO: This should be improved so it doesn't sort 3 times. with the Array.prototype.map(), O(4n) could be at least O(2n)

    // Sort by total recurring amount spent in each category, highest to lowest, then take the top 4
    const topFourRecurringTotals: TransactionTotalWithPercentage = categoryDetailsList
        .sort((a, b) => b.recurringTotals.amount - a.recurringTotals.amount)
        .slice(0, 4)
        .reduce(
            (acc, category) => ({
                amount: roundNumber(acc.amount + category.recurringTotals.amount),
                count: roundNumber(acc.count + category.recurringTotals.count),
                percentageOfTotalAmount: roundNumber(
                    acc.percentageOfTotalAmount + category.recurringTotals.percentageOfTotalAmount,
                ),
                percentageOfTotalCount: roundNumber(
                    acc.percentageOfTotalCount + category.recurringTotals.percentageOfTotalCount,
                ),
            }),
            initTransactionTotalWithPercentage(),
        );

    // Sort by total discretionary recurring amount spent in each category, highest to lowest, then take the top 4
    const topFourDiscretionaryTotals: TransactionTotalWithPercentage = categoryDetailsList
        .sort((a, b) => b.discretionaryTotals.amount - a.discretionaryTotals.amount)
        .slice(0, 4)
        .reduce(
            (acc, category) => ({
                amount: roundNumber(acc.amount + category.discretionaryTotals.amount),
                count: roundNumber(acc.count + category.discretionaryTotals.count),
                percentageOfTotalAmount: roundNumber(
                    acc.percentageOfTotalAmount + category.discretionaryTotals.percentageOfTotalAmount,
                ),
                percentageOfTotalCount: roundNumber(
                    acc.percentageOfTotalCount + category.discretionaryTotals.percentageOfTotalCount,
                ),
            }),
            initTransactionTotalWithPercentage(),
        );

    // Sort by total combined amount spent in each category, highest to lowest, then take the top 4
    const topFourTotals: TransactionTotalWithPercentage = categoryDetailsList
        .sort((a, b) => b.combinedTotals.amount - a.combinedTotals.amount)
        .slice(0, 4)
        .reduce(
            (acc, category) => ({
                amount: roundNumber(acc.amount + category.combinedTotals.amount),
                count: roundNumber(acc.count + category.combinedTotals.count),
                percentageOfTotalAmount: roundNumber(
                    acc.percentageOfTotalAmount + category.combinedTotals.percentageOfTotalAmount,
                ),
                percentageOfTotalCount: roundNumber(
                    acc.percentageOfTotalCount + category.combinedTotals.percentageOfTotalCount,
                ),
            }),
            initTransactionTotalWithPercentage(),
        );

    return {
        categoryDetailsList,
        categoriesWithTransactionsCount,
        categoriesWithDiscretionaryTransactionsCount,
        categoriesWithRecurringTransactionsCount,
        topFourCombinedTotals: topFourTotals,
        remainingCombinedTotals: {
            amount: roundNumber(totalAmount - topFourTotals.amount),
            count: roundNumber(totalCount - topFourTotals.count),
            percentageOfTotalAmount: roundNumber(100 - topFourTotals.percentageOfTotalAmount),
            percentageOfTotalCount: roundNumber(100 - topFourTotals.percentageOfTotalCount),
        },
        topFourDiscretionaryTotals,
        remainingDiscretionaryTotals: {
            amount: roundNumber(discretionaryTotal - topFourDiscretionaryTotals.amount),
            count: roundNumber(discretionaryTotalCount - topFourDiscretionaryTotals.count),
            percentageOfTotalAmount: roundNumber(100 - topFourDiscretionaryTotals.percentageOfTotalAmount),
            percentageOfTotalCount: roundNumber(100 - topFourDiscretionaryTotals.percentageOfTotalCount),
        },
        topFourRecurringTotals,
        remainingRecurringTotals: {
            amount: roundNumber(recurringTotal - topFourRecurringTotals.amount),
            count: roundNumber(recurringTotalCount - topFourRecurringTotals.count),
            percentageOfTotalAmount: roundNumber(100 - topFourRecurringTotals.percentageOfTotalAmount),
            percentageOfTotalCount: roundNumber(100 - topFourRecurringTotals.percentageOfTotalCount),
        },
    };
}
