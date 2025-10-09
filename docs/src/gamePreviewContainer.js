/**
 * Preview container that shows the upcoming N letters
 */
export class PreviewContainer {
  constructor(containerId = 'next-tiles-preview', previewCount = 4) {
    this.container = document.getElementById(containerId);
    this.previewCount = previewCount;
    this.previewTiles = [];
    this.initialize();
    this.observer = null;
  }

initialize() {
  // Create preview tiles
  for (let i = 0; i < this.previewCount; i++) {
    const tileElement = document.createElement('div');
    tileElement.className = 'tile preview';
    this.container.appendChild(tileElement);
    this.previewTiles.push(tileElement);
  }
}
/**
   * Updates the preview tiles with upcoming letters
   * @param {Array} upcomingLetters - Array of next N letters
   */
  initPreviewTiles(upcomingLetters) {
    // Fill preview tiles left to right, rightmost is the next letter
    for (let i = 0; i < this.previewCount; i++) {
      const letterIndex = upcomingLetters.length - 1 - i; // Adjusted index for rightmost letter
      if (letterIndex >= 0) {
        this.previewTiles[i].textContent = upcomingLetters[letterIndex].toUpperCase();
        this.previewTiles[i].classList.add('has-letter');
      } else {
        this.previewTiles[i].textContent = '';
        this.previewTiles[i].classList.remove('has-letter');
      }
    }
  }

  /**
 * Shifts preview tiles to the right and adds new letter at first position
 * @param {string} newLetter - The new letter to add at the first position
 */
  updatePreviewShiftRight(newLetter) {
    // Shift existing tiles to the right (from right to left to avoid overwriting)
    for (let i = this.previewCount - 1; i > 0; i--) {
      const currentTile = this.previewTiles[i - 1];
      const targetTile = this.previewTiles[i];

      // Copy content and classes from left tile to right tile
      targetTile.textContent = currentTile.textContent;
      targetTile.classList.add('has-letter');
    }

    // Add new letter at the first position (leftmost tile)
    const firstTile = this.previewTiles[0];
    if (newLetter) {
      firstTile.textContent = newLetter.toUpperCase();
      firstTile.classList.add('has-letter');
    } else {
      firstTile.textContent = '';
      firstTile.classList.remove('has-letter');
    }
  }

  
  addObserver(observer) {
    this.observer = observer;
  }

  notifyObservers(letter) {
    this.observer.updateSpawnTile(letter);
  }

  /**
   * Update the preview with animation and tile updates. This also notifies the spwan row to update
   * @param {Array} newLetter - new letters to display
   * @param {boolean} animateNext - Whether to animate the next letter
   */
  updatePreview(newLetter) {
    const lastPreviewTile = this.previewTiles[this.previewCount - 1];      

    lastPreviewTile.classList.add('moving-to-spawn');
    this.observer.updateSpawnTile(lastPreviewTile.textContent, 'inactive'); // put the tile in spawn, but make inactive
    this.observer

    // Update the preview tiles first
    this.updatePreviewShiftRight(newLetter);
    
    // Wait a tiny bit for the DOM to update
    setTimeout(() => {
      // Get the last preview tile and the spawn row
      this.animatePreviewToSpawn(lastPreviewTile);
      this.notifyObservers(lastPreviewTile.textContent);
    }, 10); // Small delay to ensure DOM updates
  }

  /**`
   * Animates a tile moving from the preview to the spawn row
   * @param {HTMLElement} previewTile - The preview tile element to animate
   * @param {HTMLElement} spawnTile - The spawn tile element to update
   * @param {string} letter - The letter to place in the spawn tile
   */
animatePreviewToSpawn(previewTile) {
  // Listen for the animation end event
  previewTile.addEventListener('animationend', () => {
    // Notify observers (e.g., update spawn row)
    // this.notifyObservers(previewTile.textContent);

    // Now clear the preview tile after animation is done
    previewTile.textContent = '';
    previewTile.classList.remove('has-letter');
    previewTile.classList.remove('moving-to-spawn');
  }, { once: true });
}


  /**
   * Clear all preview tiles
   */
  clearPreview() {
    this.previewTiles.forEach(tile => {
      tile.textContent = '';
      tile.classList.remove('has-letter');
    });
  }

}