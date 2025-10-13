export class GameBoard {
  constructor(tiles) {
    if (tiles.length !== 42) {
      throw new Error("Invalid tiles list: Expected 42 tiles.");
    }

    // Convert the flat list of 42 tiles into a 7x6 grid (7 columns, 6 rows)
    this.rows = 6;
    this.cols = 7;
    this.tiles = [];
    for (let row = 0; row < this.rows; row++) {
      this.tiles.push(tiles.slice(row * this.cols, row * this.cols + this.cols));
    }
  }

  getLowestEmptyRow(col) {
    for (let row = this.rows - 1; row >= 0; row--) {
        const tile = this.getTileElement(row, col);
        if (tile && tile.textContent.trim() === '') {
            return row; // Return the first empty row from the bottom
        }
    }
    return -1; // Return -1 if the column is full
  }
  getTileElement(row, col) {
    return this.tiles[row][col];
  }

  setTileContent(row, col, content) {
    const tile = this.getTileElement(row, col);
    if (tile) tile.textContent = content;
  }

  clearTile(row, col) {
    const tile = this.getTileElement(row, col);
    if (tile) tile.textContent = '';
  }

  setTileClass(row, col, className) {
    const tile = this.getTileElement(row, col);
    if (tile) tile.className = `tile board ${className}`;
  }

  resetBoard() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.clearTile(row, col);
        this.setTileClass(row, col, '');
      }
    }
  }

  /**
   * Applies gravity to a specific column, making all tiles fall down.
   * @param {number} col - Column to apply gravity to
   * @param {number} [delay=60] - Animation delay between steps
   * @returns {Promise<void>}
   */
  async applyGravityToColumn(col, delay = 60) {
    // Collect non-empty tiles from top to bottom
    const tiles = [];
    for (let row = 0; row < this.rows; row++) {
      const tile = this.getTileElement(row, col);
      if (tile?.textContent.trim()) {
        tiles.push({ content: tile.textContent, from: row });
        this.clearTile(row, col);
        this.setTileClass(row, col, '');
      }
    }

    // Animate tiles falling to bottom positions
    for (let i = 0; i < tiles.length; i++) {
      const targetRow = this.rows - 1 - i;
      const tileData = tiles[tiles.length - 1 - i]; // Bottom-up order
      
      if (tileData.from !== targetRow) {
        await this._animateDrop(col, tileData.from, targetRow, tileData.content, delay);
      } else {
        this.setTileContent(targetRow, col, tileData.content);
        this.setTileClass(targetRow, col, 'locked');
      }
    }
  }

  /**
   * Applies gravity to entire board or specific columns.
   * @param {Array<number>} [columns] - Specific columns to apply gravity to
   * @param {number} [delay=60] - Animation delay
   * @returns {Promise<void>}
   */
  async applyGravity(columns = null, delay = 60) {
    const targetCols = columns || Array.from({length: this.cols}, (_, i) => i);
    await Promise.all(targetCols.map(col => this.applyGravityToColumn(col, delay)));
  }

  /**
   * Helper: Animates single tile drop
   * @private
   */
  async _animateDrop(col, startRow, endRow, content, delay) {
    let currentRow = startRow;
    this.setTileContent(currentRow, col, content);
    this.setTileClass(currentRow, col, 'falling');

    while (currentRow < endRow) {
      await new Promise(res => setTimeout(res, delay));
      this.clearTile(currentRow, col);
      this.setTileClass(currentRow, col, '');
      currentRow++;
      this.setTileContent(currentRow, col, content);
      this.setTileClass(currentRow, col, 'falling');
    }

    this.setTileClass(endRow, col, 'locked');
  }

  countTilesPerColumn(col) {
    let count = 0;
    // if the tile.textContent is not empty, count it
    for (let row = 0; row < this.rows; row++) {
      const tile = this.getTileElement(row, col);
      if (tile && tile.textContent.trim() !== '') {
        count++;
      }
    }

    return count;
  }
  
  getEndRowForColumn(col) {
      const tilesInColumn = this.countTilesPerColumn(col);
      const endRow = this.rows - 1 - tilesInColumn;
      return endRow;
  }

  /**
   * Animates a found word: highlights, shakes, clears, and applies gravity.
   * @param {Array} positions - Array of [row, col] pairs for word tiles
   * @param {number} [duration=600] - Word animation duration
   * @param {boolean} [useGravity=true] - Apply gravity after clearing
   * @returns {Promise<void>}
   */
  async animateWordFound(positions, duration = 600, useGravity = true) {
    // Highlight and shake tiles
    positions.forEach(([row, col]) => {
      const tile = this.getTileElement(row, col);
      if (tile) tile.classList.add('highlight', 'shake');
    });

    await new Promise(res => setTimeout(res, duration));

    // Get affected columns before clearing
    const affectedCols = [...new Set(positions.map(([, col]) => col))];
    
    // Clear tiles and remove animation classes
    positions.forEach(([row, col]) => {
      const tile = this.getTileElement(row, col);
      if (tile) {
        tile.classList.remove('highlight', 'shake');
      }
      this.clearTile(row, col);
      this.setTileClass(row, col, '');      
    });

    // Apply gravity to affected columns only
    if (useGravity) {
      await this.applyGravity(affectedCols);
    }
  }


}
