const board = document.getElementById("plinkoBoard");
const result = document.getElementById("result");
const balanceDisplay = document.getElementById("balance");
const cashOutPoolDisplay = document.getElementById("cashOutPool");
const cashoutModal = document.getElementById("cashoutModal");

const slots = [0.5, 1, 2, 5, 2, 1, 0.5];
const rows = 7;
const pegSpacing = 43;
const ballSize = 15;
const startY = 40;

let balance = 100;
let cashOutPool = 0;

function updateBalanceDisplay() {
  balanceDisplay.textContent = balance.toFixed(2);
}

function updateCashOutPoolDisplay() {
  cashOutPoolDisplay.textContent = cashOutPool.toFixed(2);
}

function setupBoard() {
  board.innerHTML = '<div id="result"></div>';

  // Create pegs
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= r; c++) {
      const peg = document.createElement("div");
      peg.className = "peg";
      peg.style.top = `${startY + r * pegSpacing}px`;
      peg.style.left = `${(c + (slots.length - r - 0.4) / 2) * pegSpacing}px`;
      board.appendChild(peg);
    }
  }

  // Create slots
  for (let i = 0; i < slots.length; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.style.left = `${i * pegSpacing}px`;
    slot.style.width = `${pegSpacing}px`;
    slot.textContent = `${slots[i]}x`;
    board.appendChild(slot);
  }
}

function dropBall() {
  const betInput = document.getElementById("bet");
  const bet = parseFloat(betInput.value);

  if (isNaN(bet) || bet <= 0) {
    alert("Please enter a valid bet amount.");
    return;
  }
  if (bet > balance) {
    alert("Insufficient balance.");
    return;
  }

  balance -= bet;
  updateBalanceDisplay();

  const oldBall = document.querySelector(".ball");
  if (oldBall) oldBall.remove();

  let position = Math.floor(slots.length / 2);
  const ball = document.createElement("div");
  ball.className = "ball";
  board.appendChild(ball);

  ball.style.top = `${startY}px`;
  ball.style.left = `${position * pegSpacing + (pegSpacing - ballSize) / 2}px`;

  let step = 0;

  function fall() {
    if (step < rows) {
      const direction = Math.random() < 0.5 ? -1 : 1;
      position += direction;
      position = Math.max(0, Math.min(slots.length - 1, position));

      ball.style.top = `${startY + (step + 1) * pegSpacing}px`;
      ball.style.left = `${position * pegSpacing + (pegSpacing - ballSize) / 2}px`;

      step++;
      setTimeout(fall, 300);
    } else {
      const payout = bet * slots[position];
      cashOutPool += payout;
      updateCashOutPoolDisplay();
      result.textContent = `Ball landed in ${slots[position]}x slot. You won $${payout.toFixed(2)}!`;

      setTimeout(() => {
        ball.remove();
      }, 2000);
    }
  }

  fall();
}

function cashIn() {
  const amount = parseFloat(prompt("Enter amount to cash in:"));
  if (!isNaN(amount) && amount > 0) {
    balance += amount;
    updateBalanceDisplay();
    alert(`Successfully cashed in $${amount.toFixed(2)}!`);
  } else {
    alert("Invalid cash in amount.");
  }
}

function cashOut() {
  if (cashOutPool <= 0) {
    alert("No winnings to cash out.");
    return;
  }

  cashoutModal.style.display = "block";
}

function closeModal() {
  cashoutModal.style.display = "none";
}

function selectCashOut(method) {
  alert(`Cashing out $${cashOutPool.toFixed(2)} via ${method}.`);
  cashOutPool = 0;
  updateCashOutPoolDisplay();
  closeModal();
}

// Init
setupBoard();
updateBalanceDisplay();
updateCashOutPoolDisplay();
