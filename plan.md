# 📝 Summary of the Responsive Layout Plan

The core goal of the plan is to create a two-column game interface that switches to a stacked column layout when space is limited, ensuring the game board always maintains its 7:8 shape and fits within the parent's fixed height.

***

## Key Constraints and Dimensions

| Element | Role | Key CSS Properties |
| :--- | :--- | :--- |
| **`.main-container`** | **Parent & Boundary** | `display: flex`, `flex-wrap: wrap`, `max-width: 700px`, **`height: 75vh`** (Vertical Limit), `gap: 2rem`. |
| **`.game-board-container`** | **Fixed Aspect Child** | **`aspect-ratio: 7 / 8`**, `max-width: 65%`, **`max-height: 100%`** (Constrained by Parent's 75vh). |
| **`.made-words-wrapper`** | **Flexible Sidebar** | `flex: 1 1 auto`, **`min-width: 200px`** (Prevents shrinking too much), `max-height: 100%`. |
| **Grid Tiles** (Inside Board) | **Internal Content** | `grid-template-columns: repeat(7, 1fr)`, `grid-template-rows: repeat(8, 1fr)`, **`aspect-ratio: 1 / 1`** on tiles. |

***

## Logic of Responsiveness

1.  **Vertical Constraint (The Height Limit):** The `.main-container`'s fixed **`height: 75vh`** acts as the primary vertical limit. Both children are forced to fit within this limit by using **`max-height: 100%`**.
2.  **Horizontal Switching (Flex-Wrap):**
    * When the combined width required by the children (`game-board` at 65% max + `made-words` at its 200px `min-width` + `gap`) exceeds the 700px parent `max-width`, **`flex-wrap: wrap`** forces the `.made-words-wrapper` to drop to the next line (stacking vertically).
3.  **Game Board Sizing:**
    * The game board is the **largest 7:8 rectangle** that can fit within the $\mathbf{75\text{vh}}$ height and the $\mathbf{65\%}$ width constraint. The browser automatically finds this fit.
4.  **Tile Sizing:**
    * Tiles use $\mathbf{1\text{fr}}$ units to fill the board and **`aspect-ratio: 1 / 1`** to remain square. Since the overall board is constrained by its 75vh height, the grid's rows/columns will be sized by this vertical limit. The tiles are therefore dynamically sized by the **most restrictive dimension** of the game board.

***

## Technical Recommendations

* **`max-height: 100%`** is the crucial fix for preventing children from bleeding outside the 75vh parent.
* The use of **`min-width: 200px`** on the sidebar dictates the responsive breakpoint for wrapping, making the layout transition based on content needs rather than a fixed screen size.
* The **`.grid-wrapper`** is recommended as an intermediate layer to cleanly separate the board's *overall* 7:8 aspect ratio constraint from the *internal* 7x8 grid structure.