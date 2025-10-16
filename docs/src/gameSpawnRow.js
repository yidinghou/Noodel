export class SpawnRow {
  constructor(tiles, renderer) {
    this.tiles = tiles; // row of tile element
    this.cols = tiles.length;
    this.observer = null; // will set Preview Container as observer
    this.renderer = renderer;
  }

  initialize() {
    if (!this.isFull()) {
      const preview = this.observer;
      const active_letter = preview.getNextLetter();

      // Get the preview tile and spawn tile
      const previewTile = preview.previewTiles[preview.previewCount - 1];
      const spawnTile = this.getSpawnTileElement(this.cols - 1);

      // Drop the tile from the preview to the spawn row with animation
      this.renderer.animateFallToSpawnRow(previewTile, spawnTile);

      this.setSpawnRowContent(active_letter);

      // Get the last tile and add both 'active' and 'hover' classes
      const lastTile = this.tiles[this.tiles.length - 1];
      if (lastTile) {
        lastTile.classList.add('active');
        lastTile.classList.add('hover');
      }

      this.observer.clearNextTile();
      this.observer.fillPreviewTiles();
    }
  }

  getActiveSpawnTile() {
    return this.tiles.find((tile) => tile.classList.contains('active'));
  }

  countActiveSpawnTiles() {
    return this.tiles.filter((tile) => tile.textContent.trim() !== '').length;
  }

  isFull() {
    return this.countActiveSpawnTiles() === 1; // Only one active tile at a time
  }

  setSpawnRowContent(letters) {
    this.clearAllSpawnTiles();
    for (let col = 0; col < this.cols; col++) {
      if (letters) {
        this.setSpawnTileContent(col, letters.toUpperCase());
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
