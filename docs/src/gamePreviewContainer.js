/**
 * Preview container that shows the upcoming N letters
 */
export class PreviewContainer {
  constructor(tiles, previewCount = 4) {
    this.tiles = tiles; // row of tile elements
    this.previewCount = previewCount;
    this.previewTiles = tiles.slice(-this.previewCount);
    this.initialize();
    this.observer = null;
  }

  initialize() {
    // Create preview tiles from right to left
    for (let i = 0; i < this.previewCount; i++) {
      this.tiles[6 - i].className = 'tile preview active';
      }
    }

  updatePreview (newLetter) {
    // Shift existing preview tiles down
    for (let i = this.previewCount - 1; i > 0; i--) {
      this.previewTiles[i].textContent = this.previewTiles[i - 1].textContent;
    }
    this.previewTiles[0].textContent = newLetter;
  }
}