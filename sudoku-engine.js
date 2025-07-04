/**
 * Sudoku Game Engine
 * Handles puzzle generation, validation, solving, and game logic
 */

class SudokuEngine {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.given = Array(9).fill().map(() => Array(9).fill(false));
        this.difficulty = 'medium';
        this.difficultySettings = {
            easy: { clues: 45, maxEmptyCells: 36 },
            medium: { clues: 35, maxEmptyCells: 46 },
            hard: { clues: 25, maxEmptyCells: 56 }
        };
    }

    /**
     * Generate a new Sudoku puzzle
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     */
    generatePuzzle(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.clearGrid();
        
        // Generate a complete solution
        this.generateSolution();
        
        // Create puzzle by removing numbers
        this.createPuzzle();
        
        return {
            grid: this.grid.map(row => [...row]),
            solution: this.solution.map(row => [...row]),
            given: this.given.map(row => [...row])
        };
    }

    /**
     * Clear the grid
     */
    clearGrid() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.given = Array(9).fill().map(() => Array(9).fill(false));
    }

    /**
     * Generate a complete valid Sudoku solution
     */
    generateSolution() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solvePuzzle(this.grid);
        this.solution = this.grid.map(row => [...row]);
    }

    /**
     * Create puzzle by removing numbers from solution
     */
    createPuzzle() {
        const { clues } = this.difficultySettings[this.difficulty];
        const totalCells = 81;
        const cellsToRemove = totalCells - clues;
        
        // Start with complete solution
        this.grid = this.solution.map(row => [...row]);
        
        // Mark all cells as given initially
        this.given = Array(9).fill().map(() => Array(9).fill(true));
        
        // Create list of all cell positions
        const positions = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                positions.push([row, col]);
            }
        }
        
        // Shuffle positions
        this.shuffleArray(positions);
        
        // Remove cells while ensuring unique solution
        let removed = 0;
        for (const [row, col] of positions) {
            if (removed >= cellsToRemove) break;
            
            const backup = this.grid[row][col];
            this.grid[row][col] = 0;
            this.given[row][col] = false;
            
            // Check if puzzle still has unique solution
            if (this.hasUniqueSolution()) {
                removed++;
            } else {
                // Restore cell if removing it creates multiple solutions
                this.grid[row][col] = backup;
                this.given[row][col] = true;
            }
        }
    }

    /**
     * Solve puzzle using backtracking algorithm
     * @param {number[][]} grid - The grid to solve
     * @returns {boolean} - True if solved, false if unsolvable
     */
    solvePuzzle(grid) {
        const empty = this.findEmptyCell(grid);
        if (!empty) return true; // Puzzle solved
        
        const [row, col] = empty;
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of numbers) {
            if (this.isValidMove(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (this.solvePuzzle(grid)) {
                    return true;
                }
                
                grid[row][col] = 0; // Backtrack
            }
        }
        
        return false;
    }

    /**
     * Check if puzzle has a unique solution
     * @returns {boolean}
     */
    hasUniqueSolution() {
        const testGrid = this.grid.map(row => [...row]);
        const solutions = [];
        this.findAllSolutions(testGrid, solutions, 2); // Find up to 2 solutions
        return solutions.length === 1;
    }

    /**
     * Find all solutions up to a limit
     * @param {number[][]} grid
     * @param {number[][][]} solutions
     * @param {number} limit
     */
    findAllSolutions(grid, solutions, limit) {
        if (solutions.length >= limit) return;
        
        const empty = this.findEmptyCell(grid);
        if (!empty) {
            solutions.push(grid.map(row => [...row]));
            return;
        }
        
        const [row, col] = empty;
        
        for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(grid, row, col, num)) {
                grid[row][col] = num;
                this.findAllSolutions(grid, solutions, limit);
                grid[row][col] = 0;
            }
        }
    }

    /**
     * Find empty cell in grid
     * @param {number[][]} grid
     * @returns {number[]|null} - [row, col] or null if no empty cell
     */
    findEmptyCell(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    /**
     * Check if move is valid
     * @param {number[][]} grid
     * @param {number} row
     * @param {number} col
     * @param {number} num
     * @returns {boolean}
     */
    isValidMove(grid, row, col, num) {
        // Check row
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (grid[i][j] === num) return false;
            }
        }
        
        return true;
    }

    /**
     * Validate current grid state
     * @param {number[][]} grid
     * @returns {Object} - { valid: boolean, errors: [row, col][] }
     */
    validateGrid(grid) {
        const errors = [];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = grid[row][col];
                if (num === 0) continue;
                
                // Temporarily remove number to check validity
                const temp = grid[row][col];
                grid[row][col] = 0;
                
                if (!this.isValidMove(grid, row, col, num)) {
                    errors.push([row, col]);
                }
                
                grid[row][col] = temp;
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Check if puzzle is complete
     * @param {number[][]} grid
     * @returns {boolean}
     */
    isComplete(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) return false;
            }
        }
        return this.validateGrid(grid).valid;
    }

    /**
     * Get hint for next move
     * @param {number[][]} grid
     * @returns {Object|null} - { row, col, num } or null
     */
    getHint(grid) {
        const emptyCells = [];
        
        // Find all empty cells
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    emptyCells.push([row, col]);
                }
            }
        }
        
        if (emptyCells.length === 0) return null;
        
        // Find cell with fewest possible values (most constrained)
        let bestCell = null;
        let minPossibilities = 10;
        
        for (const [row, col] of emptyCells) {
            const possibilities = this.getPossibleValues(grid, row, col);
            if (possibilities.length < minPossibilities && possibilities.length > 0) {
                minPossibilities = possibilities.length;
                bestCell = { row, col, possibilities };
            }
        }
        
        if (!bestCell || bestCell.possibilities.length === 0) return null;
        
        // Return the correct value from solution
        return {
            row: bestCell.row,
            col: bestCell.col,
            num: this.solution[bestCell.row][bestCell.col]
        };
    }

    /**
     * Get possible values for a cell
     * @param {number[][]} grid
     * @param {number} row
     * @param {number} col
     * @returns {number[]}
     */
    getPossibleValues(grid, row, col) {
        const possibilities = [];
        
        for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(grid, row, col, num)) {
                possibilities.push(num);
            }
        }
        
        return possibilities;
    }

    /**
     * Calculate score based on difficulty and time
     * @param {string} difficulty
     * @param {number} timeInSeconds
     * @param {number} mistakes
     * @returns {number}
     */
    calculateScore(difficulty, timeInSeconds, mistakes) {
        const baseScores = {
            easy: 100,
            medium: 200,
            hard: 300
        };
        
        const baseScore = baseScores[difficulty] || 200;
        const timeBonus = Math.max(0, 1800 - timeInSeconds); // Bonus for completing under 30 minutes
        const mistakePenalty = mistakes * 50;
        
        return Math.max(0, baseScore + timeBonus - mistakePenalty);
    }

    /**
     * Shuffle array in place (Fisher-Yates algorithm)
     * @param {Array} array
     * @returns {Array}
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Get cells in same row, column, or box as given cell
     * @param {number} row
     * @param {number} col
     * @returns {number[][]} - Array of [row, col] positions
     */
    getRelatedCells(row, col) {
        const related = new Set();
        
        // Add row cells
        for (let c = 0; c < 9; c++) {
            if (c !== col) related.add(`${row},${c}`);
        }
        
        // Add column cells
        for (let r = 0; r < 9; r++) {
            if (r !== row) related.add(`${r},${col}`);
        }
        
        // Add box cells
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row || c !== col) {
                    related.add(`${r},${c}`);
                }
            }
        }
        
        return Array.from(related).map(pos => pos.split(',').map(Number));
    }

    /**
     * Check if a number conflicts with existing numbers
     * @param {number[][]} grid
     * @param {number} row
     * @param {number} col
     * @param {number} num
     * @returns {number[][]} - Array of conflicting cell positions
     */
    getConflicts(grid, row, col, num) {
        const conflicts = [];
        
        // Check row conflicts
        for (let c = 0; c < 9; c++) {
            if (c !== col && grid[row][c] === num) {
                conflicts.push([row, c]);
            }
        }
        
        // Check column conflicts
        for (let r = 0; r < 9; r++) {
            if (r !== row && grid[r][col] === num) {
                conflicts.push([r, col]);
            }
        }
        
        // Check box conflicts
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && grid[r][c] === num) {
                    conflicts.push([r, c]);
                }
            }
        }
        
        return conflicts;
    }

    /**
     * Generate sample puzzles for different difficulties
     * @returns {Object} - Sample puzzles for each difficulty
     */
    static getSamplePuzzles() {
        return {
            easy: {
                grid: [
                    [5,3,0,0,7,0,0,0,0],
                    [6,0,0,1,9,5,0,0,0],
                    [0,9,8,0,0,0,0,6,0],
                    [8,0,0,0,6,0,0,0,3],
                    [4,0,0,8,0,3,0,0,1],
                    [7,0,0,0,2,0,0,0,6],
                    [0,6,0,0,0,0,2,8,0],
                    [0,0,0,4,1,9,0,0,5],
                    [0,0,0,0,8,0,0,7,9]
                ],
                solution: [
                    [5,3,4,6,7,8,9,1,2],
                    [6,7,2,1,9,5,3,4,8],
                    [1,9,8,3,4,2,5,6,7],
                    [8,5,9,7,6,1,4,2,3],
                    [4,2,6,8,5,3,7,9,1],
                    [7,1,3,9,2,4,8,5,6],
                    [9,6,1,5,3,7,2,8,4],
                    [2,8,7,4,1,9,6,3,5],
                    [3,4,5,2,8,6,1,7,9]
                ]
            }
        };
    }
}

// Export for use in main app
window.SudokuEngine = SudokuEngine; 