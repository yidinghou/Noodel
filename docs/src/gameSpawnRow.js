/**
 * Generates a 1x7 spawn row that aligns with the game board.
 * Each spawn tile is a div with classes and data attributes for column position.
 */
export function createSpawnRow(cols = 7) {
  const spawnRowContainer = document.getElementById('tile-spawn-row');
  spawnRowContainer.innerHTML = ''; // Clear any previous spawn row

  // Set dynamic grid template columns and rows
  spawnRowContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  spawnRowContainer.style.gridTemplateRows = '1fr';

  for (let col = 0; col < cols; col++) {
    const spawnTile = document.createElement('div');
    spawnTile.className = 'tile spawn inactive'; // Start as inactive
    spawnTile.dataset.col = col;
    spawnRowContainer.appendChild(spawnTile);
  }
}

export class SpawnRow {
  constructor(spawnRowId = 'tile-spawn-row', cols = 7) {
    this.spawnRowContainer = document.getElementById(spawnRowId);
    this.cols = cols;
  }

  getSpawnTileElement(col) {
    return this.spawnRowContainer.querySelector(`.tile.spawn[data-col="${col}"]`);
  }

  setSpawnTileContent(col, content) { 
    const tile = this.getSpawnTileElement(col);
    if (tile) tile.textContent = content;
  }

  clearSpawnTile(col) {
    const tile = this.getSpawnTileElement(col);
    if (tile) tile.textContent = '';
  }

  setSpawnTileClass(col, className) {
    const tile = this.getSpawnTileElement(col);
    if (tile) tile.className = `tile spawn ${className}`;
  }

  clearAllSpawnTiles() {
    for (let col = 0; col < this.cols; col++) {
      this.clearSpawnTile(col);
      this.setSpawnTileClass(col, 'inactive');
    }
  }

    /**
   * Updates the spawn tile in the spawn row with the given letter.
   * @param {string} letter - The letter to display in the spawn tile.
   */
  updateSpawnTile(letter, className = 'active') {
    // Clear all spawn tiles first
    this.clearAllSpawnTiles();
    
    // Set the letter in the rightmost column (column 6 for a 7-column board)
    const rightmostCol = this.cols - 2;
    this.setSpawnTileContent(rightmostCol, letter.toUpperCase());
    this.setSpawnTileClass(rightmostCol, className);
  }
}
