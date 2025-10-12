# Refined Plan

1. **Tile Generator**: 
   - Generates tiles while the preview container is not full.

2. **GameController**: 
   - Manages the game grid.
   - Delegates other logic to supporting components.

3. **Spawn Row**: 
   - Updates state with the last preview tile when the preview container is full.

4. **preview container**
    - holds the preview tiles and letters
    - passes the last letter to the spawn row

5. **Renderer**:
    - handles all the transition board visual logic.