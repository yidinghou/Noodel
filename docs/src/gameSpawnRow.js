/**
 * Generates a 1x7 spawn row that aligns with the game board.
 * Each spawn tile is a div with classes and data attributes for column position.
 */
export function createSpawnRow(cols = 7) {
    const spawnRowContainer = document.getElementById('spawn-row');
    spawnRowContainer.innerHTML = ''; // Clear any previous spawn row

    // Set up CSS grid styles to match game board
    spawnRowContainer.style.display = 'grid';
    spawnRowContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    spawnRowContainer.style.gridTemplateRows = '1fr';
    spawnRowContainer.style.width = '100%';
    spawnRowContainer.style.maxWidth = '420px'; // Match game board width
    spawnRowContainer.style.margin = '0 auto';
    spawnRowContainer.style.gap = '0';

    for (let col = 0; col < cols; col++) {
        const spawnTile = document.createElement('div');
        spawnTile.className = 'spawn-tile';
        spawnTile.dataset.col = col;
        spawnRowContainer.appendChild(spawnTile);
    }
}

export class SpawnRow {
    constructor(spawnRowId = 'spawn-row', cols = 7) {
        this.spawnRowContainer = document.getElementById(spawnRowId);
        this.cols = cols;
    }

    getSpawnTileElement(col) {
        return this.spawnRowContainer.querySelector(`.spawn-tile[data-col="${col}"]`);
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
        if (tile) tile.className = `spawn-tile ${className}`;
    }

    clearAllSpawnTiles() {
        for (let col = 0; col < this.cols; col++) {
            this.clearSpawnTile(col);
            this.setSpawnTileClass(col, '');
        }
    }
}
