import React, { useRef, useEffect, useState } from 'react';
import { gridToScreen, screenToGrid, TILE_WIDTH, TILE_HEIGHT } from '../game/engine/IsoMath';
import { getBuildingSprite, getTileSprite } from '../game/assets/SpriteGenerator';
import { ParticleSystem } from '../game/engine/ParticleSystem';

const GameCanvas = ({ gameState, onTileClick, interactionMode }) => {
    const canvasRef = useRef(null);
    const [camera, setCamera] = useState({ x: 0, y: -200, zoom: 1 }); // Start centered-ish
    const requestRef = useRef();

    // Particle System Ref (persists across renders)
    const particlesRef = useRef(new ParticleSystem());

    // Input Handling State
    const dragRef = useRef({ active: false, startX: 0, startY: 0, camX: 0, camY: 0 });

    // CONSTANTS
    const MAP_SIZE = 20;

    // RENDER LOOP
    const render = (time) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize

        const { width, height } = canvas;
        const particles = particlesRef.current;

        // Clear
        ctx.fillStyle = '#0a0a0a'; // Deep space background
        ctx.fillRect(0, 0, width, height);

        // Day/Night Cycle
        // Cycle = 120 seconds (2 mins)
        // 0-60: Day, 60-120: Night
        const cycleTime = gameState.timeElapsed % 120;
        let darkness = 0;
        if (cycleTime > 50 && cycleTime < 70) {
            // Sunset/Sunrise transition
            darkness = 0.5;
        } else if (cycleTime >= 70 && cycleTime < 110) {
            darkness = 0.7; // Night
        } else if (cycleTime >= 110 || cycleTime < 10) {
            darkness = 0.2; // Dawn/Morning
        } else {
            darkness = 0.0; // Day
        }

        ctx.save();

        // Camera Transform
        ctx.translate(width / 2, height / 2); // Center Origin
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        // 1. Render Terrain (Grid)
        const tileSprite = getTileSprite();
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                const pos = gridToScreen(x, y);
                // Render only if visible (simple culling - TODO)
                ctx.drawImage(tileSprite, pos.x - TILE_WIDTH / 2, pos.y);
            }
        }

        // 2. Render Buildings & Effects
        // Must sort by Depth (Y + X) for correct occlusion
        // Or just iterate Y then X for standard "Painter's Algorithm" in Isometric
        const sortedBuildings = [...gameState.nodes].sort((a, b) => {
            // Simple depth: row by row
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });

        sortedBuildings.forEach(b => {
            const pos = gridToScreen(b.x, b.y);
            const sprite = getBuildingSprite(b.type, b.status);
            // Draw sprite centered at the tile, but offset upwards for height
            // Sprite is 128x128 (2*TILE), centered at bottom 0.75
            // Tile center is pos.x, pos.y + TILE_HEIGHT/2

            // Sprite generator centers at W/2, H*0.75 = tile "center" roughly?
            // Let's align carefully.
            // pos.x is center-top of tile diamond? No, gridToScreen returns center of tile.

            ctx.drawImage(sprite,
                pos.x - sprite.width / 2,
                pos.y - sprite.height * 0.75
            );

            // Effects Generation (Random Smoke/Sparks)
            if (b.type === 'power-plant' && b.status === 'active' && Math.random() < 0.1) {
                // Smoke from stack positions (approx)
                particles.emit(pos.x - 10, pos.y - 80, 'smoke');
                particles.emit(pos.x + 10, pos.y - 70, 'smoke');
            }
            if (b.status === 'failed' && Math.random() < 0.05) {
                particles.emit(pos.x, pos.y - 20, 'spark');
            }

            // Sensor Overlay
            if (b.hasSensor) {
                ctx.fillStyle = '#00ff88';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y - 40, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 3. Update & Render Particles (World Space)
        particles.update();
        particles.draw(ctx);

        // 4. Render Connections (Overlay)
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        gameState.links.forEach(link => {
            const source = gameState.nodes.find(n => n.id === link.source.id ?? link.source);
            const target = gameState.nodes.find(n => n.id === link.target.id ?? link.target);
            if (source && target) {
                const p1 = gridToScreen(source.x, source.y);
                const p2 = gridToScreen(target.x, target.y);
                // Draw somewhat offset to look like "cables"
                ctx.moveTo(p1.x, p1.y - 10);
                ctx.lineTo(p2.x, p2.y - 10);
            }
        });
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Selection / Hover (Highlight Tile under mouse)
        // TODO: Need mouse pos passed in or handled

        // Apply Day/Night Overlay (simulated)
        // We draw a full-screen rect over the world content, but inside the camera transform?
        // No, lighting usually affects the world.

        // Actually, drawing a blue/black overlay is a cheap way to do night.
        if (darkness > 0) {
            ctx.fillStyle = `rgba(10, 10, 30, ${darkness})`;
            // We need to cover the visible world area or just the screen?
            // If we act on screen coordinates (ignoring camera transform), we need to restore context first.
        }

        ctx.restore(); // Restore to screen coordinates

        // Draw Night Overlay on Screen
        if (darkness > 0) {
            ctx.fillStyle = `rgba(10, 10, 30, ${darkness})`;
            ctx.fillRect(0, 0, width, height);
        }

        requestRef.current = requestAnimationFrame(render);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }); // Run every frame, ideally depend on nothing or just active

    // INPUT HANDLERS
    const handleWheel = (e) => {
        e.preventDefault();
        const scale = e.deltaY > 0 ? 0.9 : 1.1;
        setCamera(prev => ({ ...prev, zoom: Math.max(0.5, Math.min(3, prev.zoom * scale)) }));
    };

    const handleMouseDown = (e) => {
        // Only drag if Middle click or Space held? Or always drag on background?
        // Let's stick to Left Click Drag for Pan for now, Click-tap for select
        dragRef.current = {
            active: true,
            startX: e.clientX,
            startY: e.clientY,
            camX: camera.x,
            camY: camera.y
        };
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Dragging Logic
        if (dragRef.current.active) {
            const dx = (e.clientX - dragRef.current.startX) / camera.zoom;
            const dy = (e.clientY - dragRef.current.startY) / camera.zoom;
            setCamera(prev => ({
                ...prev,
                x: dragRef.current.camX - dx,
                y: dragRef.current.camY - dy
            }));
            return; // Don't hover while dragging
        }

        // Hover Logic
        const width = rect.width;
        const height = rect.height;
        const worldX = (mx - width / 2) / camera.zoom + camera.x;
        const worldY = (my - height / 2) / camera.zoom + camera.y;
        const gridPos = screenToGrid(worldX, worldY);

        const building = gameState.nodes.find(n => n.x === gridPos.x && n.y === gridPos.y);
        if (building) {
            // Pass screen coords for tooltip
            // Or just pass node and let parent handle coords? Parent needs screen coords.
            // Let's pass the mouse X/Y or calculated building screen pos.
            // Mouse is easiest for tooltip.
            onTileHover && onTileHover(building, e.clientX, e.clientY);
        } else {
            onTileHover && onTileHover(null);
        }
    };

    const handleMouseUp = (e) => {
        if (dragRef.current.active) {
            dragRef.current.active = false;
            // If barely moved, treat as Click
            const dist = Math.hypot(e.clientX - dragRef.current.startX, e.clientY - dragRef.current.startY);
            if (dist < 5) {
                handleCanvasClick(e);
            }
        }
    };

    const handleCanvasClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Transform screen to world
        // worldX = (mx - width/2) / zoom + camX
        const width = rect.width;
        const height = rect.height;
        const worldX = (mx - width / 2) / camera.zoom + camera.x;
        const worldY = (my - height / 2) / camera.zoom + camera.y;

        const gridPos = screenToGrid(worldX, worldY);

        // Find building at this grid pos
        const building = gameState.nodes.find(n => n.x === gridPos.x && n.y === gridPos.y);
        if (building) {
            onTileClick(building);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            style={{ display: 'block' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => dragRef.current.active = false}
        />
    );
};

export default GameCanvas;
