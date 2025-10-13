import { Renderer } from "../src/renderer.js";
import { TileGenerator } from "./tileGenerator.js";

const renderer = new Renderer();

/**
 * Preview container that shows the upcoming N letters
 */
export class PreviewContainer {
  constructor(tiles, previewCount = 3) {
    this.tiles = tiles; // row of tile elements
    this.tileGenerator = new TileGenerator();

    this.tileGenerator.tiles = ['1','2','3','4','5','6','7','8','9'];
    this.active_letter = null; // To store the currently active letter
      
    this.previewCount = previewCount;
    this.previewTiles = tiles.slice(-this.previewCount);
    this.observer = null; // will set Spawn Row as observer
  }

  countActivePreviewTiles() {
    return this.previewTiles.filter(tile => tile.classList.contains('active')).length;
  } 
  isFull(){
    return this.countActivePreviewTiles() === this.previewCount;
  }

  fillPreviewTiles() {
    while (!this.isFull()) {
      const newLetter = this.tileGenerator.getNextTile();
      this.updatePreview(newLetter);
    }
  }

  getNextLetter(){
    return this.previewTiles[this.previewCount - 1].textContent; // last tile in the preview
  }
  
  clearNextTile(){
    const lastTile = this.previewTiles[this.previewCount - 1];
    lastTile.textContent = '';
    this.updateTileState(lastTile);
  }

  initialize() {
      this.fillPreviewTiles();
    }
  
  reset(){
    this.previewTiles.forEach(tile => {
      tile.textContent = '';
      tile.classList.remove('active');
      tile.classList.add('inactive');
    });
  }

  updatePreview(newLetter) {
      // Shift tiles down the preview list (offset by 2)
      for (let i = this.previewCount - 1; i > 0; i--) {
          this.previewTiles[i].textContent = this.previewTiles[i - 1].textContent;
          this.updateTileState(this.previewTiles[i]);
      }
  
      // Update the first tile with the new letter
      this.previewTiles[0].textContent = newLetter;
      this.updateTileState(this.previewTiles[0]); // Ensure the first tile is updated}

  }
  /**
   * Updates the state of a tile based on its text content.
   * @param {HTMLElement} tile - The tile element to update.
   */
  updateTileState(tile) {
      if (tile.textContent !== '') {
          tile.classList.add('active');
          tile.classList.remove('inactive');
      } else {
          tile.classList.add('inactive');
          tile.classList.remove('active');
      }
  }

  async dropPreviewToSpawn() {
    const lastTile = this.previewTiles[this.previewCount - 1];
    await renderer.dropTileToSpawnRow(lastTile);
    lastTile.classList.remove('active');
    lastTile.classList.add('inactive');
  }

  updateSpawnRow() {
    const lastTile = this.previewTiles[this.previewCount - 1];
    if (lastTile.textContent !== '') {
      this.observer.setSpawnRowContent(lastTile);
    }
  }
}