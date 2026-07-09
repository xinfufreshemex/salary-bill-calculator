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

function validateSalary(salary) {
  const amount = Number(salary);

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("薪水必須是大於 0 的整數");
  }

  if (amount % 10000 !== 0) {
    throw new Error("薪水必須以 10000 元為單位");
  }

  return amount;
}

function getManualCount(manualCounts, denomination) {
  const count = Number(manualCounts?.[denomination] ?? 0);

  if (!Number.isInteger(count) || count < 0) {
    throw new Error("手動張數必須是 0 以上的整數");
  }

  return count;
}

function calculateWithManualCounts(salary, options) {
  const denominations = options.denominations ?? DEFAULT_DENOMINATIONS;
  const amount = validateSalary(salary);
  const manualCounts = options.manualCounts ?? {};
  const billsByDenomination = new Map();

  let manualTotal = 0;

  denominations.forEach((denomination) => {
    const manualCount = getManualCount(manualCounts, denomination);
    manualTotal += manualCount * denomination;
    billsByDenomination.set(denomination, {
      denomination,
      manualCount,
      autoCount: 0,
      count: manualCount,
      subtotal: manualCount * denomination,
      autoEnabled: manualCount === 0,
    });
  });

  if (manualTotal > amount) {
    throw new Error("手動指定金額不能超過薪水總額");
  }

  let remaining = amount - manualTotal;
  const autoEligibleDenominations = denominations.filter((denomination) => {
    return billsByDenomination.get(denomination).autoEnabled;
  });
  const autoPreferredDenomination = autoEligibleDenominations.includes(
    options.preferredDenomination,
  )
    ? options.preferredDenomination
    : undefined;
  const autoDenominations = getOrderedDenominations(
    autoPreferredDenomination,
    autoEligibleDenominations,
  );

  autoDenominations.forEach((denomination) => {
    const bill = billsByDenomination.get(denomination);
    const autoCount = Math.floor(remaining / denomination);
    remaining -= autoCount * denomination;

    bill.autoCount = autoCount;
    bill.count += autoCount;
    bill.subtotal += autoCount * denomination;
  });

  return {
    salary: amount,
    bills: denominations.map((denomination) => billsByDenomination.get(denomination)),
    manualTotal,
    autoTotal: amount - manualTotal - remaining,
    total: amount - remaining,
    remaining,
    preferredDenomination: options.preferredDenomination,
  };
}

export function calculateSalaryBills(salary, options = {}) {
  if (!Array.isArray(options) && options.manualCounts) {
    return calculateWithManualCounts(salary, options);
  }

  const denominations = Array.isArray(options)
    ? options
    : getOrderedDenominations(options.preferredDenomination);
  const amount = validateSalary(salary);

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
