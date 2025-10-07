/**
 * Generates a 6x7 HTML game board grid inside the #game-board element.
 * Each tile is a div with classes and data attributes for row/col.
 */
export function createGameBoard(rows = 6, cols = 7) {
    const boardContainer = document.getElementById('game-board');
    boardContainer.innerHTML = ''; // Clear any previous board

    // Set up CSS grid styles
    boardContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    boardContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = row;
            tile.dataset.col = col;
            boardContainer.appendChild(tile);
        }
    }
}

export class GameBoard {
    constructor(boardContainerId = 'game-board', rows = 6, cols = 7) {
        this.boardContainer = document.getElementById(boardContainerId);
        this.rows = rows;
        this.cols = cols;
    }

    getTileElement(row, col) {
        return this.boardContainer.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
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
        if (tile) tile.className = `tile ${className}`;
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
     * Animates a tile dropping from startRow to endRow in the given column.
     * @param {number} col - The column to drop the tile in.
     * @param {number} startRow - The row to start dropping from.
     * @param {number} endRow - The row to end dropping at (lowest empty).
     * @param {string} content - The content to drop.
     * @param {number} [delay=80] - Delay in ms between steps.
     * @returns {Promise<void>}
     */
    async animateTileFall(col, startRow, endRow, content, delay = 80) {
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

        // Finalize tile at endRow
        this.setTileClass(endRow, col, '');
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


}