/**
 * Utility functions for Indian Rupee currency and address formatting
 */

export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  // Standard Indian numbering format (e.g. ₹1,25,000 or ₹1,450)
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatINRPadded(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
