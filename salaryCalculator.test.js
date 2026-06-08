import test from "node:test";
import assert from "node:assert/strict";
import { calculateSalaryBills } from "./salaryCalculator.js";

test("converts salary using the largest denominations first", () => {
  assert.deepEqual(calculateSalaryBills(280000), {
    salary: 280000,
    bills: [
      { denomination: 100000, count: 2, subtotal: 200000 },
      { denomination: 50000, count: 1, subtotal: 50000 },
      { denomination: 20000, count: 1, subtotal: 20000 },
      { denomination: 10000, count: 1, subtotal: 10000 },
    ],
    total: 280000,
    remaining: 0,
  });
});

test("uses only needed denominations", () => {
  assert.deepEqual(calculateSalaryBills(40000).bills, [
    { denomination: 100000, count: 0, subtotal: 0 },
    { denomination: 50000, count: 0, subtotal: 0 },
    { denomination: 20000, count: 2, subtotal: 40000 },
    { denomination: 10000, count: 0, subtotal: 0 },
  ]);
});

test("uses the selected preferred denomination first", () => {
  assert.deepEqual(calculateSalaryBills(280000, { preferredDenomination: 50000 }), {
    salary: 280000,
    bills: [
      { denomination: 50000, count: 5, subtotal: 250000 },
      { denomination: 100000, count: 0, subtotal: 0 },
      { denomination: 20000, count: 1, subtotal: 20000 },
      { denomination: 10000, count: 1, subtotal: 10000 },
    ],
    total: 280000,
    remaining: 0,
    preferredDenomination: 50000,
  });
});

test("rejects salaries below the minimum unit", () => {
  assert.throws(() => calculateSalaryBills(5000), /10000 元/);
});

test("rejects non-positive salary values", () => {
  assert.throws(() => calculateSalaryBills(0), /大於 0/);
  assert.throws(() => calculateSalaryBills(-10000), /大於 0/);
});
