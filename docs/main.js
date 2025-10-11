import { Game } from "./src/gameController.js";

class PreviewContainer {
  constructor(tiles, previewCount = 4) {
    this.tiles = tiles; // Array of tile elements
    this.previewCount = previewCount;
    this.previewTiles = [];
    this.initialize();
    this.observer = null;
  }

  initialize() {
    // set to tile preview claass
    for (let i = 0; i < this.previewCount; i++) {
      this.tiles[6 - i].className = 'tile preview active';
      this.previewTiles.push(this.tiles[6 - i]);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
});

