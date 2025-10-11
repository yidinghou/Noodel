import { createGameBoard, GameBoard } from './gameBoard.js';
import {SpawnRow } from './gameSpawnRow.js';
import { TileGenerator } from './tileGenerator.js';
import { WordValidator } from './wordValidator.js';
import { PreviewContainer } from './gamePreviewContainer.js';

function populateGameBoardTiles() {
  const gameBoardContainer = document.getElementsByClassName('game-board-container')[0];
  gameBoardContainer.innerHTML = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 7; col++) {
      const tile = document.createElement('div');
      tile.className = 'tile board';
      tile.dataset.row = row;
      tile.dataset.col = col;
      tile.style.aspectRatio = '1 / 1';
      if (row === 0) {
        tile.className = 'tile preview inactive';
      }

      if (row === 1) {
        tile.className = 'tile spawn inactive';
      }
      gameBoardContainer.appendChild(tile);
    }
  }
}

export class Game {
  constructor(boardId, rows, cols) {
    this.boardId = boardId; // ID of the game board container
    // this.rows = rows;
    // this.cols = cols;
    // this.gameBoard = null;
    // this.gameBoardElement = null;
    this.tileGenerator = new TileGenerator();
      
    // this.tileGenerator.tiles = ['1', '2', '3', '4', '5', '6', '7', '8', '9']; 
    this.tileGenerator.tiles = ['R', 'O', 'E']; 

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
    populateGameBoardTiles();

    // createGameBoard();
    // this.gameBoard = new GameBoard(this.boardId, this.rows, this.cols);
    // this.gameBoardElement = document.getElementById(this.boardId);

    // // Initialize preview container
    // this.previewContainer = new PreviewContainer('preview-row', 4);
    
    // // Initialize spawn row
    // this.spawnRow = new SpawnRow('spawn-row', 7);
    // this.spawnRow.clearAllSpawnTiles();


    // // Initialize the word validator dictionary
    // await this.wordValidator.init();

  }

  resetGame() {
    // Reset game state
    this.isReady = false;
    this.enableInput(); // Reset input state

    // Clear observers first to prevent automatic updates
    this.tileGenerator.clearObservers();
    this.tileGenerator.addObserver(this.previewContainer);
    this.previewContainer.addObserver(this.spawnRow);
    // Reset tile generator (this will generate new tiles but won't notify since observers are cleared)
    this.tileGenerator.reset();

    // Reset game board
    if (this.gameBoard) {
      this.gameBoard.resetBoard();
    }

    // Reset spawn row (after clearing observers so it stays clear)
    if (this.spawnRow) {
      this.spawnRow.clearAllSpawnTiles();
    }

    // Reset preview container
    if (this.previewContainer) {
      this.previewContainer.clearPreview();
    }

    // Hide preview and spawn row
    // document.getElementById('next-tiles-preview').classList.remove('visible');
    // document.getElementById('tile-spawn-row').classList.remove('visible');
    
    // Update button text back to "Start Game"
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.textContent = 'Start Game';
    }
    
    console.log('Game reset completed.');
  }

  startGame() { 
    // Reset all game components before starting new game
    this.resetGame();

    // Get the next 3 upcoming letters
    const upcomingLetters = this.tileGenerator.peekUpcoming(3);

    // Show preview and spawn row
    // document.getElementById('next-tiles-preview').classList.add('visible');
    // document.getElementById('tile-spawn-row').classList.add('visible');

    // Update the preview tiles with the upcoming letters
    this.previewContainer.initPreviewTiles(upcomingLetters);

    const previewTiles = this.previewContainer.previewTiles;
    previewTiles.forEach((tile, index) => {
      // Staggered animation delay for each tile
      tile.style.animationDelay = `${index * 0.1}s`;
      tile.classList.add('hop-in');
      setTimeout(() => {
        tile.classList.remove('hop-in');
        tile.style.animationDelay = ''; // Clear the delay after animation
      }, 600);
    });

    // Move spawnLetter assignment here, after hop-in animation
    setTimeout(() => {
      // Initialize spawn letter - this will trigger observer notifications
      this.spawnLetter = this.tileGenerator.getNextTile().toUpperCase();

      this.isReady = true;
      this.setupGameBoardInteraction();
      
      // Update button text to "Reset Game"
      const startBtn = document.getElementById('start-btn');
      if (startBtn) {
        startBtn.textContent = 'Reset Game';
      }
      
      console.log('Game initialized.');
    }, 600); // Delay matches animation duration
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
        document.getElementById('tile-spawn-row').style.display = 'grid';
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
    foundWords.forEach(word => {
      const definition = this.wordValidator.dictionary.getDefinition(word.letters.toLowerCase());
      addWordToList(word.letters.trim(), definition);
    });

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


// Example function to update the made words list
function addWordToList(word, definition) {
  const list = document.querySelector('.made-words-list');
  if (!list) return;

  // Create a new entry
  const entry = document.createElement('div');
  entry.className = 'made-word-entry';
  entry.innerHTML = `<strong>${word}</strong>: <span class="definition">${definition}</span>`;

  // Add to the top of the list
  list.prepend(entry);
}
