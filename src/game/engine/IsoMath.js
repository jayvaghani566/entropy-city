export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32; // 2:1 isometric ratio

/**
 * Converts Grid coordinates to Screen coordinates.
 * @param {number} mapX - Grid X position
 * @param {number} mapY - Grid Y position
 * @returns {object} { x, y } screen coordinates (center of tile)
 */
export const gridToScreen = (mapX, mapY) => {
    const x = (mapX - mapY) * (TILE_WIDTH / 2);
    const y = (mapX + mapY) * (TILE_HEIGHT / 2);
    return { x, y };
};

/**
 * Converts Screen coordinates to Grid coordinates.
 * Note: Only accurate if screenX/Y are relative to the grid origin (0,0).
 * Adjust for camera offset before calling.
 * @param {number} screenX 
 * @param {number} screenY 
 * @returns {object} { x, y } grid coordinates (floored)
 */
export const screenToGrid = (screenX, screenY) => {
    const mapY = (2 * screenY - screenX / 2 * 2) / 2; // Derived from inverse matrix roughly...
    // Correct formula:
    // x_screen = (x_map - y_map) * (W/2)
    // y_screen = (x_map + y_map) * (H/2)
    //
    // x_map = (x_screen / (W/2) + y_screen / (H/2)) / 2
    // y_map = (y_screen / (H/2) - x_screen / (W/2)) / 2

    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;

    const x = Math.floor((screenX / halfW + screenY / halfH) / 2);
    const y = Math.floor((screenY / halfH - screenX / halfW) / 2);

    return { x, y };
};
