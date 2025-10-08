/**
 * Preview container that shows the upcoming N letters
 */
export class PreviewContainer {
  constructor(containerId = 'preview-container', previewCount = 3) {
    this.container = document.getElementById(containerId);
    this.previewCount = previewCount;
    this.previewTiles = [];
    this.initialize();
  }

initialize() {
  // Clear existing content
  this.container.innerHTML = '';
  
  // Set container width to exactly 3/7 of the game board width
  const gameBoard = document.getElementById('game-board');
  if (gameBoard) {
    const gameBoardWidth = gameBoard.offsetWidth;
    const columnWidth = gameBoardWidth / 7; // Width of one column
    
    // Set preview container width to exactly 3 columns
    this.container.style.width = `${columnWidth * 3}px`;
    // Force a 3-column grid layout
    this.container.style.gridTemplateColumns = 'repeat(3, 1fr)';
  }
  
  // Create preview tiles
  for (let i = 0; i < this.previewCount; i++) {
    const tileElement = document.createElement('div');
    tileElement.className = 'tile preview';
    this.container.appendChild(tileElement);
    this.previewTiles.push(tileElement);
  }
  
  // Add window resize listener to maintain correct sizing
  window.addEventListener('resize', () => {
    if (gameBoard) {
      const updatedWidth = gameBoard.offsetWidth;
      this.container.style.width = `${(updatedWidth / 7) * 3}px`;
    }
  });
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
   * Animates the rightmost tile moving to spawn position
   */
  animatePreviewToSpawn() {
    if (this.previewTiles.length > 0) {
      const rightmostTileIndex = this.previewTiles.length - 1;
      const rightmostTile = this.previewTiles[rightmostTileIndex];
      rightmostTile.classList.add('moving-to-spawn');
      
      // Remove the animation class after it completes
      setTimeout(() => {
        rightmostTile.classList.remove('moving-to-spawn');
      }, 400); // Match animation duration
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
      if (currentTile.classList.contains('has-letter')) {
        targetTile.classList.add('has-letter');
      } else {
        targetTile.classList.remove('has-letter');
      }
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
  
  /**
   * Update the preview with animation and tile updates
   * @param {Array} newLetter - new letters to display
   * @param {boolean} animateNext - Whether to animate the next letter
   */
  updatePreview(newLetter, animateNext = true) {
    if (animateNext) {
      this.animatePreviewToSpawn();
      // Delay the tile update to sync with animation
      setTimeout(() => {
        this.updatePreviewShiftRight(newLetter);
      }, 10);
    } else {
      this.updatePreviewShiftRight(newLetter);
    }
  }

}