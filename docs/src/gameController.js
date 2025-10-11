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

import { PreviewContainer} from "./gamePreviewContainer.js";
import {TileGenerator} from "./tileGenerator.js";
export class Game {
  constructor() {}

  async init() {
    populateGameBoardTiles();

    const previewTileRow = Array.from(document.querySelectorAll('.game-board-container .tile[data-row="0"]'));
    const previewContainer = new PreviewContainer(previewTileRow);
    this.previewContainer = previewContainer;

    const tileGenerator = new TileGenerator(previewContainer);
    this.tileGenerator = new TileGenerator();
    this.tileGenerator.tiles = ['R', 'O', 'E'];
    this.tileGenerator.addObserver(this.previewContainer);

    // Pre-fill the preview with initial tiles
    for (let i = 0; i < 4; i++) {
      this.tileGenerator.getNextTile();
    }

  }
  
    
}