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
    this.minWordLength = minWordLength;
    this.isReady = false;
  }

  /**
   * Initializes the word validator by loading the dictionary
   * @returns {Promise<void>}
   */
  async init() {
    await this.dictionary.loadWords();
    this.isReady = true;
    console.log(`WordValidator initialized with ${this.dictionary.getWordCount()} words`);
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

  /**
   * Extracts continuous letter segments from a string with spaces
   * @param {string} letters - String containing letters and spaces
   * @param {Array} positions - Array of position coordinates [row, col]
   * @returns {Array} Array of objects with {letters, positions} for each continuous segment
   * 
   * @example
   * extractContinuousSegments('HAT  ', [[0,0], [0,1], [0,2], [0,3], [0,4]])
   * // Returns: [{letters: 'HAT', positions: [[0,0], [0,1], [0,2]]}]
   * 
   * extractContinuousSegments('HAT CAT', [[0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6]])
   * // Returns: [
   * //   {letters: 'HAT', positions: [[0,0], [0,1], [0,2]]},
   * //   {letters: 'CAT', positions: [[0,4], [0,5], [0,6]]}
   * // ]
   */
  extractContinuousSegments(letters, positions) {
    const segments = [];
    let currentSegment = '';
    let currentPositions = [];

    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];
      
      if (char !== ' ') {
        // Add letter to current segment
        currentSegment += char;
        currentPositions.push(positions[i]);
      } else {
        // Space found - finalize current segment if it has content
        if (currentSegment.length > 0) {
          segments.push({
            letters: currentSegment,
            positions: [...currentPositions]
          });
          
          // Reset for next segment
          currentSegment = '';
          currentPositions = [];
        }
      }
    }

    // Don't forget the last segment if string doesn't end with space
    if (currentSegment.length > 0) {
      segments.push({
        letters: currentSegment,
        positions: [...currentPositions]
      });
    }

    return segments;
  }

  /**
   * Checks for valid words in all directions from a given position on the board
   * @param {number} row - The row position to check from
   * @param {number} col - The column position to check from
   * @param {Object} board - The game board object
   * @returns {Array} Array of found word objects with {letters, positions, direction}
   */
  checkForWords(row, col, board) {
    const directions = [
      { name: 'row', getter: () => this.getRowLetters(board, row) },
      { name: 'column', getter: () => this.getColumnLetters(board, col) },
      { name: 'diagonalTB', getter: () => this.getDiagonalLetters(board, row, col, 'topToBottom') },
      { name: 'diagonalBT', getter: () => this.getDiagonalLetters(board, row, col, 'bottomToTop') }
    ];

    const allWordsAndPositions = directions.flatMap(direction => 
      this._checkDirectionForWords(direction.getter(), direction.name)
    );

    return allWordsAndPositions;
  }

  /**
   * Helper: Checks a single direction for valid words
   * @param {Object} letterData - Object with {letters, positions}
   * @param {string} directionName - Name of the direction being checked
   * @returns {Array} Array of found words in this direction
   * @private
   */
  _checkDirectionForWords(letterData, directionName) {
    const { letters, positions } = letterData;
    const segments = this.extractContinuousSegments(letters, positions);
    
    // Find all valid words in each segment and combine them
    const wordsAndPositions = segments.flatMap(segment => 
      this._findValidWordsInSegment(segment).map(wordObject => ({
        ...wordObject,
        direction: directionName
      }))
    );

    return wordsAndPositions;
  }

  /**
   * Helper: Finds all valid words within a segment
   * @param {Object} segment - Segment with {letters, positions}
   * @returns {Array} Array of valid words found in the segment
   * @private
   */
    _findValidWordsInSegment(segment) {
    const { letters, positions } = segment;
    const validWordsAndPositions = [];
    const segmentLength = letters.length;
    
    // Check all possible substrings of sufficient length
    for (let wordLength = this.minWordLength; wordLength <= segmentLength; wordLength++) {
      // Check each possible starting position for words of this length
      for (let startIdx = 0; startIdx <= segmentLength - wordLength; startIdx++) {
        const wordString = letters.substring(startIdx, startIdx + wordLength);
        
        if (this.dictionary.hasWord(wordString.toLowerCase())) {
          // Get corresponding positions for this word
          const wordPositions = positions.slice(startIdx, startIdx + wordLength);
          
          validWordsAndPositions.push({
            letters: wordString,
            positions: wordPositions
          });
        }
      }
    }
    
    return validWordsAndPositions;
  }

  /**
   * Finds all words for a set of [row,col] positions; dedupes overlapping results.
   * Centralizes the multi-position search logic so callers don't reimplement it.
   * @param {Object} board - The game board object
   * @param {Array<Array<number>>} positions - Array of [row, col] positions
   * @returns {Array<{letters:string, positions:number[][], direction:string}>}
   */
  findWordsAt(board, positions) {
    if (!Array.isArray(positions) || positions.length === 0) return [];

    // Deduplicate input positions
    const uniquePositions = [...new Set(positions.map(p => JSON.stringify(p)))]
      .map(s => JSON.parse(s));

    // Aggregate words found at each unique position
    const allFoundWordsAndPositions = uniquePositions.flatMap(([row, col]) =>
      this.checkForWords(row, col, board)
    );

    // Deduplicate by letters + exact positions to avoid duplicates from overlapping checks
    const seen = new Set();
    const uniqueWordsAndPositions = [];
    for (const wordData of allFoundWordsAndPositions) {
      const key = `${wordData.letters}|${JSON.stringify(wordData.positions)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueWordsAndPositions.push(wordData);
      }
    }

    return uniqueWordsAndPositions;
  }
}