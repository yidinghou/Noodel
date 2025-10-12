import { Renderer } from "../src/renderer.js";

const renderer = new Renderer();

export class SpawnRow {
  constructor(tiles) {
    this.tiles = tiles; // row of tile element
    this.cols = tiles.length;
    this.observer = null; // will set Preview Container as observer
    this.active_tile = null; // To store the currently active tile
  }

  initialize() {
    this.clearAllSpawnTiles();
    if (!this.isFull()) {
      const preview  = this.observer
      const active_letter = preview.getNextLetter();
      this.setSpawnRowContent(active_letter);

      for (let tile of this.tiles) {tile.className='tile spawn inactive';}

      this.tiles[this.cols - 1].className = "tile spawn hover-active"; // Rightmost tile is hover-active

      this.observer.clearNextTile();
      this.observer.fillPreviewTiles();
    }
  }

  countActiveSpawnTiles() {
    return this.tiles.filter(tile => tile.textContent.trim() !== '').length;
  }

  isFull() {
    return this.countActiveSpawnTiles() === 1; // Only one active tile at a time
  }
  
  setSpawnRowContent(letters, className = 'inactive') {
    this.clearAllSpawnTiles();
    for (let col = 0; col < this.cols; col++) {
      if (letters) {
        this.setSpawnTileContent(col, letters.toUpperCase());
        this.setSpawnTileClass(col, className);
      }
    }
  }

  getSpawnTileElement(col) {
    return this.tiles[col];
  }

  setSpawnTileContent(col, content) { 
    const tile = this.getSpawnTileElement(col);
    if (tile) tile.textContent = content;
  }

  clearAllSpawnTiles() {
    for (let col = 0; col < this.cols; col++) {
      const tile = this.getSpawnTileElement(col);
      tile.className = 'tile inactive'; // Explicitly set the class
    }
  }

  /**
   * Updates the spawn tile in the spawn row with the given letter.
   * @param {string} letter - The letter to display in the spawn tile.
   */
  updateSpawnTile(active_letter, className = 'active') {
    // Clear all spawn tiles first
    this.clearAllSpawnTiles();

    // Set the letter in the rightmost column (column 6 for a 7-column board)
    const rightmostCol = 6;
    this.setSpawnTileContent(rightmostCol, active_letter.toUpperCase());
    this.setSpawnTileClass(rightmostCol, className);

    // Use the Renderer to animate the tile
  }
}
