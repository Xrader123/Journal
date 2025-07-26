// Enhanced Trade Journal App - Money Management Version - Navigation Fixed

// Safe storage wrapper for sandbox compatibility
const safeStorage = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      const testKey = '__test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return localStorage;
    }
  } catch (e) {
    // fallback to memory store
  }
  let memoryStore = {};
  return {
    getItem: key => (key in memoryStore ? memoryStore[key] : null),
    setItem: (key, value) => { memoryStore[key] = value; },
    removeItem: key => { delete memoryStore[key]; },
    clear: () => { memoryStore = {}; }
  };
})();

// Utility Functions
function uid() {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

function formatPL(n) { return (n || 0).toFixed(2); }
function formatCurrency(n) { return `$${formatPL(n)}`; }
function getSentimentStars(n) { return '⭐'.repeat(n || 3); }

// Global app instance
let app = null;

// Initialize Day.js if available
if (typeof dayjs !== 'undefined' && window.dayjs_plugin_isoWeek) {
  dayjs.extend(window.dayjs_plugin_isoWeek);
}

// Simple data store
const dataStore = {
  trades: [
    {
      id: uid(),
      symbol: "AAPL",
      setup: "Breakout",
      beforeEntry: "Strong volume, clean breakout above resistance",
      status: "closed",
      createdDate: "2025-01-15",
      sentiment: 4,
      decisions: [
        {id: uid(), date: "2025-01-15", price: 150.00, quantity: 100, comments: "Initial entry", type: "entry"},
        {id: uid(), date: "2025-01-16", price: 155.00, quantity: -50, comments: "Partial exit", type: "exit"},
        {id: uid(), date: "2025-01-17", price: 158.00, quantity: -50, comments: "Final exit", type: "exit"}
      ]
    },
    {
      id: uid(),
      symbol: "TSLA",
      setup: "Pullback",
      beforeEntry: "Nice pullback to 20MA support",
      status: "open",
      createdDate: "2025-01-20",
      sentiment: 3,
      decisions: [
        {id: uid(), date: "2025-01-20", price: 200.00, quantity: 50, comments: "Entry at support", type: "entry"}
      ]
    }
  ],
  moneyEntries: [
    {
      id: uid(),
      date: "2025-01-01",
      type: "Deposit",
      amount: 10000,
      description: "Initial account funding"
    },
    {
      id: uid(),
      date: "2025-01-15",
      type: "Withdrawal",
      amount: 1000,
      description: "Partial withdrawal for expenses"
    }
  ],
  templates: [
    {
      id: uid(),
      name: "Momentum Breakout",
      setup: "Breakout",
      beforeEntry: "Volume confirmation, clean break above resistance"
    }
  ],
  settings: {
    theme: "dark",
    initialBalance: 10000,
    defaultRisk: 2,
    autoSave: true
  }
};

// Analytics functions
function calcNetPL(trade) {
  return -trade.decisions.reduce((sum, d) => sum + d.quantity * d.price, 0);
}

function calcCurrentBalance() {
  const moneyBalance = dataStore.moneyEntries.reduce((sum, entry) => {
    return entry.type === 'Deposit' ? sum + entry.amount : sum - entry.amount;
  }, 0);
  const tradingPL = dataStore.trades.reduce((sum, t) => sum + calcNetPL(t), 0);
  return moneyBalance + tradingPL;
}

function calcTotalDeposits() {
  return dataStore.moneyEntries
    .filter(entry => entry.type === 'Deposit')
    .reduce((sum, entry) => sum + entry.amount, 0);
}

function calcTotalWithdrawals() {
  return dataStore.moneyEntries
    .filter(entry => entry.type === 'Withdrawal')
    .reduce((sum, entry) => sum + entry.amount, 0);
}

function calcWinRate() {
  const closedTrades = dataStore.trades.filter(t => t.status === 'closed');
  if (closedTrades.length === 0) return 0;
  const winners = closedTrades.filter(t => calcNetPL(t) > 0);
  return (winners.length / closedTrades.length) * 100;
}

// Tab Management
function showTab(tabName) {
  console.log('Showing tab:', tabName);
  
  // Update navigation buttons
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    }
  });
  
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
    content.classList.remove('active');
  });
  
  // Show selected tab
  const targetTab = document.getElementById(`${tabName}-tab`);
  if (targetTab) {
    targetTab.classList.remove('hidden');
    targetTab.classList.add('active');
  }
  
  // Render content based on tab
  switch (tabName) {
    case 'trades':
      renderTradeList();
      break;
    case 'dashboard':
      renderDashboard();
      break;
    case 'money-management':
      renderMoneyManagement();
      break;
    case 'templates':
      renderTemplates();
      break;
    case 'settings':
      renderSettings();
      break;
    case 'import-export':
      // No specific rendering needed
      break;
  }
}

// Render Functions
function updateAccountBalance() {
  const balance = calcCurrentBalance();
  const balanceEl = document.getElementById('current-balance');
  if (balanceEl) {
    balanceEl.textContent = formatCurrency(balance);
    balanceEl.className = `balance-value ${balance >= 0 ? 'status--positive' : 'status--negative'}`;
  }
}

function renderTradeList() {
  const tbody = document.querySelector('#trade-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  dataStore.trades.forEach(trade => {
    const row = document.createElement('tr');
    const pl = calcNetPL(trade);
    
    row.innerHTML = `
      <td>${trade.symbol}</td>
      <td>${trade.setup}</td>
      <td><span class="badge ${trade.status === 'closed' ? 'status-badge-closed' : 'status-badge-open'}">${trade.status.toUpperCase()}</span></td>
      <td>${getSentimentStars(trade.sentiment)}</td>
      <td class="${pl >= 0 ? 'status--positive' : 'status--negative'}">${formatCurrency(pl)}</td>
      <td><button class="btn btn--outline btn--sm" onclick="viewTrade('${trade.id}')">Open</button></td>
    `;
    tbody.appendChild(row);
  });
  
  // Update aggregate P/L
  const total = dataStore.trades.reduce((sum, trade) => sum + calcNetPL(trade), 0);
  const span = document.getElementById('aggregate-pl');
  if (span) {
    span.textContent = `Total P/L: ${formatCurrency(total)}`;
    span.className = `status ${total >= 0 ? 'status--success' : 'status--error'}`;
  }
}

function renderMoneyManagement() {
  // Update summary cards
  const netFunding = calcTotalDeposits() - calcTotalWithdrawals();
  
  const netFundingEl = document.getElementById('net-funding');
  if (netFundingEl) netFundingEl.textContent = formatCurrency(netFunding);
  
  const summaryDepositsEl = document.getElementById('summary-deposits');
  if (summaryDepositsEl) summaryDepositsEl.textContent = formatCurrency(calcTotalDeposits());
  
  const summaryWithdrawalsEl = document.getElementById('summary-withdrawals');
  if (summaryWithdrawalsEl) summaryWithdrawalsEl.textContent = formatCurrency(calcTotalWithdrawals());
  
  // Render money entries table
  const tbody = document.querySelector('#money-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const sortedEntries = [...dataStore.moneyEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  let runningBalance = calcCurrentBalance();
  
  // Calculate running balance for each entry (working backwards)
  const entriesWithBalance = [];
  for (let i = sortedEntries.length - 1; i >= 0; i--) {
    const entry = sortedEntries[i];
    entriesWithBalance.unshift({
      ...entry,
      runningBalance: runningBalance
    });
    
    // Adjust running balance for next iteration (going backwards)
    runningBalance -= entry.type === 'Deposit' ? entry.amount : -entry.amount;
  }
  
  entriesWithBalance.forEach(entry => {
    const row = document.createElement('tr');
    const dateStr = typeof dayjs !== 'undefined' ? 
      dayjs(entry.date).format('MMM DD, YYYY') : 
      new Date(entry.date).toLocaleDateString();
    
    row.innerHTML = `
      <td>${dateStr}</td>
      <td><span class="badge ${entry.type === 'Deposit' ? 'status-badge-open' : 'status-badge-closed'}">${entry.type}</span></td>
      <td class="${entry.type === 'Deposit' ? 'status--positive' : 'status--negative'}">${formatCurrency(entry.amount)}</td>
      <td>${entry.description}</td>
      <td>${formatCurrency(entry.runningBalance)}</td>
      <td><button class="btn btn--error btn--sm" onclick="deleteMoneyEntry('${entry.id}')">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

function renderDashboard() {
  // Account overview
  const currentBalance = calcCurrentBalance();
  const totalDeposits = calcTotalDeposits();
  const totalWithdrawals = calcTotalWithdrawals();
  const tradingPL = dataStore.trades.reduce((sum, t) => sum + calcNetPL(t), 0);
  const avgBalance = totalDeposits > 0 ? totalDeposits : 10000; // Simplified
  const tradingReturn = avgBalance > 0 ? (tradingPL / avgBalance) * 100 : 0;
  
  const dashboardBalanceEl = document.getElementById('dashboard-balance');
  if (dashboardBalanceEl) dashboardBalanceEl.textContent = formatCurrency(currentBalance);
  
  const totalDepositsEl = document.getElementById('total-deposits');
  if (totalDepositsEl) totalDepositsEl.textContent = formatCurrency(totalDeposits);
  
  const totalWithdrawalsEl = document.getElementById('total-withdrawals');
  if (totalWithdrawalsEl) totalWithdrawalsEl.textContent = formatCurrency(totalWithdrawals);
  
  const tradingPlEl = document.getElementById('trading-pl');
  if (tradingPlEl) {
    tradingPlEl.textContent = formatCurrency(tradingPL);
    tradingPlEl.className = `value ${tradingPL >= 0 ? 'status--positive' : 'status--negative'}`;
  }
  
  const tradingReturnEl = document.getElementById('trading-return');
  if (tradingReturnEl) {
    tradingReturnEl.textContent = `${tradingReturn.toFixed(2)}%`;
    tradingReturnEl.className = `value ${tradingReturn >= 0 ? 'status--positive' : 'status--negative'}`;
  }
  
  // Update metrics
  const winRateEl = document.getElementById('win-rate');
  if (winRateEl) winRateEl.textContent = `${calcWinRate().toFixed(1)}%`;
  
  const totalPlEl = document.getElementById('total-pl');  
  if (totalPlEl) totalPlEl.textContent = formatCurrency(tradingPL);
  
  const avgPlEl = document.getElementById('avg-pl');
  if (avgPlEl) avgPlEl.textContent = formatCurrency(dataStore.trades.length ? tradingPL / dataStore.trades.length : 0);
  
  // Set other metrics to default values
  const riskRewardEl = document.getElementById('risk-reward');
  if (riskRewardEl) riskRewardEl.textContent = '1.50';
  
  const expectancyEl = document.getElementById('expectancy');
  if (expectancyEl) expectancyEl.textContent = '0.75';
  
  const maxDrawdownEl = document.getElementById('max-drawdown');
  if (maxDrawdownEl) maxDrawdownEl.textContent = formatCurrency(0);
  
  const profitFactorEl = document.getElementById('profit-factor');
  if (profitFactorEl) profitFactorEl.textContent = '1.25';
  
  const avgDaysEl = document.getElementById('avg-days');
  if (avgDaysEl) avgDaysEl.textContent = '3';
  
  // Render charts with Chart.js if available
  setTimeout(() => {
    if (typeof Chart !== 'undefined') {
      renderCharts();
    }
  }, 100);
}

function renderCharts() {
  // Balance Chart
  const balanceCtx = document.getElementById('balance-chart');
  if (balanceCtx && typeof Chart !== 'undefined') {
    const data = [
      {x: '2025-01-01', y: 10000},
      {x: '2025-01-15', y: 9000},
      {x: '2025-01-20', y: calcCurrentBalance()}
    ];
    
    new Chart(balanceCtx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Account Balance',
          data: data,
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { 
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          }
        }
      }
    });
  }
  
  // Money Flow Chart
  const moneyFlowCtx = document.getElementById('money-flow-chart');
  if (moneyFlowCtx && typeof Chart !== 'undefined') {
    const deposits = calcTotalDeposits();
    const withdrawals = calcTotalWithdrawals();
    const tradingPL = dataStore.trades.reduce((sum, t) => sum + calcNetPL(t), 0);
    
    new Chart(moneyFlowCtx, {
      type: 'bar',
      data: {
        labels: ['Deposits', 'Withdrawals', 'Trading P/L'],
        datasets: [{
          label: 'Amount',
          data: [deposits, -withdrawals, tradingPL],
          backgroundColor: ['#1FB8CD', '#B4413C', tradingPL >= 0 ? '#1FB8CD' : '#B4413C']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { 
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          }
        }
      }
    });
  }
}

function renderTemplates() {
  const container = document.getElementById('templates-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  dataStore.templates.forEach(template => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <h3>${template.name}</h3>
      <p><strong>Setup:</strong> ${template.setup}</p>
      <p>${template.beforeEntry}</p>
      <div class="template-actions">
        <button class="btn btn--primary btn--sm" onclick="useTemplate('${template.id}')">Use</button>
        <button class="btn btn--secondary btn--sm" onclick="editTemplate('${template.id}')">Edit</button>
        <button class="btn btn--error btn--sm" onclick="deleteTemplate('${template.id}')">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderSettings() {
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) themeSelect.value = dataStore.settings.theme;
  
  const initialBalance = document.getElementById('initial-balance');
  if (initialBalance) initialBalance.value = dataStore.settings.initialBalance;
  
  const defaultRisk = document.getElementById('default-risk');
  if (defaultRisk) defaultRisk.value = dataStore.settings.defaultRisk;
  
  const autoSave = document.getElementById('auto-save');
  if (autoSave) autoSave.checked = dataStore.settings.autoSave;
}

// Modal Management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Action Functions
function showNewTradeModal() {
  console.log('Opening new trade modal');
  const modal = document.getElementById('trade-modal');
  const title = document.getElementById('trade-modal-title');
  const form = document.getElementById('trade-form');
  
  if (title) title.textContent = 'New Trade';
  if (form) form.reset();
  
  openModal('trade-modal');
}

function showNewMoneyModal(type = 'Deposit') {
  console.log('Opening money modal for:', type);
  const modal = document.getElementById('money-modal');
  const title = document.getElementById('money-modal-title');
  const form = document.getElementById('money-form');
  const typeSelect = document.getElementById('money-type');
  const dateInput = document.getElementById('money-date');
  
  if (title) title.textContent = `Add ${type}`;
  if (form) form.reset();
  if (typeSelect) typeSelect.value = type;
  if (dateInput) {
    const today = typeof dayjs !== 'undefined' ? 
      dayjs().format('YYYY-MM-DD') : 
      new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
  
  openModal('money-modal');
}

function saveTrade(event) {
  if (event) event.preventDefault();
  
  const symbolEl = document.getElementById('trade-symbol');
  const setupEl = document.getElementById('trade-setup');
  const beforeEl = document.getElementById('trade-before');
  const sentimentEl = document.getElementById('trade-sentiment');
  
  if (!symbolEl || !setupEl || !sentimentEl) return;
  
  const trade = {
    id: uid(),
    symbol: symbolEl.value.trim().toUpperCase(),
    setup: setupEl.value.trim(),
    beforeEntry: beforeEl ? beforeEl.value.trim() : '',
    status: 'open',
    createdDate: typeof dayjs !== 'undefined' ? 
      dayjs().format('YYYY-MM-DD') : 
      new Date().toISOString().split('T')[0],
    sentiment: parseInt(sentimentEl.value),
    decisions: []
  };
  
  dataStore.trades.push(trade);
  saveData();
  closeModal('trade-modal');
  updateAccountBalance();
  renderTradeList();
}

function saveMoneyEntry(event) {
  if (event) event.preventDefault();
  
  const dateEl = document.getElementById('money-date');
  const typeEl = document.getElementById('money-type');
  const amountEl = document.getElementById('money-amount');
  const descriptionEl = document.getElementById('money-description');
  
  if (!dateEl || !typeEl || !amountEl) return;
  
  const entry = {
    id: uid(),
    date: dateEl.value,
    type: typeEl.value,
    amount: parseFloat(amountEl.value),
    description: descriptionEl ? descriptionEl.value.trim() : ''
  };
  
  dataStore.moneyEntries.push(entry);
  saveData();
  closeModal('money-modal');
  updateAccountBalance();
  renderMoneyManagement();
}

function deleteMoneyEntry(entryId) {
  if (confirm('Are you sure you want to delete this money entry?')) {
    dataStore.moneyEntries = dataStore.moneyEntries.filter(e => e.id !== entryId);
    saveData();
    updateAccountBalance();
    renderMoneyManagement();
  }
}

function exportOrganizedCSV() {
  const timestamp = new Date().toISOString().split('T')[0];
  
  let csv = `Enhanced Trade Journal Export\nExported on: ${timestamp}\n\n`;
  
  // Account Summary Section
  csv += '=== ACCOUNT SUMMARY ===\n';
  const currentBalance = calcCurrentBalance();
  const totalDeposits = calcTotalDeposits();
  const totalWithdrawals = calcTotalWithdrawals();
  const tradingPL = dataStore.trades.reduce((sum, t) => sum + calcNetPL(t), 0);
  
  csv += `Current Balance,${currentBalance.toFixed(2)}\n`;
  csv += `Total Deposits,${totalDeposits.toFixed(2)}\n`;
  csv += `Total Withdrawals,${totalWithdrawals.toFixed(2)}\n`;
  csv += `Net Funding,${(totalDeposits - totalWithdrawals).toFixed(2)}\n`;
  csv += `Trading P/L,${tradingPL.toFixed(2)}\n`;
  csv += `Win Rate,${calcWinRate().toFixed(1)}%\n\n`;
  
  // Money Management Section
  csv += '=== MONEY MANAGEMENT ===\n';
  csv += 'Date,Type,Amount,Description\n';
  
  dataStore.moneyEntries.forEach(entry => {
    csv += `${entry.date},${entry.type},${entry.amount.toFixed(2)},"${entry.description.replace(/"/g, '""')}"\n`;
  });
  
  csv += '\n';
  
  // Trades Summary Section
  css += '=== TRADES SUMMARY ===\n';
  csv += 'Symbol,Setup,Status,Sentiment,Created Date,Net P/L,Before Entry\n';
  
  dataStore.trades.forEach(trade => {
    const pl = calcNetPL(trade);
    csv += `${trade.symbol},"${trade.setup}",${trade.status},${trade.sentiment},${trade.createdDate},${pl.toFixed(2)},"${trade.beforeEntry.replace(/"/g, '""')}"\n`;
  });
  
  // Download file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trade_journal_organized_${timestamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportJSON() {
  const data = {
    trades: dataStore.trades,
    moneyEntries: dataStore.moneyEntries,
    templates: dataStore.templates,
    settings: dataStore.settings,
    exportDate: new Date().toISOString()
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trade_journal_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Stub functions for other actions
function viewTrade(tradeId) { console.log('View trade:', tradeId); }
function useTemplate(templateId) { console.log('Use template:', templateId); }
function editTemplate(templateId) { console.log('Edit template:', templateId); }
function deleteTemplate(templateId) { console.log('Delete template:', templateId); }

// Data persistence
function saveData() {
  try {
    const data = {
      trades: dataStore.trades,
      moneyEntries: dataStore.moneyEntries,
      templates: dataStore.templates,
      settings: dataStore.settings
    };
    safeStorage.setItem('tradeJournalData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

function loadData() {
  try {
    const stored = safeStorage.getItem('tradeJournalData');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.trades) dataStore.trades = data.trades;
      if (data.moneyEntries) dataStore.moneyEntries = data.moneyEntries;
      if (data.templates) dataStore.templates = data.templates;
      if (data.settings) dataStore.settings = {...dataStore.settings, ...data.settings};
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Initialize app
function initApp() {
  console.log('Initializing Trade Journal App...');
  
  loadData();
  
  // Set theme
  document.documentElement.setAttribute('data-theme', dataStore.settings.theme);
  
  // Navigation tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      showTab(this.dataset.tab);
    });
  });
  
  // Floating action button
  const newTradeBtn = document.getElementById('new-trade-btn');
  if (newTradeBtn) {
    newTradeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showNewTradeModal();
    });
  }
  
  // Money management buttons
  const addDepositBtn = document.getElementById('add-deposit-btn');
  if (addDepositBtn) {
    addDepositBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showNewMoneyModal('Deposit');
    });
  }
  
  const addWithdrawalBtn = document.getElementById('add-withdrawal-btn');
  if (addWithdrawalBtn) {
    addWithdrawalBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showNewMoneyModal('Withdrawal');
    });
  }
  
  // Modal close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const modal = this.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // Form submissions
  const tradeForm = document.getElementById('trade-form');
  if (tradeForm) {
    tradeForm.addEventListener('submit', saveTrade);
  }
  
  const moneyForm = document.getElementById('money-form');
  if (moneyForm) {
    moneyForm.addEventListener('submit', saveMoneyEntry);
  }
  
  // Export buttons
  const exportCsvBtn = document.getElementById('export-csv-btn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', function(e) {
      e.preventDefault();
      exportOrganizedCSV();
    });
  }
  
  const exportJsonBtn = document.getElementById('export-json-btn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', function(e) {
      e.preventDefault();
      exportJSON();
    });
  }
  
  // Initialize with trades tab
  showTab('trades');
  updateAccountBalance();
  
  console.log('App initialized successfully');
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}