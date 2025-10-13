function populateGameBoardTiles() {
  const gameBoardContainer = document.getElementsByClassName('game-board-container')[0];
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

import { PreviewContainer} from "./gamePreviewContainer.js";
import {SpawnRow} from "./gameSpawnRow.js";
import {GameBoard} from "./gameBoard.js";
import { Renderer } from "../src/renderer.js";
import { WordValidator } from "./wordValidator.js"; // Import WordValidator
export class Game {
  constructor() {
    this.renderer = new Renderer();
    this.active_letter = null; // To store the currently active letter
    this.isAnimating = false; // Lock for animations
    this.dropQueue = []; // Queue to handle multiple tile drops
    this.wordValidator = new WordValidator(); // Initialize WordValidator
    this.isGameStarted = false; // Flag to track if the game has started
    this.madeWords = []; // Internal list to keep track of made words
    this.isSoundMuted = false; // Track if sound is muted

    // Add event listener for the sound toggle button
    const soundToggleButton = document.getElementById('sound-toggle');
    if (soundToggleButton) {
        soundToggleButton.addEventListener('click', () => this.toggleSound());
    }
  }

  async init() {
    populateGameBoardTiles();
    this.setupGameBoardInteraction();

    const previewTileRow = Array.from(document.querySelectorAll('.game-board-container .tile[data-row="0"]'));
    this.previewContainer = new PreviewContainer(previewTileRow, 3, this.renderer); // Pass the Renderer instance

    const spawnTileRow = Array.from(document.querySelectorAll('.game-board-container .tile[data-row="1"]'));
    this.spawnRow = new SpawnRow(spawnTileRow, this.renderer);
    this.spawnRow.observer = this.previewContainer;

    const gameBoardRows = Array.from(document.querySelectorAll('.game-board-container .tile[data-row="2"], .game-board-container .tile[data-row="3"], .game-board-container .tile[data-row="4"], .game-board-container .tile[data-row="5"], .game-board-container .tile[data-row="6"], .game-board-container .tile[data-row="7"]'));
    this.gameBoard = new GameBoard(gameBoardRows);
  
    await this.wordValidator.init();

  }

  startButtonAction(){
    this.previewContainer.initialize();
    this.spawnRow.initialize();
    this.isGameStarted = true; // Enable hover listeners when the game starts

    // Set the letters remaining counter to the length of the preview tiles
    const lettersRemainingCounter = document.getElementById('letters-remaining-counter');
    if (lettersRemainingCounter) {
        const previewTilesLength = this.previewContainer.tileGenerator.tileCount;
        lettersRemainingCounter.textContent = previewTilesLength;
    }
}
    
  async resetButtonAction(){
    this.previewContainer.reset();
    this.gameBoard.resetBoard();
    await sleep(200);
    this.isGameStarted = false; // Disable hover listeners during reset
    this.clearMadeWords();
    this.startButtonAction();
  }
  
  setupGameBoardInteraction() {
    const gameBoardContainer = document.querySelector('.game-board-container');

    // Add click event to the game board container
    gameBoardContainer.addEventListener('click', (event) => {
      if (!this.isGameStarted) return; // Ignore clicks if the game hasn't started

      const tile = event.target.closest('.tile');
      if (!tile) return;

      const col = parseInt(tile.dataset.col, 10);
      if (!isNaN(col)) {
        this.handleBoardClick(col);
      }
    });

    // Add hover event listeners
    gameBoardContainer.addEventListener('mouseover', (event) => {
      if (!this.isGameStarted) return; // Ignore hover if the game hasn't started

      const tile = event.target.closest('.tile');
      if (!tile) return;

      const col = parseInt(tile.dataset.col, 10);
      if (!isNaN(col)) {
        this.handleBoardHover(col);
      }
    });

    gameBoardContainer.addEventListener('mouseout', (event) => {
      if (!this.isGameStarted) return; // Ignore hover if the game hasn't started

      const tile = event.target.closest('.tile');
      if (!tile) return;

      const col = parseInt(tile.dataset.col, 10);
      if (!isNaN(col)) {
        this.clampHoverToBoard(col);
      }
    });
  }

  handleBoardHover(col) {
    // Activate the corresponding spawn tile and make text visible
    const spawnTile = this.spawnRow.getSpawnTileElement(col);
    if (spawnTile) {
      this.spawnRow.clearAllSpawnTiles(); // Clear other hover effects
      spawnTile.classList.add("active"); // Add the hover-active class
      spawnTile.classList.add("hover"); // Ensure the spawn class is preserved
    }
  }

  clampHoverToBoard(col) {
    // Clamp hover to the leftmost or rightmost column
    const clampedCol = col < 3 ? 0 : 6; // Assuming 7 columns (0-6)
    const spawnTile = this.spawnRow.getSpawnTileElement(clampedCol);
    if (spawnTile) {
      this.spawnRow.clearAllSpawnTiles(); // Clear other hover effects
      spawnTile.classList.add("active"); // Add the hover-active class
      spawnTile.classList.add("hover"); // Ensure the spawn class is preserved
    }
  }

  async handleBoardClick(col) {
    if (!this.isSoundMuted) {
      const dropSound = new Audio('./src/sounds/tile-drop.mp3');
      dropSound.play();
    }

    // Add the column to the drop queue
    this.dropQueue.push(col);

    // If an animation is already in progress, skip to the next animation
    if (this.isAnimating) {
        return;
    }

    // Decrease the letters remaining counter
    const lettersRemainingCounter = document.getElementById('letters-remaining-counter');
    const currentCount = parseInt(lettersRemainingCounter.textContent, 10);
    if (!isNaN(currentCount) && currentCount > 0) {
        lettersRemainingCounter.textContent = currentCount - 1;
    }

    // Process the queue
    while (this.dropQueue.length > 0) {
        const nextCol = this.dropQueue.shift(); // Get the next column from the queue
        await this.processTileDrop(nextCol); // Wait for the current drop to complete
    }
}

  async processTileDrop(col) {
    this.isAnimating = true; // Lock the animation

    this.handleBoardHover(col); // Update hover state on click

    // Immediately update the spawn row
    const currentTile = this.spawnRow.getActiveSpawnTile();
    if (!currentTile) {
        console.log("No active tile in the spawn row.");
        this.isAnimating = false;
        return; // No active tile to drop
    }
    
    const startingRow = parseInt(currentTile.dataset.row, 10); // Get the starting row index
    const targetPos = this.gameBoard.getLowestEmptyRow(col);
    if (targetPos === -1) {
        console.log("Column is full. Cannot place tile.");
        this.isAnimating = false;
        return; // Column is full, do nothing
    }

    const targetTile = this.gameBoard.getTileElement(targetPos, col);
    if (!targetTile) {
        this.isAnimating = false;
        return;
    }

    // Set the content of the target tile
    targetTile.textContent = currentTile.textContent; // TODO: add hidden State
    targetTile.classList.add('hidden');

    // Skip animation if there are more clicks in the queue
    if (this.dropQueue.length > 0) {
        console.log("Skipping animation due to multiple clicks.");
    } else {
        // Animate the tile movement
        const rowsDropped = targetPos - startingRow; // Calculate rows dropped
        await this.renderer.animateTileMovement(currentTile, targetTile, rowsDropped);
    }

    // Clear the spawn tile after animation
    this.spawnRow.clearAllSpawnTiles();
    this.isAnimating = false;

    // Check for words and animate their removal
    await this.checkForWordsAndAnimate(targetPos, col);

    // Check the spawn row status
    this.checkSpawnRowStatus();
  }

  /**
   * Checks for valid words and animates their removal with gravity
   * @param {number} row - Row where tile was placed
   * @param {number} col - Column where tile was placed
   */
  async checkForWordsAndAnimate(row, col) {
    await this._resolveAndAnimateChains([[row, col]]);
  }

  async _resolveAndAnimateChains(startPositions) {
    const dedupePositions = (positions) =>
      [...new Set(positions.map(p => JSON.stringify(p)))].map(s => JSON.parse(s));

    let positionsToCheck = dedupePositions(startPositions);

    // Run this loop while there are still words being found
    while (positionsToCheck.length > 0) {
      // Part 1: Find words and collect their data
      const wordData = this._findAndProcessWords(positionsToCheck);
      if (!wordData) {
        console.log("No more words found. Exiting chain resolution.");
        break; // No more words found, exit loop
      }

      const { allPositions, affectedColumns } = wordData;
      const uniquePositions = dedupePositions(allPositions);

      // Animate removal and apply gravity
      await this.gameBoard.animateWordFound(uniquePositions, 600, true);

      // Part 2: Get all tiles in affected columns for the next check
      if (affectedColumns.size === 0) {
        console.log("No affected columns. Exiting chain resolution.");
        break;
      }

      positionsToCheck = this._getNextPositionsToCheck(affectedColumns, dedupePositions);

      // Optional small delay for visual clarity between chains
      if (positionsToCheck.length > 0) {
        await sleep(100);
      }
    }
  }

  _findAndProcessWords(positionsToCheck) {
    const foundWords = this.wordValidator.findWordsAt(this.gameBoard, positionsToCheck);
    if (!foundWords || foundWords.length === 0) {
      return null;
    }

    console.log(`Processing ${foundWords.length} total words`);

    // Add found words to the made words list and update the DOM
    const madeWordsList = document.getElementById('made-words-list'); // Get the HTML element for the word list
    foundWords.forEach(word => {
      this.madeWords.push(word.letters); // Add to the internal list
      this._addWordToDOM(word, madeWordsList); // Refactored into a separate function
    });

    const allPositions = foundWords.flatMap(word => word.positions);
    const affectedColumns = new Set(allPositions.map(pos => pos[1]));

    return { allPositions, affectedColumns };
  }

  _addWordToDOM(word, madeWordsList) {
    // Create a new DOM element for the word and definition
    const wordElement = document.createElement('div');
    wordElement.className = 'made-word';

    // Format the word and definition
    const definition = this.wordValidator.dictionary.getDefinition(word.letters.toLowerCase());
    wordElement.innerHTML = `<strong>${word.letters}</strong>: ${definition || 'No definition available'}`;

    madeWordsList.prepend(wordElement); // Prepend the word element to the list
    this.playMadeWordSound(word.letters.length); // Play sound based on word length
  }

  toggleSound() {
    this.isSoundMuted = !this.isSoundMuted; // Toggle the sound state

    // Update the button text
    const soundToggleButton = document.getElementById('sound-toggle');
    if (soundToggleButton) {
        soundToggleButton.textContent = this.isSoundMuted ? 'Unmute' : 'Mute';
    }

    console.log(`Sound is now ${this.isSoundMuted ? 'muted' : 'unmuted'}.`);
}

  playMadeWordSound(word_length) {
    if (this.isSoundMuted) {
        console.log('Sound is muted. No sound will be played.');
        return; // Prevent any sound from playing if muted
    }

    const madeWordSound1 = new Audio('./src/sounds/word-made-1.mp3');
    const madeWordSound2 = new Audio('./src/sounds/word-made-2.mp3');
    const madeWordSound3 = new Audio('./src/sounds/word-made-3.mp3');
    const madeWordSpecial = new Audio('./src/sounds/word-made-special.mp3');

    const sounds = [
        { sound: madeWordSpecial, weight: word_length >= 4 ? 0.6 : 0.1 },
        { sound: madeWordSound1, weight: 0.1 },
        { sound: madeWordSound2, weight: 0.1 },
        { sound: madeWordSound3, weight: 0.1 }
    ];

    const totalWeight = sounds.reduce((sum, { weight }) => sum + weight, 0);
    const normalizedSounds = sounds.map(({ sound, weight }) => ({
        sound,
        weight: weight / totalWeight
    }));

    const random = Math.random();
    let cumulativeWeight = 0;

    for (const { sound, weight } of normalizedSounds) {
        cumulativeWeight += weight;
        if (random < cumulativeWeight) {
            sound.play();
            break;
        }
    }
}

  _getNextPositionsToCheck(affectedColumns, dedupeFunc) {
    const nextPositions = [...affectedColumns].flatMap(col => {
      const filled = this.gameBoard.countTilesPerColumn(col);
      if (!filled) {
        console.log(`Column ${col} is empty.`);
        return [];
      }
      // Create an array of row indices for the filled tiles in the column
      return Array.from({ length: filled }, (_, i) => [this.gameBoard.rows - 1 - i, col]);
    });
    return dedupeFunc(nextPositions);
  }

  checkSpawnRowStatus() {
      // Check the state
      if (!this.spawnRow.isFull()) {
          console.log("Spawn Row is now full! Triggering spawn action.");
          this.spawnRow.initialize();
      }
  }

  clearMadeWords() {
    this.madeWords = []; // Clear the internal list of made words

    const madeWordsList = document.getElementById('made-words-list');
    if (madeWordsList) {
        madeWordsList.innerHTML = ''; // Clear the DOM element displaying the made words
    }

    console.log("Made words list cleared.");
}

}