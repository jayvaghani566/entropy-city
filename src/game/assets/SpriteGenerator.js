import { TILE_WIDTH, TILE_HEIGHT } from '../engine/IsoMath';

const CACHE = {};

/**
 * Generates an image for a specific building type and state.
 * @param {string} type - 'power-plant', 'substation', 'residential', 'commercial'
 * @param {string} state - 'active', 'degraded', 'failed'
 * @returns {HTMLCanvasElement} - Offscreen canvas containing the sprite
 */
export const getBuildingSprite = (type, state) => {
    const key = `${type}-${state}`;
    if (CACHE[key]) return CACHE[key];

    const canvas = document.createElement('canvas');
    canvas.width = TILE_WIDTH * 2;
    canvas.height = TILE_WIDTH * 2; // Enough vertical space
    const ctx = canvas.getContext('2d');

    // Center drawing at bottom-center of the tile footprint
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.75;

    // Base Colors
    let baseColor = '#aaaaaa';
    let sideColor = '#888888';
    let topColor = '#dddddd';

    if (type === 'power-plant') { baseColor = '#556677'; sideColor = '#334455'; topColor = '#778899'; }
    if (type === 'substation') { baseColor = '#555555'; sideColor = '#333333'; topColor = '#777777'; }
    if (type === 'residential') { baseColor = '#aa6666'; sideColor = '#884444'; topColor = '#cc8888'; }

    // State Overrides
    if (state === 'failed') {
        baseColor = '#330000'; sideColor = '#220000'; topColor = '#440000';
    } else if (state === 'degraded') {
        baseColor = '#998800'; sideColor = '#665500'; topColor = '#bb9900';
    }

    // Helper to draw isometric block/cube
    const drawIsoBlock = (x, y, w, h, height, colorB, colorS, colorT) => {
        // Top Face
        ctx.fillStyle = colorT;
        ctx.beginPath();
        ctx.moveTo(x, y - height);
        ctx.lineTo(x + w, y - height + h / 2);
        ctx.lineTo(x, y - height + h);
        ctx.lineTo(x - w, y - height + h / 2);
        ctx.closePath();
        ctx.fill();

        // Right Face
        ctx.fillStyle = colorS;
        ctx.beginPath();
        ctx.moveTo(x + w, y - height + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y - height + h);
        ctx.closePath();
        ctx.fill();

        // Left Face
        ctx.fillStyle = colorB;
        ctx.beginPath();
        ctx.moveTo(x - w, y - height + h / 2);
        ctx.lineTo(x - w, y + h / 2);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y - height + h);
        ctx.closePath();
        ctx.fill();

        // Edge Highlights
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    };

    // Draw Specific Shapes based on Type
    const w = TILE_WIDTH / 2;
    const h = TILE_HEIGHT;

    if (type === 'power-plant') {
        // Main block (tall)
        drawIsoBlock(cx, cy, w * 0.8, h * 0.8, 60, baseColor, sideColor, topColor);
        // Smokestacks
        drawIsoBlock(cx - 10, cy - 60, 5, 5, 20, '#333', '#222', '#111');
        drawIsoBlock(cx + 10, cy - 50, 5, 5, 20, '#333', '#222', '#111');
    } else if (type === 'substation') {
        // Low block
        drawIsoBlock(cx, cy, w * 0.7, h * 0.7, 20, baseColor, sideColor, topColor);
        // Coils
        drawIsoBlock(cx, cy - 20, 10, 5, 10, '#00ffff', '#00aaaa', '#88ffff');
    } else if (type === 'residential') {
        // House shape
        drawIsoBlock(cx, cy, w * 0.6, h * 0.6, 30, baseColor, sideColor, topColor);
        // Roof (simplified pyramid via small top block)
        drawIsoBlock(cx, cy - 30, w * 0.5, h * 0.5, 10, '#883333', '#662222', '#aa5555');
    } else {
        // Generic
        drawIsoBlock(cx, cy, w * 0.5, h * 0.5, 40, baseColor, sideColor, topColor);
    }

    // Draw Sensor Overlay if applicable (handled in renderer likely, but could be baked here)
    // For now, raw building sprite.

    CACHE[key] = canvas;
    return canvas;
};

export const getTileSprite = () => {
    if (CACHE['tile']) return CACHE['tile'];
    const canvas = document.createElement('canvas');
    canvas.width = TILE_WIDTH;
    canvas.height = TILE_HEIGHT;
    const ctx = canvas.getContext('2d');

    // Draw Grass/Grid Tile
    ctx.beginPath();
    ctx.moveTo(TILE_WIDTH / 2, 0);
    ctx.lineTo(TILE_WIDTH, TILE_HEIGHT / 2);
    ctx.lineTo(TILE_WIDTH / 2, TILE_HEIGHT);
    ctx.lineTo(0, TILE_HEIGHT / 2);
    ctx.closePath();

    ctx.fillStyle = '#1a221a'; // Dark grass
    ctx.fill();
    ctx.strokeStyle = '#2a332a';
    ctx.stroke();

    CACHE['tile'] = canvas;
    return canvas;
};
