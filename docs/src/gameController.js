import { createGameBoard, GameBoard } from './gameBoard.js';

export class Game {
    constructor(boardId, rows, cols) {
        this.boardId = boardId;
        this.rows = rows;
        this.cols = cols;
        this.gameBoard = null;
        this.gameBoardElement = null;
    }

    init() {
        createGameBoard();
        this.gameBoard = new GameBoard(this.boardId, this.rows, this.cols);
        this.gameBoardElement = document.getElementById(this.boardId);

        this.setupEventListeners();

        // Example initial state
        this.gameBoard.setTileContent(2, 3, 'A');
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
            this.gameBoard.setTileContent(row, col, newLetter);
            console.log(`Clicked on tile at row: ${row}, col: ${col}`);
        }
    }
}