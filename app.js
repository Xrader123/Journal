// Trading Journal App - JavaScript (Fixed Version)
class TradingJournal {
    constructor() {
        this.currentSection = 'trades';
        this.currentTradeId = null;
        this.charts = {};
        
        // Initialize data structure
        this.initializeData();
        
        // Bind events after DOM is ready
        this.bindEvents();
        
        // Check first launch
        this.checkFirstLaunch();
        
        // Initialize the app
        this.init();
    }

    initializeData() {
        // Default data structure
        const defaultData = {
            trades: [],
            fundMovements: [],
            settings: {
                fiscalYearStart: '2024-04-01',
                defaultSetups: ['Breakout', 'Pullback', 'Support Bounce', 'Trend Following'],
                defaultTags: ['Large Cap', 'Mid Cap', 'Small Cap', 'IT', 'Banking', 'Energy', 'Pharma'],
                defaultSituations: ['Market Open', 'Mid Day', 'After Hours', 'Pre Market'],
                theme: 'light',
                startingBalance: 0,
                isFirstLaunch: true
            }
        };

        // Load or initialize data
        if (!localStorage.getItem('tradingJournalData')) {
            // Load sample data for demo
            const sampleData = {
                trades: [
                    {
                        id: 1,
                        symbol: 'RELIANCE',
                        setup: 'Breakout',
                        initialRisk: 1000,
                        allRulesFollowed: true,
                        tags: ['Large Cap', 'Energy'],
                        situation: 'Market Open',
                        createdDate: '2024-01-15',
                        status: 'Closed',
                        decisions: [
                            {
                                id: 1,
                                date: '2024-01-15',
                                action: 'Buy',
                                quantity: 5,
                                price: 2800,
                                comments: 'Breakout above resistance'
                            },
                            {
                                id: 2,
                                date: '2024-01-17',
                                action: 'Sell',
                                quantity: 5,
                                price: 2950,
                                comments: 'Target reached'
                            }
                        ],
                        netQuantity: 0,
                        netPnl: 750,
                        rMultiple: 0.75
                    },
                    {
                        id: 2,
                        symbol: 'INFY',
                        setup: 'Pullback',
                        initialRisk: 800,
                        allRulesFollowed: true,
                        tags: ['IT', 'Large Cap'],
                        situation: 'After Hours',
                        createdDate: '2024-01-20',
                        status: 'Open',
                        decisions: [
                            {
                                id: 3,
                                date: '2024-01-20',
                                action: 'Buy',
                                quantity: 6,
                                price: 1650,
                                comments: 'Buying the dip'
                            }
                        ],
                        netQuantity: 6,
                        netPnl: 0,
                        rMultiple: 0
                    }
                ],
                fundMovements: [
                    {
                        id: 1,
                        date: '2024-01-01',
                        amount: 100000,
                        type: 'Starting Balance',
                        comments: 'Initial capital'
                    },
                    {
                        id: 2,
                        date: '2024-02-01',
                        amount: 25000,
                        type: 'Addition',
                        comments: 'Monthly addition'
                    }
                ],
                settings: {
                    ...defaultData.settings,
                    startingBalance: 100000,
                    isFirstLaunch: false
                }
            };
            
            localStorage.setItem('tradingJournalData', JSON.stringify(sampleData));
            this.data = sampleData;
        } else {
            this.data = JSON.parse(localStorage.getItem('tradingJournalData'));
        }
    }

    saveData() {
        localStorage.setItem('tradingJournalData', JSON.stringify(this.data));
    }

    bindEvents() {
        // Navigation - fix event binding
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const section = e.currentTarget.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Trade management - fix button binding
        const addTradeBtn = document.getElementById('add-trade-btn');
        if (addTradeBtn) {
            addTradeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showTradeModal();
            });
        }

        // Form submissions
        const tradeForm = document.getElementById('trade-form');
        if (tradeForm) {
            tradeForm.addEventListener('submit', (e) => this.saveTradeForm(e));
        }

        const decisionForm = document.getElementById('decision-form');
        if (decisionForm) {
            decisionForm.addEventListener('submit', (e) => this.saveDecisionForm(e));
        }

        const fundForm = document.getElementById('fund-form');
        if (fundForm) {
            fundForm.addEventListener('submit', (e) => this.saveFundForm(e));
        }

        const firstLaunchForm = document.getElementById('first-launch-form');
        if (firstLaunchForm) {
            firstLaunchForm.addEventListener('submit', (e) => this.completeFirstLaunch(e));
        }

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Cancel buttons
        const cancelButtons = ['cancel-trade', 'cancel-decision', 'cancel-fund'];
        cancelButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const modal = e.target.closest('.modal');
                    if (modal) {
                        this.hideModal(modal.id);
                    }
                });
            }
        });

        // Fund management
        const addFundsBtn = document.getElementById('add-funds-btn');
        if (addFundsBtn) {
            addFundsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showFundModal();
            });
        }

        // Filters
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterTrades());
        }

        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.filterTrades());
        }

        // Dashboard toggles
        const rulesToggle = document.getElementById('rules-toggle');
        if (rulesToggle) {
            rulesToggle.addEventListener('change', () => this.updateDashboard());
        }

        const mcRulesToggle = document.getElementById('mc-rules-toggle');
        if (mcRulesToggle) {
            mcRulesToggle.addEventListener('change', () => this.updateMonteCarloData());
        }

        // Monte Carlo simulation
        const runSimBtn = document.getElementById('run-simulation-btn');
        if (runSimBtn) {
            runSimBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.runMonteCarloSimulation();
            });
        }

        // Settings
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => this.toggleTheme(e.target.checked));
        }

        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.exportData();
            });
        }

        const addSetupBtn = document.getElementById('add-setup-btn');
        if (addSetupBtn) {
            addSetupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addSetup();
            });
        }

        const addTagBtn = document.getElementById('add-tag-btn');
        if (addTagBtn) {
            addTagBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addTag();
            });
        }

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    init() {
        this.showSection('trades');
        this.populateTradeForm();
        this.renderTrades();
        this.renderFunds();
        this.updateDashboard();
        this.renderSettings();
        
        // Apply saved theme
        if (this.data.settings.theme === 'dark') {
            document.body.setAttribute('data-color-scheme', 'dark');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.checked = true;
        }
    }

    checkFirstLaunch() {
        if (this.data.settings.isFirstLaunch) {
            const firstLaunchModal = document.getElementById('first-launch-modal');
            if (firstLaunchModal) {
                firstLaunchModal.classList.remove('hidden');
            }
        }
    }

    completeFirstLaunch(e) {
        e.preventDefault();
        const startingBalance = parseInt(document.getElementById('starting-balance').value);
        
        // Set starting balance
        this.data.settings.startingBalance = startingBalance;
        this.data.settings.isFirstLaunch = false;
        
        // Add starting balance as first fund movement
        this.data.fundMovements = [{
            id: 1,
            date: new Date().toISOString().split('T')[0],
            amount: startingBalance,
            type: 'Starting Balance',
            comments: 'Initial capital'
        }];
        
        this.saveData();
        this.hideModal('first-launch-modal');
        this.renderFunds();
        this.updateDashboard();
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeNavBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        }
        
        this.currentSection = sectionName;
        
        // Load section-specific data
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        } else if (sectionName === 'monte-carlo') {
            this.updateMonteCarloData();
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showTradeModal(tradeId = null) {
        const modal = document.getElementById('trade-modal');
        const title = document.getElementById('trade-modal-title');
        
        if (tradeId) {
            title.textContent = 'Edit Trade';
            // Populate form with trade data
            const trade = this.data.trades.find(t => t.id === tradeId);
            if (trade) {
                document.getElementById('trade-symbol').value = trade.symbol;
                document.getElementById('trade-setup').value = trade.setup;
                document.getElementById('trade-risk').value = trade.initialRisk;
                document.getElementById('trade-rules-followed').checked = trade.allRulesFollowed;
                document.getElementById('trade-situation').value = trade.situation;
                // Set tags
                trade.tags.forEach(tag => {
                    const checkbox = document.querySelector(`#trade-tags input[value="${tag}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } else {
            title.textContent = 'Add Trade';
            const form = document.getElementById('trade-form');
            if (form) form.reset();
        }
        
        this.currentTradeId = tradeId;
        this.showModal('trade-modal');
    }

    saveTradeForm(e) {
        e.preventDefault();
        
        const formData = {
            symbol: document.getElementById('trade-symbol').value.toUpperCase().trim(),
            setup: document.getElementById('trade-setup').value,
            initialRisk: parseInt(document.getElementById('trade-risk').value),
            allRulesFollowed: document.getElementById('trade-rules-followed').checked,
            situation: document.getElementById('trade-situation').value,
            tags: Array.from(document.querySelectorAll('#trade-tags input:checked')).map(cb => cb.value)
        };
        
        // Validation
        if (!formData.symbol || !formData.setup || !formData.initialRisk || !formData.situation) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        if (this.currentTradeId) {
            // Update existing trade
            const tradeIndex = this.data.trades.findIndex(t => t.id === this.currentTradeId);
            if (tradeIndex !== -1) {
                Object.assign(this.data.trades[tradeIndex], formData);
            }
        } else {
            // Create new trade
            const newTrade = {
                id: Date.now(),
                ...formData,
                createdDate: new Date().toISOString().split('T')[0],
                status: 'Open',
                decisions: [],
                netQuantity: 0,
                netPnl: 0,
                rMultiple: 0
            };
            this.data.trades.push(newTrade);
        }
        
        this.saveData();
        this.renderTrades();
        this.hideModal('trade-modal');
        this.showMessage('Trade saved successfully!', 'success');
    }

    populateTradeForm() {
        // Populate setups
        const setupSelect = document.getElementById('trade-setup');
        if (setupSelect) {
            setupSelect.innerHTML = '';
            this.data.settings.defaultSetups.forEach(setup => {
                const option = document.createElement('option');
                option.value = setup;
                option.textContent = setup;
                setupSelect.appendChild(option);
            });
        }
        
        // Populate situations
        const situationSelect = document.getElementById('trade-situation');
        if (situationSelect) {
            situationSelect.innerHTML = '';
            this.data.settings.defaultSituations.forEach(situation => {
                const option = document.createElement('option');
                option.value = situation;
                option.textContent = situation;
                situationSelect.appendChild(option);
            });
        }
        
        // Populate tags
        const tagsContainer = document.getElementById('trade-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            this.data.settings.defaultTags.forEach(tag => {
                const tagDiv = document.createElement('div');
                tagDiv.className = 'tag-checkbox';
                tagDiv.innerHTML = `
                    <input type="checkbox" id="tag-${tag}" value="${tag}">
                    <label for="tag-${tag}">${tag}</label>
                `;
                tagsContainer.appendChild(tagDiv);
            });
        }
    }

    renderTrades() {
        const tradeList = document.getElementById('trade-list');
        if (!tradeList) return;
        
        if (this.data.trades.length === 0) {
            tradeList.innerHTML = `
                <div class="empty-state">
                    <h3>No trades yet</h3>
                    <p>Start by adding your first trade</p>
                    <button class="btn btn--primary" onclick="app.showTradeModal()">Add Trade</button>
                </div>
            `;
            return;
        }
        
        tradeList.innerHTML = '';
        this.data.trades.forEach(trade => {
            const tradeDiv = document.createElement('div');
            tradeDiv.className = `trade-item ${trade.status.toLowerCase()} ${this.getTradeClass(trade)}`;
            
            // Add click event with proper binding
            tradeDiv.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showTradeDetail(trade.id);
            });
            
            tradeDiv.innerHTML = `
                <div class="trade-header">
                    <div class="trade-symbol">${trade.symbol}</div>
                    <div class="trade-status ${trade.status.toLowerCase()}">${trade.status}</div>
                </div>
                <div class="trade-details">
                    <div class="trade-detail">
                        <div class="trade-detail-label">Setup</div>
                        <div class="trade-detail-value">${trade.setup}</div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-detail-label">Net P/L</div>
                        <div class="trade-detail-value ${trade.netPnl >= 0 ? 'positive' : 'negative'}">
                            ₹${trade.netPnl.toLocaleString()}
                        </div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-detail-label">R Multiple</div>
                        <div class="trade-detail-value ${trade.rMultiple >= 0 ? 'positive' : 'negative'}">
                            ${trade.rMultiple.toFixed(2)}R
                        </div>
                    </div>
                    <div class="trade-detail">
                        <div class="trade-detail-label">Date</div>
                        <div class="trade-detail-value">${this.formatDate(trade.createdDate)}</div>
                    </div>
                </div>
            `;
            
            tradeList.appendChild(tradeDiv);
        });
    }

    getTradeClass(trade) {
        if (trade.status === 'Open') return 'open';
        return trade.netPnl >= 0 ? 'winner' : 'loser';
    }

    showTradeDetail(tradeId) {
        const trade = this.data.trades.find(t => t.id === tradeId);
        if (!trade) return;
        
        this.currentTradeId = tradeId;
        
        const title = document.getElementById('trade-detail-title');
        if (title) title.textContent = `${trade.symbol} - Trade Details`;
        
        const content = document.getElementById('trade-detail-content');
        if (content) {
            content.innerHTML = `
                <div class="trade-info-grid">
                    <div class="trade-info-item">
                        <div class="trade-info-label">Symbol</div>
                        <div class="trade-info-value">${trade.symbol}</div>
                    </div>
                    <div class="trade-info-item">
                        <div class="trade-info-label">Setup</div>
                        <div class="trade-info-value">${trade.setup}</div>
                    </div>
                    <div class="trade-info-item">
                        <div class="trade-info-label">Initial Risk</div>
                        <div class="trade-info-value">₹${trade.initialRisk.toLocaleString()}</div>
                    </div>
                    <div class="trade-info-item">
                        <div class="trade-info-label">Status</div>
                        <div class="trade-info-value">${trade.status}</div>
                    </div>
                    <div class="trade-info-item">
                        <div class="trade-info-label">Net Quantity</div>
                        <div class="trade-info-value">${trade.netQuantity}</div>
                    </div>
                    <div class="trade-info-item">
                        <div class="trade-info-label">Net P/L</div>
                        <div class="trade-info-value ${trade.netPnl >= 0 ? 'positive' : 'negative'}">
                            ₹${trade.netPnl.toLocaleString()}
                        </div>
                    </div>
                    <div class="trade-info-item">
                        <div class="trade-info-label">R Multiple</div>
                        <div class="trade-info-value ${trade.rMultiple >= 0 ? 'positive' : 'negative'}">
                            ${trade.rMultiple.toFixed(2)}R
                        </div>
                    </div>
                    <div class="trade-info-item">
                        <div class="trade-info-label">Rules Followed</div>
                        <div class="trade-info-value">${trade.allRulesFollowed ? 'Yes' : 'No'}</div>
                    </div>
                </div>
                <div class="trade-info-item">
                    <div class="trade-info-label">Tags</div>
                    <div class="trade-info-value">${trade.tags.join(', ')}</div>
                </div>
                <div class="trade-info-item">
                    <div class="trade-info-label">Situation</div>
                    <div class="trade-info-value">${trade.situation}</div>
                </div>
            `;
        }
        
        this.renderDecisions(trade);
        
        // Add decision button event with proper binding
        const addDecisionBtn = document.getElementById('add-decision-btn');
        if (addDecisionBtn) {
            // Remove any existing event listeners
            addDecisionBtn.replaceWith(addDecisionBtn.cloneNode(true));
            const newAddDecisionBtn = document.getElementById('add-decision-btn');
            newAddDecisionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showDecisionModal();
            });
        }
        
        this.showModal('trade-detail-modal');
    }

    renderDecisions(trade) {
        const decisionsList = document.getElementById('decisions-list');
        if (!decisionsList) return;
        
        if (trade.decisions.length === 0) {
            decisionsList.innerHTML = `
                <div class="empty-state">
                    <p>No decisions recorded yet</p>
                </div>
            `;
            return;
        }
        
        decisionsList.innerHTML = '';
        trade.decisions.forEach(decision => {
            const decisionDiv = document.createElement('div');
            decisionDiv.className = 'decision-item';
            
            decisionDiv.innerHTML = `
                <div class="decision-header">
                    <div class="decision-action ${decision.action.toLowerCase()}">${decision.action}</div>
                    <div class="decision-date">${this.formatDate(decision.date)}</div>
                </div>
                <div class="decision-details">
                    <div>
                        <strong>Quantity:</strong> ${decision.quantity}
                    </div>
                    <div>
                        <strong>Price:</strong> ₹${decision.price.toLocaleString()}
                    </div>
                    <div>
                        <strong>Value:</strong> ₹${(decision.quantity * decision.price).toLocaleString()}
                    </div>
                </div>
                ${decision.comments ? `<div class="decision-comments">${decision.comments}</div>` : ''}
            `;
            
            decisionsList.appendChild(decisionDiv);
        });
    }

    showDecisionModal() {
        // Set today's date as default
        const dateInput = document.getElementById('decision-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        this.showModal('decision-modal');
    }

    saveDecisionForm(e) {
        e.preventDefault();
        
        const decision = {
            id: Date.now(),
            date: document.getElementById('decision-date').value,
            action: document.getElementById('decision-action').value,
            quantity: parseInt(document.getElementById('decision-quantity').value),
            price: parseFloat(document.getElementById('decision-price').value),
            comments: document.getElementById('decision-comments').value || ''
        };
        
        // Validation
        if (!decision.date || !decision.action || !decision.quantity || !decision.price) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Add decision to trade
        const trade = this.data.trades.find(t => t.id === this.currentTradeId);
        if (trade) {
            trade.decisions.push(decision);
            this.recalculateTradeMetrics(trade);
            this.saveData();
            this.renderDecisions(trade);
            this.renderTrades();
            this.hideModal('decision-modal');
            const form = document.getElementById('decision-form');
            if (form) form.reset();
            this.showMessage('Decision added successfully!', 'success');
        }
    }

    recalculateTradeMetrics(trade) {
        let netQuantity = 0;
        let totalBought = 0;
        let totalSold = 0;
        let buyValue = 0;
        let sellValue = 0;
        
        trade.decisions.forEach(decision => {
            const value = decision.quantity * decision.price;
            
            if (decision.action === 'Buy') {
                netQuantity += decision.quantity;
                totalBought += decision.quantity;
                buyValue += value;
            } else if (decision.action === 'Sell') {
                netQuantity -= decision.quantity;
                totalSold += decision.quantity;
                sellValue += value;
            }
        });
        
        trade.netQuantity = netQuantity;
        trade.status = netQuantity === 0 ? 'Closed' : 'Open';
        
        if (trade.status === 'Closed' && totalSold > 0 && totalBought > 0) {
            const avgBuyPrice = buyValue / totalBought;
            trade.netPnl = sellValue - (totalSold * avgBuyPrice);
            trade.rMultiple = trade.netPnl / trade.initialRisk;
        } else {
            trade.netPnl = 0;
            trade.rMultiple = 0;
        }
    }

    showFundModal() {
        // Set today's date as default
        const dateInput = document.getElementById('fund-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        this.showModal('fund-modal');
    }

    saveFundForm(e) {
        e.preventDefault();
        
        const fundMovement = {
            id: Date.now(),
            date: document.getElementById('fund-date').value,
            amount: parseInt(document.getElementById('fund-amount').value),
            type: document.getElementById('fund-type').value,
            comments: document.getElementById('fund-comments').value || ''
        };
        
        // Validation
        if (!fundMovement.date || !fundMovement.amount || !fundMovement.type) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        this.data.fundMovements.push(fundMovement);
        this.saveData();
        this.renderFunds();
        this.hideModal('fund-modal');
        const form = document.getElementById('fund-form');
        if (form) form.reset();
        this.showMessage('Fund movement added successfully!', 'success');
    }

    renderFunds() {
        const fundsList = document.getElementById('funds-list');
        const currentBalance = document.getElementById('current-balance');
        
        if (!fundsList || !currentBalance) return;
        
        // Calculate current balance
        let balance = 0;
        const sortedMovements = [...this.data.fundMovements].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        sortedMovements.forEach(movement => {
            if (movement.type === 'Starting Balance' || movement.type === 'Addition') {
                balance += movement.amount;
            } else if (movement.type === 'Withdrawal') {
                balance -= movement.amount;
            }
        });
        
        // Add trading P/L to balance
        const tradingPnl = this.data.trades.reduce((sum, trade) => sum + trade.netPnl, 0);
        balance += tradingPnl;
        
        currentBalance.textContent = `₹${balance.toLocaleString()}`;
        
        if (this.data.fundMovements.length === 0) {
            fundsList.innerHTML = `
                <div class="empty-state">
                    <h3>No fund movements</h3>
                    <p>Add your starting balance or fund movements</p>
                </div>
            `;
            return;
        }
        
        fundsList.innerHTML = '';
        [...this.data.fundMovements].reverse().forEach(movement => {
            const fundDiv = document.createElement('div');
            fundDiv.className = 'fund-item';
            
            const isNegative = movement.type === 'Withdrawal';
            
            fundDiv.innerHTML = `
                <div class="fund-header">
                    <div class="fund-amount ${isNegative ? 'negative' : 'positive'}">
                        ${isNegative ? '-' : '+'}₹${movement.amount.toLocaleString()}
                    </div>
                    <div class="fund-type">${movement.type}</div>
                </div>
                <div class="fund-date">${this.formatDate(movement.date)}</div>
                ${movement.comments ? `<div class="fund-comments">${movement.comments}</div>` : ''}
            `;
            
            fundsList.appendChild(fundDiv);
        });
    }

    updateDashboard() {
        const rulesToggle = document.getElementById('rules-toggle');
        const rulesOnly = rulesToggle ? rulesToggle.checked : false;
        const trades = rulesOnly ? this.data.trades.filter(t => t.allRulesFollowed) : this.data.trades;
        const closedTrades = trades.filter(t => t.status === 'Closed');
        
        // Calculate metrics
        const metrics = this.calculateMetrics(closedTrades);
        
        // Update metric cards
        const elements = {
            'total-trades': closedTrades.length,
            'net-pnl': `₹${metrics.netPnl.toLocaleString()}`,
            'win-rate': `${metrics.winRate.toFixed(1)}%`,
            'profit-factor': metrics.profitFactor.toFixed(2),
            'avg-winner': `₹${Math.round(metrics.avgWinner).toLocaleString()}`,
            'avg-loser': `₹${Math.round(Math.abs(metrics.avgLoser)).toLocaleString()}`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        // Apply color classes
        this.applyMetricColors();
        
        // Update charts
        this.updateCharts(closedTrades);
    }

    calculateMetrics(trades) {
        const winners = trades.filter(t => t.netPnl > 0);
        const losers = trades.filter(t => t.netPnl < 0);
        
        const netPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);
        const totalWinnings = winners.reduce((sum, t) => sum + t.netPnl, 0);
        const totalLosses = Math.abs(losers.reduce((sum, t) => sum + t.netPnl, 0));
        
        return {
            netPnl,
            winRate: trades.length > 0 ? (winners.length / trades.length) * 100 : 0,
            profitFactor: totalLosses > 0 ? totalWinnings / totalLosses : totalWinnings > 0 ? Infinity : 0,
            avgWinner: winners.length > 0 ? totalWinnings / winners.length : 0,
            avgLoser: losers.length > 0 ? totalLosses / losers.length : 0
        };
    }

    applyMetricColors() {
        const netPnlEl = document.getElementById('net-pnl');
        if (netPnlEl) {
            const netPnl = parseFloat(netPnlEl.textContent.replace(/[₹,]/g, ''));
            netPnlEl.className = `metric-value ${netPnl >= 0 ? 'positive' : 'negative'}`;
        }
    }

    updateCharts(trades) {
        this.renderEquityCurve(trades);
        this.renderMonthlyPnL(trades);
    }

    renderEquityCurve(trades) {
        const canvas = document.getElementById('equity-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.equity) {
            this.charts.equity.destroy();
        }
        
        // Calculate equity curve data
        const sortedTrades = [...trades].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
        const equityData = [];
        let cumulativePnl = 0;
        
        if (sortedTrades.length > 0) {
            equityData.push({ x: sortedTrades[0].createdDate, y: 0 });
            
            sortedTrades.forEach(trade => {
                cumulativePnl += trade.netPnl;
                equityData.push({ x: trade.createdDate, y: cumulativePnl });
            });
        } else {
            // Default data if no trades
            const today = new Date().toISOString().split('T')[0];
            equityData.push({ x: today, y: 0 });
        }
        
        this.charts.equity = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Equity Curve',
                    data: equityData,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderMonthlyPnL(trades) {
        const canvas = document.getElementById('monthly-pnl-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.monthlyPnl) {
            this.charts.monthlyPnl.destroy();
        }
        
        // Group trades by month
        const monthlyData = {};
        trades.forEach(trade => {
            const month = trade.createdDate.substring(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + trade.netPnl;
        });
        
        const labels = Object.keys(monthlyData).sort();
        const data = labels.map(label => monthlyData[label]);
        
        // If no data, show empty chart
        if (labels.length === 0) {
            labels.push(new Date().toISOString().substring(0, 7));
            data.push(0);
        }
        
        this.charts.monthlyPnl = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(label => {
                    const date = new Date(label + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: 'Monthly P&L',
                    data: data,
                    backgroundColor: data.map(value => value >= 0 ? '#1FB8CD' : '#B4413C'),
                    borderRadius: 4
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
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateMonteCarloData() {
        // This would typically run when the section is shown
        // For now, just placeholder
    }

    runMonteCarloSimulation() {
        const mcRulesToggle = document.getElementById('mc-rules-toggle');
        const rulesOnly = mcRulesToggle ? mcRulesToggle.checked : false;
        const trades = rulesOnly ? this.data.trades.filter(t => t.allRulesFollowed) : this.data.trades;
        const closedTrades = trades.filter(t => t.status === 'Closed');
        
        if (closedTrades.length < 5) {
            this.showMessage('Need at least 5 closed trades for Monte Carlo simulation', 'error');
            return;
        }
        
        // Simple Monte Carlo simulation
        const returns = closedTrades.map(t => t.rMultiple);
        const simulations = 1000;
        const periods = 100;
        const results = [];
        
        for (let i = 0; i < simulations; i++) {
            let equity = 1; // Starting with 1 unit
            for (let j = 0; j < periods; j++) {
                const randomReturn = returns[Math.floor(Math.random() * returns.length)];
                equity += randomReturn * 0.01; // Assuming 1% risk per trade
            }
            results.push(equity);
        }
        
        this.renderMonteCarloChart(results);
        this.showMessage('Monte Carlo simulation completed!', 'success');
    }

    renderMonteCarloChart(results) {
        const canvas = document.getElementById('monte-carlo-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.monteCarlo) {
            this.charts.monteCarlo.destroy();
        }
        
        // Create histogram data
        const bins = 20;
        const min = Math.min(...results);
        const max = Math.max(...results);
        const binSize = (max - min) / bins;
        
        const histogram = new Array(bins).fill(0);
        const labels = [];
        
        results.forEach(result => {
            const binIndex = Math.min(Math.floor((result - min) / binSize), bins - 1);
            histogram[binIndex]++;
        });
        
        for (let i = 0; i < bins; i++) {
            labels.push((min + i * binSize).toFixed(2));
        }
        
        this.charts.monteCarlo = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frequency',
                    data: histogram,
                    backgroundColor: '#FFC185',
                    borderColor: '#DB4545',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Final Equity Multiplier'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frequency'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderSettings() {
        this.renderManageableItems('setups', this.data.settings.defaultSetups);
        this.renderManageableItems('tags', this.data.settings.defaultTags);
    }

    renderManageableItems(type, items) {
        const container = document.getElementById(`${type}-list`);
        if (!container) return;
        
        container.innerHTML = '';
        
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-tag';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeItem(type, item);
            });
            
            itemDiv.textContent = item;
            itemDiv.appendChild(removeBtn);
            container.appendChild(itemDiv);
        });
    }

    addSetup() {
        const setup = prompt('Enter new setup name:');
        if (setup && setup.trim() && !this.data.settings.defaultSetups.includes(setup.trim())) {
            this.data.settings.defaultSetups.push(setup.trim());
            this.saveData();
            this.renderSettings();
            this.populateTradeForm();
            this.showMessage('Setup added successfully!', 'success');
        }
    }

    addTag() {
        const tag = prompt('Enter new tag name:');
        if (tag && tag.trim() && !this.data.settings.defaultTags.includes(tag.trim())) {
            this.data.settings.defaultTags.push(tag.trim());
            this.saveData();
            this.renderSettings();
            this.populateTradeForm();
            this.showMessage('Tag added successfully!', 'success');
        }
    }

    removeItem(type, item) {
        if (confirm(`Remove "${item}"?`)) {
            const arrayName = type === 'setups' ? 'defaultSetups' : 'defaultTags';
            const index = this.data.settings[arrayName].indexOf(item);
            if (index > -1) {
                this.data.settings[arrayName].splice(index, 1);
                this.saveData();
                this.renderSettings();
                this.populateTradeForm();
                this.showMessage(`${type.slice(0, -1)} removed successfully!`, 'success');
            }
        }
    }

    toggleTheme(isDark) {
        this.data.settings.theme = isDark ? 'dark' : 'light';
        document.body.setAttribute('data-color-scheme', this.data.settings.theme);
        this.saveData();
    }

    exportData() {
        try {
            // Create CSV data for trades
            const tradesCSV = this.createTradesCSV();
            const fundsCSV = this.createFundsCSV();
            
            // Create and download files
            this.downloadCSV(tradesCSV, 'trades.csv');
            
            // Small delay before second download
            setTimeout(() => {
                this.downloadCSV(fundsCSV, 'fund_movements.csv');
            }, 100);
            
            this.showMessage('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Export failed. Please try again.', 'error');
        }
    }

    createTradesCSV() {
        const headers = ['Symbol', 'Setup', 'Initial Risk', 'Rules Followed', 'Tags', 'Situation', 'Status', 'Net P/L', 'R Multiple', 'Created Date'];
        const rows = [headers];
        
        this.data.trades.forEach(trade => {
            rows.push([
                trade.symbol,
                trade.setup,
                trade.initialRisk,
                trade.allRulesFollowed ? 'Yes' : 'No',
                trade.tags.join('; '),
                trade.situation,
                trade.status,
                trade.netPnl,
                trade.rMultiple,
                trade.createdDate
            ]);
        });
        
        return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    createFundsCSV() {
        const headers = ['Date', 'Amount', 'Type', 'Comments'];
        const rows = [headers];
        
        this.data.fundMovements.forEach(movement => {
            rows.push([
                movement.date,
                movement.amount,
                movement.type,
                movement.comments || ''
            ]);
        });
        
        return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    filterTrades() {
        // This would implement trade filtering
        // For now, just re-render all trades
        this.renderTrades();
    }

    showMessage(message, type) {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Insert at top of current section
        const currentSectionEl = document.querySelector('.section.active');
        if (currentSectionEl) {
            currentSectionEl.insertBefore(messageDiv, currentSectionEl.firstChild);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 3000);
        }
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TradingJournal();
});