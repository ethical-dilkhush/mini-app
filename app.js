/**
 * Sudoku Mini App - Main Application
 * Integrates with Farcaster SDK and handles all game interactions
 */

class SudokuApp {
    constructor() {
        this.engine = new SudokuEngine();
        this.currentGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.givenCells = Array(9).fill().map(() => Array(9).fill(false));
        this.selectedCell = null;
        this.selectedNumber = null;
        this.gameStartTime = null;
        this.gameTimer = null;
        this.mistakes = 0;
        this.maxMistakes = 3;
        this.score = 0;
        this.currentDifficulty = 'medium';
        this.gameComplete = false;
        this.hintsUsed = 0;
        this.maxHints = 3;
        
        // Farcaster SDK
        this.sdk = null;
        this.user = null;
        
        // UI Elements
        this.elements = {};
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initAfterDOM());
            } else {
                this.initAfterDOM();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.hideLoadingScreen();
        }
    }

    /**
     * Initialize after DOM is ready
     */
    async initAfterDOM() {
        try {
            // Check if running in Farcaster context
            this.checkFarcasterContext();
            
            // Cache DOM elements
            this.cacheElements();
            
            // Initialize Farcaster SDK
            await this.initFarcasterSDK();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize game grid
            this.initializeGrid();
            
            // Start new game
            this.startNewGame();
            
            // Hide loading screen and show app
            this.hideLoadingScreen();
            
        } catch (error) {
            console.error('Failed to initialize app after DOM:', error);
            this.hideLoadingScreen();
        }
    }

    /**
     * Check if running in Farcaster context
     */
    checkFarcasterContext() {
        const isInFarcaster = window.navigator.userAgent.includes('Farcaster') || 
                            window.navigator.userAgent.includes('Warpcast') ||
                            window.parent !== window || 
                            window.location !== window.parent.location ||
                            document.referrer.includes('farcaster') ||
                            document.referrer.includes('warpcast');
                            
        console.log('🔍 Farcaster Context Check:');
        console.log('- Running in Farcaster:', isInFarcaster);
        console.log('- User Agent:', window.navigator.userAgent);
        console.log('- Referrer:', document.referrer);
        console.log('- Parent window:', window.parent === window ? 'same' : 'different');
        
        if (isInFarcaster) {
            console.log('✅ App is running in Farcaster webview');
            // Add a subtle indicator that it's running in Farcaster
            setTimeout(() => {
                const header = document.querySelector('.header-content');
                if (header) {
                    const indicator = document.createElement('div');
                    indicator.style.cssText = `
                        position: absolute; 
                        top: 5px; 
                        right: 5px; 
                        background: #10b981; 
                        color: white; 
                        padding: 2px 6px; 
                        border-radius: 10px; 
                        font-size: 10px; 
                        opacity: 0.8;
                        z-index: 1000;
                    `;
                    indicator.textContent = '🌐 Farcaster';
                    header.style.position = 'relative';
                    header.appendChild(indicator);
                }
            }, 1000);
        } else {
            console.log('❌ App is NOT running in Farcaster webview');
        }
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            mainApp: document.getElementById('main-app'),
            sudokuGrid: document.getElementById('sudoku-grid'),
            difficulty: document.getElementById('difficulty'),
            newGameBtn: document.getElementById('new-game-btn'),
            hintBtn: document.getElementById('hint-btn'),
            checkBtn: document.getElementById('check-btn'),
            timer: document.getElementById('timer'),
            mistakes: document.getElementById('mistakes'),
            score: document.getElementById('score'),
            shareBtn: document.getElementById('share-btn'),
            leaderboardBtn: document.getElementById('leaderboard-btn'),
            completeModal: document.getElementById('complete-modal'),
            leaderboardModal: document.getElementById('leaderboard-modal'),
            userAvatar: document.getElementById('user-avatar'),
            userName: document.getElementById('user-name'),
            finalTime: document.getElementById('final-time'),
            finalScore: document.getElementById('final-score'),
            shareVictoryBtn: document.getElementById('share-victory-btn'),
            newGameModalBtn: document.getElementById('new-game-modal-btn'),
            closeModalBtn: document.getElementById('close-modal-btn'),
            closeLeaderboardBtn: document.getElementById('close-leaderboard-btn'),
            leaderboardContent: document.getElementById('leaderboard-content')
        };
    }

    /**
     * Initialize Farcaster SDK
     */
    async initFarcasterSDK() {
        try {
            // Import SDK from the CDN
            const { sdk } = await import('https://esm.sh/@farcaster/miniapp-sdk');
            this.sdk = sdk;
            
            // Get user context if available
            try {
                const context = await sdk.context;
                if (context && context.user) {
                    this.user = context.user;
                    this.updateUserInfo();
                }
            } catch (error) {
                console.log('No user context available:', error);
            }
            
            // Signal that the app is ready
            await sdk.actions.ready();
            
        } catch (error) {
            console.error('Failed to initialize Farcaster SDK:', error);
            // Continue without SDK functionality
        }
    }

    /**
     * Update user info in the UI
     */
    updateUserInfo() {
        if (this.user) {
            if (this.user.pfpUrl && this.elements.userAvatar) {
                this.elements.userAvatar.style.backgroundImage = `url(${this.user.pfpUrl})`;
                this.elements.userAvatar.classList.remove('hidden');
            }
            
            if (this.user.displayName && this.elements.userName) {
                this.elements.userName.textContent = this.user.displayName;
            } else if (this.user.username && this.elements.userName) {
                this.elements.userName.textContent = `@${this.user.username}`;
            }
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Game controls
        this.elements.newGameBtn?.addEventListener('click', () => this.startNewGame());
        this.elements.hintBtn?.addEventListener('click', () => this.showHint());
        this.elements.checkBtn?.addEventListener('click', () => this.checkSolution());
        this.elements.difficulty?.addEventListener('change', () => this.onDifficultyChange());
        
        // Number pad
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => this.onNumberClick(btn));
        });
        
        // Social features
        this.elements.shareBtn?.addEventListener('click', () => this.shareScore());
        this.elements.leaderboardBtn?.addEventListener('click', () => this.showLeaderboard());
        
        // Modal controls
        this.elements.shareVictoryBtn?.addEventListener('click', () => this.shareVictory());
        this.elements.newGameModalBtn?.addEventListener('click', () => {
            this.hideModal();
            this.startNewGame();
        });
        this.elements.closeModalBtn?.addEventListener('click', () => this.hideModal());
        this.elements.closeLeaderboardBtn?.addEventListener('click', () => this.hideLeaderboard());
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // Modal backdrop clicks
        this.elements.completeModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.completeModal) this.hideModal();
        });
        this.elements.leaderboardModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.leaderboardModal) this.hideLeaderboard();
        });
    }

    /**
     * Initialize the Sudoku grid UI
     */
    initializeGrid() {
        const grid = this.elements.sudokuGrid;
        if (!grid) return;
        
        // Clear existing cells
        grid.innerHTML = '';
        
        // Create 81 cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.onCellClick(row, col));
                grid.appendChild(cell);
            }
        }
    }

    /**
     * Start a new game
     */
    startNewGame() {
        try {
            // Reset game state
            this.gameComplete = false;
            this.mistakes = 0;
            this.score = 0;
            this.hintsUsed = 0;
            this.selectedCell = null;
            this.selectedNumber = null;
            
            // Get difficulty
            this.currentDifficulty = this.elements.difficulty?.value || 'medium';
            
            // Generate new puzzle
            const puzzle = this.engine.generatePuzzle(this.currentDifficulty);
            this.currentGrid = puzzle.grid.map(row => [...row]);
            this.givenCells = puzzle.given.map(row => [...row]);
            
            // Update UI
            this.updateGrid();
            this.updateStats();
            this.clearSelection();
            
            // Reset hint button
            if (this.elements.hintBtn) {
                this.elements.hintBtn.textContent = `Hint (${this.maxHints})`;
                this.elements.hintBtn.disabled = false;
            }
            
            // Start timer
            this.startTimer();
            
            // Trigger haptic feedback if available
            this.triggerHaptic('light');
            
        } catch (error) {
            console.error('Failed to start new game:', error);
        }
    }

    /**
     * Update the grid display
     */
    updateGrid() {
        const cells = document.querySelectorAll('.sudoku-cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.currentGrid[row][col];
            
            // Set cell content
            cell.textContent = value === 0 ? '' : value;
            
            // Reset classes
            cell.className = 'sudoku-cell';
            
            // Add appropriate classes
            if (this.givenCells[row][col]) {
                cell.classList.add('given');
            }
            
            if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                cell.classList.add('selected');
            }
        });
    }

    /**
     * Handle cell click
     */
    onCellClick(row, col) {
        if (this.gameComplete || this.givenCells[row][col]) return;
        
        this.selectedCell = { row, col };
        this.updateGrid();
        this.triggerHaptic('light');
        
        // If a number is selected, place it
        if (this.selectedNumber !== null) {
            this.placeNumber(row, col, this.selectedNumber);
        }
    }

    /**
     * Handle number button click
     */
    onNumberClick(btn) {
        const number = parseInt(btn.dataset.number);
        this.selectedNumber = number;
        
        // Update number button selection
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        // If a cell is selected, place the number
        if (this.selectedCell) {
            this.placeNumber(this.selectedCell.row, this.selectedCell.col, number);
        }
        
        this.triggerHaptic('light');
    }

    /**
     * Place number in cell
     */
    placeNumber(row, col, number) {
        if (this.gameComplete || this.givenCells[row][col]) return;
        
        const oldValue = this.currentGrid[row][col];
        
        // Handle erase (number 0)
        if (number === 0) {
            this.currentGrid[row][col] = 0;
            this.updateGrid();
            return;
        }
        
        // Check if move is valid
        const conflicts = this.engine.getConflicts(this.currentGrid, row, col, number);
        
        if (conflicts.length > 0) {
            // Invalid move - show error
            this.mistakes++;
            this.showError(row, col);
            this.triggerHaptic('error');
            
            if (this.mistakes >= this.maxMistakes) {
                this.endGame(false);
                return;
            }
        } else {
            // Valid move
            this.currentGrid[row][col] = number;
            this.showCorrect(row, col);
            this.triggerHaptic('success');
        }
        
        this.updateGrid();
        this.updateStats();
        
        // Check if puzzle is complete
        if (this.engine.isComplete(this.currentGrid)) {
            this.endGame(true);
        }
    }

    /**
     * Show error animation
     */
    showError(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('error');
            setTimeout(() => cell.classList.remove('error'), 1000);
        }
    }

    /**
     * Show correct animation
     */
    showCorrect(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('correct');
            setTimeout(() => cell.classList.remove('correct'), 1000);
        }
    }

    /**
     * Show hint
     */
    showHint() {
        if (this.hintsUsed >= this.maxHints || this.gameComplete) return;
        
        const hint = this.engine.getHint(this.currentGrid);
        if (!hint) return;
        
        this.hintsUsed++;
        this.currentGrid[hint.row][hint.col] = hint.num;
        
        // Show hint animation
        const cell = document.querySelector(`[data-row="${hint.row}"][data-col="${hint.col}"]`);
        if (cell) {
            cell.classList.add('hint');
            setTimeout(() => cell.classList.remove('hint'), 2000);
        }
        
        this.updateGrid();
        this.updateStats();
        this.triggerHaptic('success');
        
        // Update hint button
        if (this.elements.hintBtn) {
            this.elements.hintBtn.textContent = `Hint (${this.maxHints - this.hintsUsed})`;
            if (this.hintsUsed >= this.maxHints) {
                this.elements.hintBtn.disabled = true;
            }
        }
        
        // Check if puzzle is complete
        if (this.engine.isComplete(this.currentGrid)) {
            this.endGame(true);
        }
    }

    /**
     * Check solution
     */
    checkSolution() {
        const validation = this.engine.validateGrid(this.currentGrid);
        
        if (validation.valid) {
            this.triggerHaptic('success');
            // Show all cells as correct briefly
            document.querySelectorAll('.sudoku-cell').forEach(cell => {
                if (cell.textContent) {
                    cell.classList.add('correct');
                    setTimeout(() => cell.classList.remove('correct'), 1000);
                }
            });
        } else {
            this.triggerHaptic('error');
            // Show error cells
            validation.errors.forEach(([row, col]) => {
                this.showError(row, col);
            });
        }
    }

    /**
     * Handle difficulty change
     */
    onDifficultyChange() {
        // Start new game with new difficulty
        this.startNewGame();
    }

    /**
     * Handle keyboard input
     */
    onKeyDown(e) {
        if (this.gameComplete) return;
        
        const key = e.key;
        
        // Number keys
        if (key >= '1' && key <= '9') {
            const number = parseInt(key);
            const btn = document.querySelector(`[data-number="${number}"]`);
            if (btn) this.onNumberClick(btn);
        }
        
        // Delete/Backspace
        if (key === 'Delete' || key === 'Backspace') {
            const btn = document.querySelector(`[data-number="0"]`);
            if (btn) this.onNumberClick(btn);
        }
        
        // Arrow keys
        if (this.selectedCell) {
            let newRow = this.selectedCell.row;
            let newCol = this.selectedCell.col;
            
            switch (key) {
                case 'ArrowUp':
                    newRow = Math.max(0, newRow - 1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    newRow = Math.min(8, newRow + 1);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    newCol = Math.max(0, newCol - 1);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    newCol = Math.min(8, newCol + 1);
                    e.preventDefault();
                    break;
            }
            
            if (newRow !== this.selectedCell.row || newCol !== this.selectedCell.col) {
                this.onCellClick(newRow, newCol);
            }
        }
    }

    /**
     * Start game timer
     */
    startTimer() {
        this.gameStartTime = Date.now();
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (!this.gameComplete) {
                this.updateTimer();
            }
        }, 1000);
    }

    /**
     * Update timer display
     */
    updateTimer() {
        if (!this.gameStartTime || !this.elements.timer) return;
        
        const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        this.elements.timer.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Update game stats
     */
    updateStats() {
        if (this.elements.mistakes) {
            this.elements.mistakes.textContent = `${this.mistakes}/${this.maxMistakes}`;
        }
        
        if (this.elements.score) {
            const timeElapsed = this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
            this.score = this.engine.calculateScore(this.currentDifficulty, timeElapsed, this.mistakes);
            this.elements.score.textContent = this.score.toString();
        }
    }

    /**
     * End game
     */
    endGame(won) {
        this.gameComplete = true;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        if (won) {
            this.showVictory();
            this.triggerHaptic('success');
        } else {
            this.showGameOver();
            this.triggerHaptic('error');
        }
    }

    /**
     * Show victory modal
     */
    showVictory() {
        const timeElapsed = this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        if (this.elements.finalTime) {
            this.elements.finalTime.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = this.score.toString();
        }
        
        this.showModal();
        
        // Save high score
        this.saveHighScore();
    }

    /**
     * Show game over
     */
    showGameOver() {
        // Could show a different modal for game over
        alert('Game Over! Too many mistakes. Try again!');
    }

    /**
     * Show modal
     */
    showModal() {
        if (this.elements.completeModal) {
            this.elements.completeModal.classList.remove('hidden');
        }
    }

    /**
     * Hide modal
     */
    hideModal() {
        if (this.elements.completeModal) {
            this.elements.completeModal.classList.add('hidden');
        }
    }

    /**
     * Share score via Farcaster
     */
    async shareScore() {
        try {
            const text = `🧩 Just scored ${this.score} points in Sudoku! (${this.currentDifficulty} difficulty)\n\nPlay now: ${window.location.href}`;
            
            if (this.sdk && this.sdk.actions && this.sdk.actions.openUrl) {
                // Use Farcaster SDK to share
                const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
                await this.sdk.actions.openUrl(shareUrl);
            } else {
                // Fallback to Web Share API or clipboard
                if (navigator.share) {
                    await navigator.share({
                        title: 'Sudoku Score',
                        text: text,
                        url: window.location.href
                    });
                } else {
                    await navigator.clipboard.writeText(text);
                    alert('Score copied to clipboard!');
                }
            }
            
            this.triggerHaptic('success');
        } catch (error) {
            console.error('Failed to share score:', error);
        }
    }

    /**
     * Share victory via Farcaster
     */
    async shareVictory() {
        const timeElapsed = this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const text = `🎉 Solved a ${this.currentDifficulty} Sudoku puzzle!\n⏱️ Time: ${timeText}\n🏆 Score: ${this.score}\n\nTry it yourself: ${window.location.href}`;
        
        try {
            if (this.sdk && this.sdk.actions && this.sdk.actions.openUrl) {
                const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
                await this.sdk.actions.openUrl(shareUrl);
            } else {
                if (navigator.share) {
                    await navigator.share({
                        title: 'Sudoku Victory!',
                        text: text,
                        url: window.location.href
                    });
                } else {
                    await navigator.clipboard.writeText(text);
                    alert('Victory message copied to clipboard!');
                }
            }
            
            this.hideModal();
            this.triggerHaptic('success');
        } catch (error) {
            console.error('Failed to share victory:', error);
        }
    }

    /**
     * Show leaderboard
     */
    showLeaderboard() {
        this.elements.leaderboardModal?.classList.remove('hidden');
        this.loadLeaderboard();
    }

    /**
     * Hide leaderboard
     */
    hideLeaderboard() {
        this.elements.leaderboardModal?.classList.add('hidden');
    }

    /**
     * Load leaderboard data
     */
    loadLeaderboard() {
        const content = this.elements.leaderboardContent;
        if (!content) return;
        
        // Show loading
        content.innerHTML = '<div class="leaderboard-loading">Loading leaderboard...</div>';
        
        // Load from local storage for now
        setTimeout(() => {
            const scores = this.getHighScores();
            this.displayLeaderboard(scores);
        }, 1000);
    }

    /**
     * Display leaderboard
     */
    displayLeaderboard(scores) {
        const content = this.elements.leaderboardContent;
        if (!content) return;
        
        if (scores.length === 0) {
            content.innerHTML = '<div class="leaderboard-loading">No scores yet. Be the first!</div>';
            return;
        }
        
        const html = scores.map((score, index) => `
            <div class="leaderboard-item">
                <span class="leaderboard-rank">${index + 1}</span>
                <div class="leaderboard-user">
                    <div>${score.player}</div>
                    <div style="font-size: 12px; color: #6b7280;">${score.difficulty} • ${score.time}</div>
                </div>
                <span class="leaderboard-score">${score.score}</span>
            </div>
        `).join('');
        
        content.innerHTML = html;
    }

    /**
     * Save high score
     */
    saveHighScore() {
        const timeElapsed = this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const scoreData = {
            score: this.score,
            difficulty: this.currentDifficulty,
            time: timeText,
            timeSeconds: timeElapsed,
            mistakes: this.mistakes,
            hintsUsed: this.hintsUsed,
            player: this.user?.displayName || this.user?.username || 'Anonymous',
            date: new Date().toISOString()
        };
        
        const scores = this.getHighScores();
        scores.push(scoreData);
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Keep top 10
        
        localStorage.setItem('sudoku-high-scores', JSON.stringify(scores));
    }

    /**
     * Get high scores from storage
     */
    getHighScores() {
        try {
            const scores = localStorage.getItem('sudoku-high-scores');
            return scores ? JSON.parse(scores) : [];
        } catch (error) {
            console.error('Failed to load high scores:', error);
            return [];
        }
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedCell = null;
        this.selectedNumber = null;
        document.querySelectorAll('.number-btn').forEach(btn => btn.classList.remove('selected'));
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
        }
        if (this.elements.mainApp) {
            this.elements.mainApp.classList.remove('hidden');
        }
    }

    /**
     * Trigger haptic feedback
     */
    async triggerHaptic(type = 'light') {
        try {
            if (this.sdk && this.sdk.actions && this.sdk.actions.haptic) {
                await this.sdk.actions.haptic(type);
            } else if (navigator.vibrate) {
                // Fallback to web vibration API
                const patterns = {
                    light: [10],
                    success: [10, 50, 10],
                    error: [100, 50, 100]
                };
                navigator.vibrate(patterns[type] || patterns.light);
            }
        } catch (error) {
            // Haptic feedback is optional, fail silently
        }
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, could pause timer
    } else {
        // Page is visible again
    }
}); 