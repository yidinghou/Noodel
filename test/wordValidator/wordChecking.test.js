import { describe, it, expect, beforeEach } from 'vitest';
import { WordValidator } from '../../docs/src/wordValidator.js';
import { createGameBoard, GameBoard } from '../../docs/src/gameBoard.js';

describe('WordValidator - Word Checking', () => {
  let validator;
  let board;

  beforeEach(() => {
    // Set up DOM for jsdom
    document.body.innerHTML = '<div id="game-board"></div>';
    createGameBoard(6, 7);
    board = new GameBoard('game-board', 6, 7);

    validator = new WordValidator(3);
    // Mock dictionary with test words
    validator.dictionary.validWords = new Set(['cat', 'dog', 'hat', 'car', 'art', 'tar']);
    validator.dictionary.hasWord = (word) =>
      validator.dictionary.validWords.has(word.toLowerCase());
    validator.isReady = true;
  });

  describe('checkForWords', () => {
    it('should find word in row direction', () => {
      // Set up horizontal word "CAT"
      board.setTileContent(2, 1, 'C');
      board.setTileContent(2, 2, 'A');
      board.setTileContent(2, 3, 'T');

      const result = validator.checkForWords(2, 2, board);

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('CAT');
      expect(result[0].direction).toBe('row');
      expect(result[0].positions).toEqual([
        [2, 1],
        [2, 2],
        [2, 3],
      ]);
    });

    it('should find word in column direction', () => {
      // Set up vertical word "DOG"
      board.setTileContent(1, 3, 'D');
      board.setTileContent(2, 3, 'O');
      board.setTileContent(3, 3, 'G');

      const result = validator.checkForWords(2, 3, board);

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('DOG');
      expect(result[0].direction).toBe('column');
      expect(result[0].positions).toEqual([
        [1, 3],
        [2, 3],
        [3, 3],
      ]);
    });

    it('should find word in topToBottom diagonal', () => {
      // Set up diagonal word "HAT"
      board.setTileContent(0, 0, 'H');
      board.setTileContent(1, 1, 'A');
      board.setTileContent(2, 2, 'T');

      const result = validator.checkForWords(1, 1, board);

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('HAT');
      expect(result[0].direction).toBe('diagonalTB');
      expect(result[0].positions).toEqual([
        [0, 0],
        [1, 1],
        [2, 2],
      ]);
    });

    it('should find word in bottomToTop diagonal', () => {
      // Set up anti-diagonal word "CAR"
      board.setTileContent(3, 2, 'C');
      board.setTileContent(2, 3, 'A');
      board.setTileContent(1, 4, 'R');

      const result = validator.checkForWords(2, 3, board);

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('CAR');
      expect(result[0].direction).toBe('diagonalBT');
      expect(result[0].positions).toEqual([
        [3, 2],
        [2, 3],
        [1, 4],
      ]);
    });

    it('should find multiple words in different directions with shared letter', () => {
      // Set up intersecting words: "CAT" horizontal and "ART" vertical sharing 'A'
      board.setTileContent(2, 1, 'C');
      board.setTileContent(2, 2, 'A'); // Shared letter between both words
      board.setTileContent(2, 3, 'T');

      // Complete the vertical "ART" word with 'A' already placed at [2,2]
      board.setTileContent(3, 2, 'R');
      board.setTileContent(4, 2, 'T');

      const result = validator.checkForWords(2, 2, board);

      expect(result).toHaveLength(2);

      const catWord = result.find((w) => w.letters === 'CAT');
      const artWord = result.find((w) => w.letters === 'ART');

      expect(catWord).toBeTruthy();
      expect(catWord.direction).toBe('row');
      expect(catWord.positions).toEqual([
        [2, 1],
        [2, 2],
        [2, 3],
      ]);

      expect(artWord).toBeTruthy();
      expect(artWord.direction).toBe('column');
      expect(artWord.positions).toEqual([
        [2, 2],
        [3, 2],
        [4, 2],
      ]);
    });

    it('should handle words with gaps (spaces between letters)', () => {
      // Set up "CAT" with gap: "C A T"
      board.setTileContent(2, 0, 'C');
      // Skip position [2,1] - empty space
      board.setTileContent(2, 2, 'A');
      board.setTileContent(2, 3, 'T');

      const result = validator.checkForWords(2, 2, board);

      // Should find individual letters or shorter segments, but not "CAT" due to gap
      const catWord = result.find((w) => w.letters === 'CAT');
      expect(catWord).toBeFalsy(); // Should not find "CAT" with gaps
    });

    it('should respect minimum word length', () => {
      // Set up 2-letter combinations
      board.setTileContent(1, 1, 'A');
      board.setTileContent(1, 2, 'T');

      const result = validator.checkForWords(1, 1, board);

      // Should not find "AT" since minWordLength is 3
      expect(result).toHaveLength(0);
    });

    it('should find words that dont start at the checked position', () => {
      // Set up "DOG" where we check from the middle letter 'O'
      board.setTileContent(3, 0, 'D');
      board.setTileContent(3, 1, 'O');
      board.setTileContent(3, 2, 'G');

      const result = validator.checkForWords(3, 1, board); // Check from 'O'

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('DOG');
      expect(result[0].positions).toEqual([
        [3, 0],
        [3, 1],
        [3, 2],
      ]);
    });

    it('should return empty array when no words found', () => {
      // Set up random letters that dont form words
      board.setTileContent(0, 0, 'X');
      board.setTileContent(0, 1, 'Y');
      board.setTileContent(1, 0, 'Z');

      const result = validator.checkForWords(0, 0, board);

      expect(result).toHaveLength(0);
    });

    it('should handle empty board position', () => {
      // Check from an empty position
      const result = validator.checkForWords(2, 2, board);

      expect(result).toHaveLength(0);
    });

    it('should find multiple words in same direction', () => {
      // Set up two words in same row: "CAT DOG"
      board.setTileContent(2, 0, 'C');
      board.setTileContent(2, 1, 'A');
      board.setTileContent(2, 2, 'T');
      // Gap at [2,3]
      board.setTileContent(2, 4, 'D');
      board.setTileContent(2, 5, 'O');
      board.setTileContent(2, 6, 'G');

      const result = validator.checkForWords(2, 2, board);

      expect(result).toHaveLength(2);
      expect(result.some((w) => w.letters === 'CAT')).toBe(true);
      expect(result.some((w) => w.letters === 'DOG')).toBe(true);
    });

    it('should handle board edge cases', () => {
      // Test from corner position
      board.setTileContent(0, 0, 'C');
      board.setTileContent(0, 1, 'A');
      board.setTileContent(0, 2, 'T');

      const result = validator.checkForWords(0, 0, board);

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('CAT');
      expect(result[0].direction).toBe('row');
    });

    it('should handle case insensitive word matching', () => {
      // Set up word with mixed case
      board.setTileContent(1, 0, 'c');
      board.setTileContent(1, 1, 'A');
      board.setTileContent(1, 2, 't');

      const result = validator.checkForWords(1, 1, board);

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('cAt'); // Preserves original case
    });

    it('should find words starting from left edge (column 0)', () => {
      // Set up word "DOG" starting from column 0
      board.setTileContent(3, 0, 'D');
      board.setTileContent(3, 1, 'O');
      board.setTileContent(3, 2, 'G');

      const result = validator.checkForWords(3, 0, board); // Check from the first letter at column 0

      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('DOG');
      expect(result[0].direction).toBe('row');
      expect(result[0].positions).toEqual([
        [3, 0],
        [3, 1],
        [3, 2],
      ]);
    });

    it('should find words from left edge when checking from any position in the word', () => {
      // Set up word "TAR" starting from column 0
      board.setTileContent(4, 0, 'T');
      board.setTileContent(4, 1, 'A');
      board.setTileContent(4, 2, 'R');

      // Check from middle letter 'A' at column 1
      const result1 = validator.checkForWords(4, 1, board);
      // Check from last letter 'R' at column 2
      const result2 = validator.checkForWords(4, 2, board);

      // Both should find the same word starting from column 0
      expect(result1).toHaveLength(1);
      expect(result1[0].letters).toBe('TAR');
      expect(result1[0].positions).toEqual([
        [4, 0],
        [4, 1],
        [4, 2],
      ]);

      expect(result2).toHaveLength(1);
      expect(result2[0].letters).toBe('TAR');
      expect(result2[0].positions).toEqual([
        [4, 0],
        [4, 1],
        [4, 2],
      ]);
    });

    it('should find multiple words when one starts from left edge', () => {
      // Set up "CAT" starting from column 0 and "ART" vertically sharing the 'A'
      board.setTileContent(2, 0, 'C'); // Left edge
      board.setTileContent(2, 1, 'A'); // Shared letter
      board.setTileContent(2, 2, 'T');

      // Complete vertical "ART" word
      board.setTileContent(3, 1, 'R');
      board.setTileContent(4, 1, 'T');

      const result = validator.checkForWords(2, 1, board); // Check from shared 'A'

      expect(result).toHaveLength(2);

      const catWord = result.find((w) => w.letters === 'CAT');
      const artWord = result.find((w) => w.letters === 'ART');

      expect(catWord).toBeTruthy();
      expect(catWord.direction).toBe('row');
      expect(catWord.positions[0]).toEqual([2, 0]); // Starts from column 0

      expect(artWord).toBeTruthy();
      expect(artWord.direction).toBe('column');
    });
  });

  describe('findWordsAt', () => {
    beforeEach(() => {
      validator.dictionary.validWords = new Set(['cat', 'dog', 'art']);
      validator.dictionary.hasWord = (word) =>
        validator.dictionary.validWords.has(word.toLowerCase());
      validator.isReady = true;
    });

    it('should find words from multiple positions and deduplicate them', () => {
      // "CAT" horizontal, "ART" vertical, sharing 'A'
      board.setTileContent(2, 1, 'C');
      board.setTileContent(2, 2, 'A');
      board.setTileContent(2, 3, 'T');
      board.setTileContent(3, 2, 'R');
      board.setTileContent(4, 2, 'T');

      // Check from all positions of both words
      const positions = [
        [2, 1],
        [2, 2],
        [2, 3],
        [3, 2],
        [4, 2],
      ];
      const result = validator.findWordsAt(board, positions);

      expect(result).toHaveLength(2); // Should find CAT and ART, but only once each
      expect(result.some((w) => w.letters === 'CAT')).toBe(true);
      expect(result.some((w) => w.letters === 'ART')).toBe(true);
    });

    it('should return an empty array if no positions are provided', () => {
      const result = validator.findWordsAt(board, []);
      expect(result).toEqual([]);
    });

    it('should handle a single position correctly', () => {
      board.setTileContent(0, 0, 'C');
      board.setTileContent(0, 1, 'A');
      board.setTileContent(0, 2, 'T');

      const result = validator.findWordsAt(board, [[0, 1]]);
      expect(result).toHaveLength(1);
      expect(result[0].letters).toBe('CAT');
    });
  });
});
