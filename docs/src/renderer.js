export class Renderer {
  constructor() {}

  async animateTileMovement(tile, targetTile, rowsDropped) {
    if (!tile || !targetTile) return;
    tile.classList.remove('hover'); // Remove hover state if present
    tile.classList.remove('active'); // Remove active state if present
    tile.classList.add('inactive'); // Make the tile inactive during animation

    // Get the starting and ending positions
    const tileRect = tile.getBoundingClientRect();
    const targetRect = targetTile.getBoundingClientRect();

    // Create a clone of the tile for animation
    const clone = tile.cloneNode(true);
    clone.classList.remove('inactive');
    clone.classList.remove('hover');
    clone.classList.add('tile-falling'); // Use the CSS class for styles
    clone.style.left = `${tileRect.left}px`;
    clone.style.top = `${tileRect.top}px`;
    clone.style.width = `${tileRect.width}px`;
    clone.style.height = `${tileRect.height}px`;
    document.body.appendChild(clone);

    // Calculate the translation steps
    const steps = Math.max(rowsDropped, 1); // Number of stop-motion steps
    const deltaX = (targetRect.left - tileRect.left) / steps;
    const deltaY = (targetRect.top - tileRect.top) / steps;

    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Pause between steps
      clone.style.transform = `translate(${deltaX * i}px, ${deltaY * i}px)`;
    }

    // Wait for the final step to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Remove the clone after animation
    document.body.removeChild(clone);

    targetTile.classList.remove('hidden');
    targetTile.classList.add('locked');
  }

  animateTilesInOrder(tiles, animationClass = 'animate', delay = 80) {
    tiles.forEach((tile, i) => {
      setTimeout(() => {
        tile.classList.add(animationClass);
        tile.addEventListener('animationend', function handler() {
          tile.classList.remove(animationClass);
          tile.removeEventListener('animationend', handler);
        });
      }, i * delay);
    });
  }

  async animateFallToSpawnRow(previewTile, spawnTile) {
    if (!previewTile || !spawnTile) return;

    // Get the starting position of the preview tile
    const previewRect = previewTile.getBoundingClientRect();
    const spawnRect = spawnTile.getBoundingClientRect();

    // Hide the spawn tile initially
    spawnTile.style.visibility = 'hidden';

    // Create a clone of the preview tile for animation
    const clone = previewTile.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = `${previewRect.left}px`;
    clone.style.top = `${previewRect.top}px`;
    clone.style.width = `${previewRect.width}px`;
    clone.style.height = `${previewRect.height}px`;
    clone.style.transition = 'transform 0.5s ease-in-out';
    document.body.appendChild(clone);

    // Step 1: Move the tile one step to the right in the preview row
    const tileWidth = previewRect.width; // Assuming tiles are square
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${tileWidth}px, 0)`;
      });
      setTimeout(resolve, 500); // Wait for the horizontal animation to complete
    });

    // Step 2: Drop the tile to the spawn row
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${spawnRect.left - previewRect.left}px, ${spawnRect.top - previewRect.top}px)`;
      });
      setTimeout(resolve, 500); // Wait for the vertical animation to complete
    });

    // Remove the clone after animation
    document.body.removeChild(clone);

    // Reveal the spawn tile after the animation
    spawnTile.style.visibility = 'visible';
  }

  cancelAnimation() {
    if (this.currentAnimation) {
      this.currentAnimation.cancel(); // Cancel the ongoing animation
      this.currentAnimation = null;
    }
  }
}
