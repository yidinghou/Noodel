export class Renderer {
  constructor() {}

  async animateTileMovement(tile, targetTile) {
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
    const steps = 5; // Number of stop-motion steps
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

  async dropTileToSpawnRow(tile) {
    if (!tile) return;

    // Get the starting position of the tile
    const tileRect = tile.getBoundingClientRect();

    // Calculate the target position directly below
    const targetY = tileRect.top + tileRect.height + 10; // Adjust as needed

    // Create a clone for the animation
    const clone = tile.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = `${tileRect.left}px`;
    clone.style.top = `${tileRect.top}px`;
    clone.style.width = `${tileRect.width}px`;
    clone.style.height = `${tileRect.height}px`;
    clone.style.transition = 'transform 0.5s ease-in-out';
    document.body.appendChild(clone);

    // Apply the drop animation
    requestAnimationFrame(() => {
      clone.style.transform = `translateY(${targetY - tileRect.top}px)`;
    });

    // Wait for the animation to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Remove the clone after animation
    document.body.removeChild(clone);
  }

  cancelAnimation() {
    if (this.currentAnimation) {
        this.currentAnimation.cancel(); // Cancel the ongoing animation
        this.currentAnimation = null;
    }
  }
}