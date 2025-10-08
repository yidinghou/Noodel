import { createGameBoard, GameBoard } from './gameBoard.js';
import { createSpawnRow, SpawnRow } from './gameSpawnRow.js';
import { TileGenerator } from './TileGenerator.js';
import { WordValidator } from './wordValidator.js';

export class Game {
  constructor(boardId, rows, cols) {
    this.boardId = boardId; // ID of the game board container
    this.rows = rows;
    this.cols = cols;
    this.gameBoard = null;
    this.gameBoardElement = null;
    this.tileGenerator = new TileGenerator();
    this.wordValidator = new WordValidator(3);
    this.isReady = false;
  }

  async init() {
    createGameBoard();
    this.gameBoard = new GameBoard(this.boardId, this.rows, this.cols);
    this.gameBoardElement = document.getElementById(this.boardId);

    createSpawnRow(7);
    const spawnRow = new SpawnRow('spawn-row', 7);
    this.spawnRow = spawnRow;
    this.tileGenerator.tiles = ['E', 'O', 'R']; // For testing, force specific letters
    this.spawnLetter = this.tileGenerator.getNextTile().toUpperCase();
    this.spawnRow.setSpawnTileContent(0, this.spawnLetter); // Initial position

    // Initialize the word validator asynchronously
    console.log('Loading dictionary...');
    await this.wordValidator.init();
    this.isReady = true;

    this.setupEventListeners();
    console.log('Game initialized.');
  }

  setupEventListeners() {
    if (this.gameBoardElement) {
      // Bind 'this' to ensure it refers to the Game instance in the handler
      this.gameBoardElement.addEventListener('click', this.handleBoardClick.bind(this));

      // Mouseover: move spawn letter to hovered column
      const tiles = this.gameBoardElement.querySelectorAll('.tile');
      tiles.forEach((tile) => {
        tile.addEventListener('mouseover', (event) => {
          const col = parseInt(tile.dataset.col, 10);
          this.spawnRow.clearAllSpawnTiles();
          this.spawnRow.setSpawnTileContent(col, this.spawnLetter);
          this.spawnRow.setSpawnTileClass(col, 'active');
        });
      });
    }
  }

  async handleBoardClick(event) {
    // Check if game is ready (dictionary loaded)
    if (!this.isReady || !this.wordValidator.isReady) {
      console.log('Game is still initializing, please wait...');
      return;
    }

    const tile = event.target.closest('.tile');
    if (tile) {
      const col = parseInt(tile.dataset.col, 10);
      const tilesInColumn = this.gameBoard.countTilesPerColumn(col);
      const endRow = this.rows - 1 - tilesInColumn;

      // Check if column is full
      if (endRow < 0) {
        console.log(`Column ${col} is full!`);
        return;
      }

      const newLetter = this.spawnLetter;
      
      // Step 1: Clear the spawn row tile
      this.spawnRow.clearAllSpawnTiles();
      
      // Step 2: Place tile at top of game board (row 0)
      this.gameBoard.setTileContent(0, col, newLetter);
      this.gameBoard.setTileClass(0, col, 'falling');
      
      // Step 3: Animate the tile falling from row 0 to endRow
      if (endRow > 0) {
        await this.gameBoard._animateDrop(col, 0, endRow, newLetter, 80);
      } else {
        // If endRow is 0, just finalize the tile
        this.gameBoard.setTileClass(0, col, 'locked');
      }

      // Step 4: Check for words at the landing position
      await this.checkForWordsAndAnimate(endRow, col);

      // Step 5: Get the next letter and update spawn row
      this.spawnLetter = this.tileGenerator.getNextTile().toUpperCase();
      this.spawnRow.setSpawnTileContent(col, this.spawnLetter);
      this.spawnRow.setSpawnTileClass(col, 'active');
      
      console.log(`Dropped tile in column: ${col}, landed at row: ${endRow}`);
    }
  }

  /**
   * Checks for valid words and animates their removal with gravity
   * @param {number} row - Row where tile was placed
   * @param {number} col - Column where tile was placed
   */
  async checkForWordsAndAnimate(row, col) {
    await this._checkAndAnimateWords([[row, col]]);
  }
  
  /**
   * Recursively checks for words at positions and applies chain reactions
   * @param {Array<Array<number>>} positions - Array of [row, col] positions to check
   * @private
   */
  async _checkAndAnimateWords(positions) {
    // Find words at all given positions
    const { foundWords, foundAnyWords } = this._findWordsAtPositions(positions);
    
    if (!foundAnyWords) return; // No words found, exit early
    
    // Process and animate words
    const affectedColumns = await this._animateWords(foundWords);
    
    // Check for chain reactions
    await this._handleChainReactions(affectedColumns);
  }
  
  /**
   * Find all words at the given positions
   * @param {Array<Array<number>>} positions - Array of [row, col] positions to check
   * @returns {Object} Object with foundWords array and foundAnyWords boolean
   * @private
   */
  _findWordsAtPositions(positions) {
    // Collect all unique positions to check
    const uniquePositions = [...new Set(positions.map(pos => JSON.stringify(pos)))]
      .map(posStr => JSON.parse(posStr));
    
    // Collect all found words from all positions
    let foundAnyWords = false;
    let foundWords = [];
    
    // Check all positions and collect all words
    for (const [row, col] of uniquePositions) {
      const wordsAtPosition = this.wordValidator.checkForWords(row, col, this.gameBoard);
      
      if (wordsAtPosition.length > 0) {
        foundAnyWords = true;
        foundWords = [...foundWords, ...wordsAtPosition];
        console.log(`Found ${wordsAtPosition.length} word(s) at [${row},${col}]:`, wordsAtPosition.map(w => w.letters));
      }
    }
    
    return { foundWords, foundAnyWords };
  }
  
  /**
   * Animate all found words simultaneously
   * @param {Array} foundWords - Array of word objects with positions
   * @returns {Set} Set of affected columns
   * @private
   */
  async _animateWords(foundWords) {
    if (foundWords.length === 0) return new Set();
    
    console.log(`Processing ${foundWords.length} total words`);
    
    // Collect all positions from all words for highlighting
    const allPositions = [];
    const affectedColumns = new Set();
    
    // Extract positions and track affected columns
    foundWords.forEach(wordObj => {
      wordObj.positions.forEach(pos => {
        allPositions.push(pos);
        affectedColumns.add(pos[1]); // Track column for gravity
      });
    });
    
    // Deduplicate positions so shared tiles only animate once
    const uniquePositions = [...new Set(allPositions.map(pos => JSON.stringify(pos)))]
      .map(posStr => JSON.parse(posStr));
    
    // Animate all found words simultaneously
    await this.gameBoard.animateWordFound(uniquePositions, 300, true);
    
    return affectedColumns;
  }
  
  /**
   * Handle chain reactions after tiles have fallen
   * @param {Set} affectedColumns - Set of columns affected by word removal
   * @private
   */
  async _handleChainReactions(affectedColumns) {
    if (affectedColumns.size === 0) return;
    
    console.log('Checking for chain reactions in columns:', [...affectedColumns]);
    
    // Build positions to check after tiles have fallen
    const positionsToCheck = [];
    
    // For each affected column, check every filled row position
    for (const col of affectedColumns) {
      const filledTiles = this.gameBoard.countTilesPerColumn(col);
      
      // Check all positions with tiles in the affected columns
      for (let r = this.rows - 1; r >= this.rows - filledTiles; r--) {
        positionsToCheck.push([r, col]);
      }
    }
    
    if (positionsToCheck.length > 0) {
      // Add minimal delay to make chain reactions visible
      await new Promise(res => setTimeout(res, 100));
      
      // Recursively check these positions for new words
      await this._checkAndAnimateWords(positionsToCheck);
    }
  }
}
