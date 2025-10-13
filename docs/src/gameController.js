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
    this.isAnimating = false; // Lock for animations
    this.dropQueue = []; // Queue to handle multiple tile drops
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
    this.gameBoard.resetBoard();
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
    // Add the column to the drop queue
    this.dropQueue.push(col);

    // If an animation is already in progress, skip to the next animation
    if (this.isAnimating) {
        return;
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

    // Skip animation if there are more clicks in the queue
    if (this.dropQueue.length > 0) {
        console.log("Skipping animation due to multiple clicks.");
    } else {
        // Animate the tile movement
        await this.renderer.animateTileMovement(currentTile, targetTile);
    }

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