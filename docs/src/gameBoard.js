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

// Example usage (call this after DOM is loaded):
// createGameBoard();