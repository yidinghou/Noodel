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
export class Game {
  constructor() {
    this.renderer = new Renderer();
    this.active_letter = null; // To store the currently active letter
  }

  async init() {
    populateGameBoardTiles();
    this.setupGameBoardInteraction();

    const previewTileRow = Array.from(document.querySelectorAll('.game-board-container .tile[data-row="0"]'));
    this.previewContainer = new PreviewContainer(previewTileRow);

    const spawnTileRow = Array.from(document.querySelectorAll('.game-board-container .tile[data-row="1"]'));
    this.spawnRow = new SpawnRow(spawnTileRow);
    this.spawnRow.observer = this.previewContainer;

    const gameBoardRows = Array.from(document.querySelectorAll('.game-board-container .tile[data-row="2"], .game-board-container .tile[data-row="3"], .game-board-container .tile[data-row="4"], .game-board-container .tile[data-row="5"], .game-board-container .tile[data-row="6"], .game-board-container .tile[data-row="7"]'));
    this.gameBoard = new GameBoard(gameBoardRows);

  }

  startButtonAction(){
    this.previewContainer.initialize();
    this.spawnRow.initialize();
  }
    
  async resetButtonAction(){
    this.previewContainer.reset();
    await sleep(200);
    this.startButtonAction();
  }
  
  setupGameBoardInteraction() {
    const gameBoardContainer = document.querySelector('.game-board-container');

    // Add click event to the game board container
    gameBoardContainer.addEventListener('click', (event) => {
      const tile = event.target.closest('.tile');
      if (!tile) return;

      const col = parseInt(tile.dataset.col, 10);
      if (!isNaN(col)) {
        this.handleBoardClick(col);
      }
    });

    // Add hover event listeners
    gameBoardContainer.addEventListener('mouseover', (event) => {
      const tile = event.target.closest('.tile');
      if (!tile) return;

      const col = parseInt(tile.dataset.col, 10);
      if (!isNaN(col)) {
        this.handleBoardHover(col);
      }
    });

    gameBoardContainer.addEventListener('mouseout', (event) => {
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
    this.handleBoardHover(col); // Update hover state on click

    // Cancel any ongoing animation if a new click occurs
    if (this.isAnimating) {
        this.renderer.cancelAnimation(); // Cancel the current animation
        this.isAnimating = false;
    }

    // Immediately update the spawn row
    const currentTile = this.spawnRow.getActiveSpawnTile();
    if (!currentTile || currentTile.textContent === '') {
        this.spawnRow.initialize(); // Ensure the spawn row is updated
        return;
    }

    const targetTile = this.gameBoard.getTileElement(5, col);
    if (!targetTile) return;

    // Set the animation lock
    this.isAnimating = true;

    // Animate the tile movement
    await this.renderer.animateTileMovement(currentTile, targetTile);

    // Clear the spawn tile after animation
    currentTile.textContent = '';
    this.isAnimating = false;

    // Check the spawn row status
    this.checkSpawnRowStatus();
}

  checkSpawnRowStatus() {
      // Check the state
      if (!this.spawnRow.isFull()) {
          console.log("Spawn Row is now full! Triggering spawn action.");
          this.spawnRow.initialize();
      }
  }


}