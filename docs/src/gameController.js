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
    const tile = event.target.closest('.tile');
    if (!tile) return; // Exit if the click was not on a tile

    const col = parseInt(tile.dataset.col, 10);
    const endRow = this.gameBoard.getEndRowForColumn(col);
    const newLetter = this.spawnLetter;

    if (endRow < 0) {
      console.log(`Column ${col} is full!`);
      return;
    }

    // Step 1: Clear the spawn row tile
    this.spawnRow.clearAllSpawnTiles();
    
    // Step 2: Place tile at top of game board (row 0)
    this.gameBoard.setTileContent(0, col, newLetter);
    this.gameBoard.setTileClass(0, col, 'falling');
    
    // Step 3: Animate the tile falling from row 0 to endRow
    await this.gameBoard._animateDrop(col, 0, endRow, newLetter, 80);

    // Step 4: Check for words at the landing position
    await this.checkForWordsAndAnimate(endRow, col);

    // Step 5: Get the next letter and update spawn row
    this.spawnLetter = this.tileGenerator.getNextTile().toUpperCase();
    this.spawnRow.setSpawnTileContent(col, this.spawnLetter);
    this.spawnRow.setSpawnTileClass(col, 'active');
    
    console.log(`Dropped tile in column: ${col}, landed at row: ${endRow}`);
  }

  /**
   * Checks for valid words and animates their removal with gravity
   * @param {number} row - Row where tile was placed
   * @param {number} col - Column where tile was placed
   */
  async checkForWordsAndAnimate(row, col) {
    await this._resolveAndAnimateChains([[row, col]]);
  }

  _findAndProcessWords(positionsToCheck) {
    const foundWords = this.wordValidator.findWordsAt(this.gameBoard, positionsToCheck);
    if (!foundWords || foundWords.length === 0) {
      return null;
    }

    console.log(`Processing ${foundWords.length} total words`);

    const allPositions = foundWords.flatMap(word => word.positions);
    const affectedColumns = new Set(allPositions.map(pos => pos[1]));

    return { allPositions, affectedColumns };
  }

  _getNextPositionsToCheck(affectedColumns, dedupeFunc) {
    const nextPositions = [...affectedColumns].flatMap(col => {
      const filled = this.gameBoard.countTilesPerColumn(col);
      // Create an array of row indices for the filled tiles in the column
      return Array.from({ length: filled }, (_, i) => [this.rows - 1 - i, col]);
    });
    return dedupeFunc(nextPositions);
  }
  
  // Simplified, iterative chain resolver using WordValidator.findWordsAt
  async _resolveAndAnimateChains(startPositions) {
    const dedupePositions = (positions) =>
      [...new Set(positions.map(p => JSON.stringify(p)))].map(s => JSON.parse(s));

    let positionsToCheck = dedupePositions(startPositions);
    
    // run this loop while there are still words being found
    while (positionsToCheck.length > 0) {
      // Part 1: Find words and collect their data
      const wordData = this._findAndProcessWords(positionsToCheck);
      if (!wordData) break; // No more words found, exit loop

      const { allPositions, affectedColumns } = wordData;
      const uniquePositions = dedupePositions(allPositions);

      // Animate removal and apply gravity
      await this.gameBoard.animateWordFound(uniquePositions, 600, true);

      // Part 2: Get all tiles in affected columns for the next check
      positionsToCheck = this._getNextPositionsToCheck(affectedColumns, dedupePositions);

      // Optional small delay for visual clarity between chains
      if (positionsToCheck.length > 0) {
        await new Promise(res => setTimeout(res, 100));
      }
    }
  }
}
