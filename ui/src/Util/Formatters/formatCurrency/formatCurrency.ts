// This will need to be moved if other currencies are supported in the future

export default function formatCurrency(amount: number | string, showSignWhenPositive = false, compact = false) {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
    signDisplay: showSignWhenPositive ? 'exceptZero' : 'auto',
    ...(compact ? { notation: 'compact' as const } : {}),
  });

  const amountToFormat = typeof amount === 'string' ? Number(amount) : amount;

  return currencyFormatter.format(amountToFormat);
}
