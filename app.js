import { calculateSalaryBills, DEFAULT_DENOMINATIONS } from "./salaryCalculator.js";

const form = document.querySelector("#salary-form");
const salaryInput = document.querySelector("#salary-input");
const message = document.querySelector("#message");
const resultBody = document.querySelector("#result-body");
const totalCell = document.querySelector("#total-cell");
const summaryTotal = document.querySelector("#summary-total");
const manualTotal = document.querySelector("#manual-total");
const autoTotal = document.querySelector("#auto-total");
const remainingCard = document.querySelector("#remaining-card");
const remainingTotal = document.querySelector("#remaining-total");
const priorityHint = document.querySelector("#priority-hint");
const denominationButtons = [...document.querySelectorAll(".denomination-button")];
const denominationCards = [...document.querySelectorAll("[data-denomination-card]")];
const manualCountInputs = [...document.querySelectorAll("[data-manual-count]")];

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

function getManualCounts() {
  return Object.fromEntries(
    manualCountInputs.map((input) => {
      return [input.dataset.manualCount, input.value.trim() === "" ? 0 : Number(input.value)];
    }),
  );
}

function renderEmpty(messageText) {
  resultBody.innerHTML = `
    <tr class="empty-row">
      <td colspan="3">${messageText}</td>
    </tr>
  `;
  totalCell.textContent = formatCurrency(0);
  summaryTotal.textContent = formatCurrency(0);
  manualTotal.textContent = formatCurrency(0);
  autoTotal.textContent = formatCurrency(0);
  remainingTotal.textContent = formatCurrency(0);
  remainingCard.hidden = true;
}

function renderResult(result) {
  resultBody.innerHTML = result.bills
    .map((bill) => {
      const isPriority = bill.denomination === preferredDenomination;
      const isAutoEnabled = bill.autoEnabled;

      return `
        <tr class="denom-row denom-${bill.denomination} ${
          isPriority && isAutoEnabled ? "priority-row" : ""
        }">
          <td>
            <span class="denomination-cell">
              ${formatCurrency(bill.denomination)}
              ${isPriority && isAutoEnabled ? '<span class="priority-badge">優先</span>' : ""}
              ${isAutoEnabled ? '<span class="auto-badge">自動</span>' : ""}
            </span>
          </td>
          <td><span class="count-cell">${bill.count}</span> 張</td>
          <td>${formatCurrency(bill.subtotal)}</td>
        </tr>
      `;
    })
    .join("");

  totalCell.textContent = formatCurrency(result.total);
  summaryTotal.textContent = formatCurrency(result.salary);
  manualTotal.textContent = formatCurrency(result.manualTotal ?? 0);
  autoTotal.textContent = formatCurrency(result.autoTotal ?? result.total);
  remainingTotal.textContent = formatCurrency(result.remaining);
  remainingCard.hidden = result.remaining === 0;
}

function updateSelectedDenomination(nextDenomination) {
  preferredDenomination = nextDenomination;

  denominationButtons.forEach((button) => {
    const isSelected = Number(button.dataset.denomination) === preferredDenomination;
    button.setAttribute("aria-pressed", String(isSelected));
  });

  denominationCards.forEach((card) => {
    const isSelected = Number(card.dataset.denominationCard) === preferredDenomination;
    card.classList.toggle("is-selected", isSelected);
  });

  priorityHint.textContent = `目前優先自動補足：${formatDenominationLabel(
    preferredDenomination,
  )}。未輸入張數的面額會自動使用。`;
}

function refreshAutoStates() {
  const manualCounts = getManualCounts();

  DEFAULT_DENOMINATIONS.forEach((denomination) => {
    const card = document.querySelector(`[data-denomination-card="${denomination}"]`);
    const isAuto = manualCounts[denomination] === 0;
    card.classList.toggle("is-manual", !isAuto);
  });
}

denominationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateSelectedDenomination(Number(button.dataset.denomination));
  });
});

manualCountInputs.forEach((input) => {
  input.addEventListener("input", refreshAutoStates);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "";
  refreshAutoStates();

  try {
    const result = calculateSalaryBills(salaryInput.value, {
      preferredDenomination,
      manualCounts: getManualCounts(),
    });
    renderResult(result);
  } catch (error) {
    message.textContent = error.message;
    renderEmpty("請修正薪水或手動張數後重新換算");
  }
});

refreshAutoStates();
