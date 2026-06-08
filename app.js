import { calculateSalaryBills } from "./salaryCalculator.js";

const form = document.querySelector("#salary-form");
const salaryInput = document.querySelector("#salary-input");
const message = document.querySelector("#message");
const resultBody = document.querySelector("#result-body");
const totalCell = document.querySelector("#total-cell");
const summaryTotal = document.querySelector("#summary-total");
const priorityHint = document.querySelector("#priority-hint");
const denominationButtons = [...document.querySelectorAll(".denomination-button")];

let preferredDenomination = 100000;

const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0,
});

function formatCurrency(amount) {
  return currencyFormatter.format(amount).replace("NT$", "$");
}

function formatDenominationLabel(amount) {
  return `${amount / 10000}萬元`;
}

function renderEmpty(messageText) {
  resultBody.innerHTML = `
    <tr class="empty-row">
      <td colspan="3">${messageText}</td>
    </tr>
  `;
  totalCell.textContent = formatCurrency(0);
  summaryTotal.textContent = formatCurrency(0);
}

function renderResult(result) {
  resultBody.innerHTML = result.bills
    .map((bill) => {
      const isPriority = bill.denomination === preferredDenomination;

      return `
        <tr class="${isPriority ? "priority-row" : ""}">
          <td>
            <span class="denomination-cell">
              ${formatCurrency(bill.denomination)}
              ${isPriority ? '<span class="priority-badge">優先</span>' : ""}
            </span>
          </td>
          <td><span class="count-cell">${bill.count}</span> 張</td>
          <td>${formatCurrency(bill.subtotal)}</td>
        </tr>
      `;
    })
    .join("");

  totalCell.textContent = formatCurrency(result.total);
  summaryTotal.textContent = formatCurrency(result.total);
}

function updateSelectedDenomination(nextDenomination) {
  preferredDenomination = nextDenomination;

  denominationButtons.forEach((button) => {
    const isSelected = Number(button.dataset.denomination) === preferredDenomination;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  priorityHint.textContent = `目前優先發放：${formatDenominationLabel(
    preferredDenomination,
  )}。請輸入 10000 元的倍數。`;
}

denominationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateSelectedDenomination(Number(button.dataset.denomination));
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "";

  try {
    const result = calculateSalaryBills(salaryInput.value, {
      preferredDenomination,
    });
    renderResult(result);
  } catch (error) {
    message.textContent = error.message;
    renderEmpty("請修正薪水金額後重新換算");
  }
});
