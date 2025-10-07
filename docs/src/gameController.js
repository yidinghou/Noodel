import { createGameBoard, GameBoard } from './gameBoard.js';
import { createSpawnRow, SpawnRow } from './gameSpawnRow.js';
import { TileGenerator } from './TileGenerator.js';

export class Game {
    constructor(boardId, rows, cols) {
        this.boardId = boardId; // ID of the game board container
        this.rows = rows;
        this.cols = cols;
        this.gameBoard = null;
        this.gameBoardElement = null;
        this.tileGenerator = new TileGenerator();
    }

    init() {
        createGameBoard();
        this.gameBoard = new GameBoard(this.boardId, this.rows, this.cols);
        this.gameBoardElement = document.getElementById(this.boardId);

        createSpawnRow(7);
        const spawnRow = new SpawnRow('spawn-row', 7);
        this.spawnRow = spawnRow;
        this.spawnLetter = this.tileGenerator.getNextTile().toUpperCase();
        this.spawnRow.setSpawnTileContent(0, this.spawnLetter); // Initial position

        this.setupEventListeners();
        console.log('Game initialized.');
    }

    setupEventListeners() {
        if (this.gameBoardElement) {
            // Bind 'this' to ensure it refers to the Game instance in the handler
            this.gameBoardElement.addEventListener('click', this.handleBoardClick.bind(this));

                // Mouseover: move spawn letter to hovered column
                const tiles = this.gameBoardElement.querySelectorAll('.tile');
                tiles.forEach(tile => {
                    tile.addEventListener('mouseover', (event) => {
                        const col = parseInt(tile.dataset.col, 10);
                        this.spawnRow.clearAllSpawnTiles();
                        this.spawnRow.setSpawnTileContent(col, this.spawnLetter);
                        this.spawnRow.setSpawnTileClass(col, 'active');
                    });
                });
        }
    }

    async handleBoardClick(event) {
        const tile = event.target.closest('.tile');
        if (tile) {
            const col = parseInt(tile.dataset.col, 10);
            const tilesInColumn = this.gameBoard.countTilesPerColumn(col);
            const endRow = this.rows - 1 - tilesInColumn;
            
            // Check if column is full
            if (endRow < 0) {
                console.log(`Column ${col} is full!`);
                return;
            }

            // Animate the tile falling from top to the lowest empty position
            const newLetter = this.spawnLetter;
            await this.gameBoard.animateTileFall(col, 0, endRow, newLetter);
            
            // Get the next letter for the spawn row
            this.spawnLetter = this.tileGenerator.getNextTile().toUpperCase();
            console.log(`Dropped tile in column: ${col}, landed at row: ${endRow}`);
        }
    }
}