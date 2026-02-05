/* eslint-disable react/prop-types */
import { useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const GameBoard = ({ nodes, links, onNodeClick, onLinkClick, interactionMode }) => {
    const fgRef = useRef();

    // Define Colors
    const getNodeColor = useCallback((node) => {
        if (node.status === 'failed') return '#ff0033'; // Red
        if (node.status === 'degraded') return '#ffcc00'; // Yellow
        if (node.hasSensor) {
            return '#00ff88'; // Green (Active & Monitored)
        }
        // If no sensor, status is technically "unknown" to the player, 
        // but visualized as separate color?
        // Or we visualize the "Real" status but with a "?" overlay?
        // Prompt says: "Nodes WITHOUT sensors: state is uncertain ... gray=unknown"
        // So visuals should reflect "Unknown"
        return '#444444'; // Gray
    }, []);

    const getNodeVal = useCallback((node) => {
        // Size based on type
        if (node.type === 'power-plant') return 15;
        if (node.type === 'substation') return 8;
        return 3;
    }, []);

    // Custom Node Canvas Renderer for "Glowing" effect and Type Icons
    const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
        const x = node.x;
        const y = node.y;
        const val = getNodeVal(node);
        const color = getNodeColor(node);

        // Glow
        const glowRadius = val * 1.5;
        const gradient = ctx.createRadialGradient(x, y, val * 0.5, x, y, glowRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, 2 * Math.PI, false);
        ctx.fill();

        // Core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, val, 0, 2 * Math.PI, false);
        ctx.fill();

        // Label / Icon (simplified)
        if (globalScale >= 1.5) {
            ctx.font = `${val * 0.8}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            // Icon logic
            let icon = '';
            if (node.type === 'power-plant') icon = '⚡';
            else if (node.type === 'substation') icon = '🔄';
            else if (node.hasSensor) icon = '📡';

            ctx.fillText(icon, x, y);
        }
    }, [getNodeColor, getNodeVal]);

    const handleNodeClick = useCallback(node => {
        onNodeClick && onNodeClick(node);
    }, [onNodeClick]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
            <ForceGraph2D
                ref={fgRef}
                graphData={{ nodes, links }}
                nodeLabel="name"
                nodeVal={getNodeVal}
                nodeColor={getNodeColor}
                nodeCanvasObject={nodeCanvasObject}
                linkColor={() => '#00ff88'}
                linkWidth={1}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}
                backgroundColor="#1a1a1a" // Dark theme
                onNodeClick={handleNodeClick}
                // Disable zoom interaction if needed, or keep it
                d3AlphaDecay={0.01} // Slower stabilization
                d3VelocityDecay={0.08}
                cooldownTicks={100}
                onEngineStop={() => fgRef.current.zoomToFit(400)}
            />
        </div>
    );
};

export default GameBoard;
