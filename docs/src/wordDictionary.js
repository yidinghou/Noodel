
/**
 * Dictionary class for loading and managing word data
 */
export class WordDictionary {
  constructor() {
    this.validWords = [];
    this.wordDefinitions = {};
  }

  /**
   * Loads words and definitions from CSV files
   * @returns {Promise<void>}
   */
  async loadWords() {
    try {
      // List of CSV files to load from docs/word_list
      const csvFiles = [
        './word_list/3_letter_words.csv',
        './word_list/4_letter_words.csv',
        './word_list/5_letter_words.csv',
        './word_list/6_letter_words.csv',
        './word_list/7_letter_words.csv',
      ];

      this.validWords = [];
      this.wordDefinitions = {};

      for (const file of csvFiles) {
        const response = await fetch(file);
        if (!response.ok) continue;
        
        const data = await response.text();
        const lines = data.split('\n').filter(line => line.trim().length > 2);
        if (lines.length <= 2) continue;

        // Parse Headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const wordIdx = headers.indexOf('word');
        const defIdx = headers.indexOf('definition');
        if (wordIdx === -1 || defIdx === -1) continue;

        // Parse Rows
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',');
          const wordRaw = row[wordIdx];
          const defRaw = row[defIdx];
          
          if (!wordRaw) continue;
          
          const word = wordRaw.trim();
          const definition = defRaw?.replace(/[\r\n]/g, '<br>') || 'Definition not found';

          this.validWords.push(word);
          this.wordDefinitions[word] = definition;
        }
      }
      
      console.log(`Dictionary: Loaded ${this.validWords.length} words from all CSVs.`);
      
    } catch (error) {
      console.error('Error loading words:', error);
    }
  }
  /**
   * Gets the definition for a given word
   * @param {string} word - The word to look up
   * @returns {string} The definition or 'Definition not found'
   */
  getDefinition(word) {
    return this.wordDefinitions[word] || 'Definition not found';
  }

}
