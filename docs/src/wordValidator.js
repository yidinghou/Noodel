/**
 * A class responsible for loading a dictionary, validating words on the game board,
 * and applying special themes when certain words are found.
 */

import { WordDictionary } from "./wordDictionary.js";
export class WordValidator {
  /**
   * @param {number} minWordLength - The minimum required length for a valid word (default 3).
   */
  constructor(minWordLength = 3) {
    this.dictionary = new WordDictionary();
    this.dictionary.loadWords();

    this.minWordLength = minWordLength;
  }

  // --- Word Collection Helpers ---

  /**
   * Collects letters from a specific column, substituting empty tiles with spaces.
   */
  getColumnLetters(board, col) {
    const letters = Array.from({ length: board.rows }, (_, r) => {
      const tile = board.getTileElement(r, col);
      return tile?.textContent || ' ';
    }).join('');
    
    const positions = Array.from({ length: board.rows }, (_, r) => [r, col]);
    return { letters, positions };
  }

  /**
   * Collects letters from a specific row, substituting empty tiles with spaces.
   */
  getRowLetters(board, row) {
    const letters = Array.from({ length: board.cols }, (_, c) => {
      const tile = board.getTileElement(row, c);
      return tile?.textContent || ' ';
    }).join('');
    
    const positions = Array.from({ length: board.cols }, (_, c) => [row, c]);
    return { letters, positions };
  }

  /**
   * Collects letters along a diagonal, substituting empty tiles with spaces.
   * @param {number} tileRow - The row of the tile we're checking from
   * @param {number} tileCol - The column of the tile we're checking from  
   * @param {string} direction - 'topToBottom' or 'bottomToTop' (always left to right)
   */
  getDiagonalLetters(board, tileRow, tileCol, direction = 'topToBottom') {
    // Calculate the actual start position (leftmost point of the diagonal)
    const { startRow, startCol } = this._findDiagonalStart(board, tileRow, tileCol, direction);
    
    // Generate all positions along the diagonal
    const positions = this._generateDiagonalPositions(board, startRow, startCol, direction);
    
    // Collect letters from all positions
    const letters = positions
      .map(([r, c]) => {
        const tile = board.getTileElement(r, c);
        return tile?.textContent || ' ';
      })
      .join('');

    return { letters, positions };
  }

  /**
   * Helper: Find the leftmost starting position for a diagonal
   */
  _findDiagonalStart(board, tileRow, tileCol, direction) {
    let r = tileRow;
    let c = tileCol;

    if (direction === 'topToBottom') {
      // Move to top-left corner of diagonal
      while (r > 0 && c > 0) {
        r--;
        c--;
      }
    } else { // bottomToTop
      // Move to bottom-left corner of diagonal  
      while (r < board.rows - 1 && c > 0) {
        r++;
        c--;
      }
    }

    return { startRow: r, startCol: c };
  }

  /**
   * Helper: Generate all valid positions along a diagonal
   */
  _generateDiagonalPositions(board, startRow, startCol, direction) {
    const positions = [];
    const rowIncrement = direction === 'topToBottom' ? 1 : -1;
    
    let r = startRow;
    let c = startCol;

    while (r >= 0 && r < board.rows && c < board.cols) {
      positions.push([r, c]);
      c++; // Always move right
      r += rowIncrement; // Move down or up depending on direction
    }

    return positions;
  }
}