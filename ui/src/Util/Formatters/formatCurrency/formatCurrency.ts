// This will need to be moved if other currencies are supported in the future

export default function formatCurrency(amount: number | string, showSignWhenPositive = false) {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: showSignWhenPositive ? 'exceptZero' : 'auto',
  });

  const amountToFormat = typeof amount === 'string' ? Number(amount) : amount;

  return currencyFormatter.format(amountToFormat);
}
