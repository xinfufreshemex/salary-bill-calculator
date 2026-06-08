export const DEFAULT_DENOMINATIONS = [100000, 50000, 20000, 10000];

export function getOrderedDenominations(
  preferredDenomination,
  denominations = DEFAULT_DENOMINATIONS,
) {
  if (!preferredDenomination) {
    return [...denominations];
  }

  if (!denominations.includes(preferredDenomination)) {
    throw new Error("優先面額不在支援清單中");
  }

  return [
    preferredDenomination,
    ...denominations.filter((denomination) => denomination !== preferredDenomination),
  ];
}

export function calculateSalaryBills(salary, options = {}) {
  const denominations = Array.isArray(options)
    ? options
    : getOrderedDenominations(options.preferredDenomination);
  const amount = Number(salary);

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("薪水必須是大於 0 的整數");
  }

  if (amount % 10000 !== 0) {
    throw new Error("薪水必須以 10000 元為單位");
  }

  let remaining = amount;
  const bills = denominations.map((denomination) => {
    const count = Math.floor(remaining / denomination);
    remaining -= count * denomination;

    return {
      denomination,
      count,
      subtotal: denomination * count,
    };
  });

  const result = {
    salary: amount,
    bills,
    total: amount - remaining,
    remaining,
  };

  if (!Array.isArray(options) && options.preferredDenomination) {
    result.preferredDenomination = options.preferredDenomination;
  }

  return result;
}
