import { createGameBoard, GameState } from './gameBoard.js';

export class Game {
    constructor(boardId, rows, cols) {
        this.boardId = boardId;
        this.rows = rows;
        this.cols = cols;
        this.gameState = null;
        this.gameBoardElement = null;
    }

    init() {
        createGameBoard();
        this.gameState = new GameState(this.boardId, this.rows, this.cols);
        this.gameBoardElement = document.getElementById(this.boardId);

        this.setupEventListeners();

        // Example initial state
        this.gameState.setTileContent(2, 3, 'A');
        console.log('Game initialized.');
    }

    setupEventListeners() {
        if (this.gameBoardElement) {
            // Bind 'this' to ensure it refers to the Game instance in the handler
            this.gameBoardElement.addEventListener('click', this.handleBoardClick.bind(this));
        }
    }

    handleBoardClick(event) {
        const tile = event.target.closest('.tile');
        if (tile) {
            const row = parseInt(tile.dataset.row, 10);
            const col = parseInt(tile.dataset.col, 10);

            // Example: Update the clicked tile with a new letter
            const newLetter = 'B'; // Replace with your logic
            this.gameState.setTileContent(row, col, newLetter);
            console.log(`Clicked on tile at row: ${row}, col: ${col}`);
        }
    }
}