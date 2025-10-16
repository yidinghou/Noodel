// Responsible for managing the made-words DOM list
export class WordListManager {
  constructor(listContainerId = 'made-words-list') {
    this.listEl = typeof document !== 'undefined' ? document.getElementById(listContainerId) : null;
  }

  addWord(wordObj, definition = '') {
    if (!this.listEl) return;
    const wordElement = document.createElement('div');
    wordElement.className = 'made-word';
    wordElement.innerHTML = `<strong>${wordObj.letters}</strong>: ${definition || 'No definition available'}`;
    this.listEl.prepend(wordElement);
  }

  clear() {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';
  }
}
