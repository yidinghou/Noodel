import { Renderer } from "../src/renderer.js";
import { TileGenerator } from "./tileGenerator.js";

const renderer = new Renderer();

/**
 * Preview container that shows the upcoming N letters
 */
export class PreviewContainer {
  constructor(tiles, previewCount = 3, renderer) {
    this.tiles = tiles; // row of tile elements
    this.tileGenerator = new TileGenerator();
    this.renderer = renderer; // Pass the Renderer instance

    if (!this.renderer) {
      console.error("Renderer instance is not defined. Ensure it is passed to PreviewContainer.");
    }

    this.tileGenerator.tiles = ["R", "O", "E"];
    this.active_letter = null; // To store the currently active letter
      
    this.previewCount = previewCount;
    this.previewTiles = tiles.slice(-this.previewCount-1);
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

    this.tileGenerator.reset();
  }

  // Method to animate preview tiles
  animatePreviewTiles(animationClass = "animate", delay = 80) {
    if (!this.renderer) {
      console.error("Renderer instance is not defined. Cannot animate tiles.");
      return;
    }
    console.log("Animating tiles with renderer:", this.renderer);
    this.renderer.animateTilesInOrder(this.previewTiles, animationClass, delay);
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

    // Trigger animation for the updated preview tiles
    this.animatePreviewTiles();
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