import { createGameBoard, GameBoard } from './gameBoard.js';
import { createSpawnRow, SpawnRow } from './gameSpawnRow.js';
import { TileGenerator } from './TileGenerator.js';
import { WordValidator } from './wordValidator.js';
import { PreviewContainer } from './gamePreviewContainer.js';

export class Game {
  constructor(boardId, rows, cols) {
    this.boardId = boardId; // ID of the game board container
    this.rows = rows;
    this.cols = cols;
    this.gameBoard = null;
    this.gameBoardElement = null;
    this.tileGenerator = new TileGenerator();
      
    // this.tileGenerator.tiles = ['1', '2', '3', '4', '5', '6', '7', '8', '9']; 

    this.wordValidator = new WordValidator(3);
    this.isReady = false;
    
    // Add input state management
    this.inputState = {
      enabled: true,
      disabledReason: null,
      queuedActions: []
    };
  }

  async init() {
    createGameBoard();
    this.gameBoard = new GameBoard(this.boardId, this.rows, this.cols);
    this.gameBoardElement = document.getElementById(this.boardId);

    // Initialize preview container
    this.previewContainer = new PreviewContainer('preview-container', 3);
    
    // Initialize spawn row
    createSpawnRow(7);
    const spawnRow = new SpawnRow('spawn-row', 7);
    this.spawnRow = spawnRow;
    
    // Connect preview container to tile generator
    this.tileGenerator.addObserver(this.previewContainer);
    this.tileGenerator.addObserver(this.spawnRow);

    const upcomingLetters = this.tileGenerator.peekUpcoming(3);
    this.previewContainer.initPreviewTiles(upcomingLetters);
    
    // Add a visual delay to see the observer pattern working
    console.log('Initializing first tile with observer pattern...');
    await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
    
    // Initialize spawn letter - this will trigger observer notifications
    this.spawnLetter = this.tileGenerator.getNextTile().toUpperCase();
    
    console.log('Observer pattern triggered - spawn row and preview should update');
    
    // Initialize the word validator asynchronously
    console.log('Loading dictionary...');
    await this.wordValidator.init();
    this.isReady = true;

    this.setupGameBoardInteraction();
    console.log('Game initialized.');
  }

  disableInput(reason = 'animation') {
    this.inputState.enabled = false;
    this.inputState.disabledReason = reason;
    console.log(`Input disabled: ${reason}`);
  }

  enableInput() {
    this.inputState.enabled = true;
    this.inputState.disabledReason = null;
    console.log('Input enabled');
  }

  isInputEnabled() {
    return this.inputState.enabled;
  }

  setupGameBoardInteraction() {
    if (this.gameBoardElement) {
      // Bind 'this' to ensure it refers to the Game instance in the handler
      this.gameBoardElement.addEventListener('click', (event) => {
        if (!this.isInputEnabled()) {
          console.log(`Click ignored: input disabled (${this.inputState.disabledReason})`);
          return;
        }
        this.handleBoardClick(event);
      });

      // Mouseover: show spawn row and move spawn letter to hovered column
      const tiles = this.gameBoardElement.querySelectorAll('.tile');
      
      // Show spawn row on mouse enter
      this.gameBoardElement.addEventListener('mouseenter', () => {
        document.getElementById('spawn-row').style.display = 'grid';
      });

      tiles.forEach((tile) => {
        tile.addEventListener('mouseover', (event) => {
          if (!this.isInputEnabled()) return;
          
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

    // Disable input during the entire animation sequence
    this.disableInput('dropping tile');

    try {
      // Step 1: Clear the spawn row tile
      this.spawnRow.clearAllSpawnTiles();
      
      // Step 2: Place tile at top of game board (row 0)
      this.gameBoard.setTileContent(0, col, newLetter);
      this.gameBoard.setTileClass(0, col, 'falling');
      
      // Step 3: Animate the tile falling from row 0 to endRow
      await this.gameBoard._animateDrop(col, 0, endRow, newLetter, 80);

      // Step 4: Check for words at the landing position
      await this.checkForWordsAndAnimate(endRow, col);

      // Step 5: Get the next letter with animation and update spawn row
      // Animate the preview tile first
      // The observer pattern handles updating spawn row and preview
      // Just trigger the next tile generation
      this.spawnLetter = this.tileGenerator.getNextTile().toUpperCase();


        
      console.log(`Dropped tile in column: ${col}, landed at row: ${endRow}`);
    } catch (error) {
      console.error('Error during tile drop sequence:', error);
    } finally {
      // Always re-enable input when done, even if there was an error
      this.enableInput();
    }
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
