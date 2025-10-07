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
    const foundWords = this.wordValidator.checkForWords(row, col, this.gameBoard);
    
    if (foundWords.length > 0) {
      console.log(`Found ${foundWords.length} word(s):`, foundWords.map(w => w.letters));
      
      // Animate each found word (includes gravity automatically)
      for (const wordObj of foundWords) {
        await this.gameBoard.animateWordFound(wordObj.positions, 600, true);
        
        // Add small delay between word animations for visual effect
        await new Promise(res => setTimeout(res, 200));
      }
    }
  }
}
