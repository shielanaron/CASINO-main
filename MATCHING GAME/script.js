const board = document.getElementById('board');
const multiplierEl = document.getElementById('multiplier');
const movesEl = document.getElementById('moves');
const totalWinEl = document.getElementById('totalWin');
const finalScoreEl = document.getElementById('final-score');
const historyList = document.getElementById('historyList');
const balanceEl = document.getElementById('balance');
const cashoutModal = document.getElementById('cashoutModal');

let tiles = [];
let firstTile = null;
let secondTile = null;
let multiplier = 1;
let moves = 0;
let totalWin = 0;
let balance = 100;
let history = [];
let lockBoard = false; // para maiwasan mag-click habang may animation

function createBoard() {
  const emojis = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐯', '🐸'];
  const pairs = [...emojis, ...emojis];
  pairs.sort(() => 0.5 - Math.random());

  board.innerHTML = '';
  tiles = [];

  pairs.forEach((emoji, index) => {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.dataset.emoji = emoji;
    tile.dataset.index = index;
    tile.textContent = '?';
    tile.addEventListener('click', handleTileClick);
    board.appendChild(tile);
    tiles.push(tile);
  });
}

function handleTileClick(e) {
  if (lockBoard) return; // hindi papayagan mag-click habang may nakabinbing animation
  if (balance < 10) {
    alert("Balance is not enough to make a move. Please cash in.");
    return;
  }

  const tile = e.target;
  if (tile.classList.contains('matched') || tile.textContent !== '?') return;

  tile.textContent = tile.dataset.emoji;

  if (!firstTile) {
    firstTile = tile;
  } else if (!secondTile && tile !== firstTile) {
    secondTile = tile;

    // Deduct $10 per two tile clicks (1 move)
    balance -= 10;
    moves++;
    updateStats();

    if (firstTile.dataset.emoji === secondTile.dataset.emoji) {
      // Matched pair: add $10 to totalWin, multiplier++
      totalWin += 10;
      multiplier++;

      // Mark matched tiles with green background and disable clicking
      firstTile.classList.add('matched');
      secondTile.classList.add('matched');

      // They stay open (already showing emoji)

      saveToHistory(`Matched: ${firstTile.dataset.emoji} (+$10)`);
      resetTurn();
    } else {
      // Lock board to prevent clicks during flip back
      lockBoard = true;

      // Not matched: flip back after delay, reset multiplier
      setTimeout(() => {
        firstTile.textContent = '?';
        secondTile.textContent = '?';
        multiplier = 1;
        resetTurn();
        lockBoard = false;
      }, 800);
    }
  }
}

function resetTurn() {
  firstTile = null;
  secondTile = null;
  updateStats();
  checkGameOver();
}

function updateStats() {
  multiplierEl.textContent = multiplier;
  movesEl.textContent = moves;
  totalWinEl.textContent = totalWin.toFixed(2);
  balanceEl.textContent = balance.toFixed(2);
}

function checkGameOver() {
  const matched = tiles.every(tile => tile.classList.contains('matched'));
  if (matched) {
    finalScoreEl.textContent = `🎉 Game Over! Total Win: $${totalWin.toFixed(2)}`;
    saveToHistory(`Game Over - Total Win: $${totalWin.toFixed(2)}`);
  }
}

function saveToHistory(entry) {
  history.unshift(entry);
  if (history.length > 10) history.pop();
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  historyList.innerHTML = '';
  history.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    historyList.appendChild(li);
  });
}

function toggleHistory() {
  const panel = document.getElementById('historyPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function cashIn() {
  const amountStr = prompt("Enter cash in amount:");
  const amount = parseFloat(amountStr);
  if (!isNaN(amount) && amount > 0) {
    balance += amount;
    updateStats();
    alert(`You cashed in $${amount.toFixed(2)}.`);
  } else {
    alert("Invalid amount.");
  }
}

function cashOut() {
  if (totalWin <= 0) {
    alert("No winnings to cash out.");
    return;
  }
  cashoutModal.style.display = 'block';
}

function selectCashOut(method) {
  alert(`You cashed out $${totalWin.toFixed(2)} via ${method}.`);
  totalWin = 0;
  updateStats();
  closeModal();
}

function closeModal() {
  cashoutModal.style.display = 'none';
}

createBoard();
updateStats();

updateStats();
