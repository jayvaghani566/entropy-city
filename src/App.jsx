import React, { useState, useMemo } from 'react';
import { useGameState, ACTION_TYPES } from './hooks/useGameState';
import GameCanvas from './components/GameCanvas';
import Sidebar from './components/Sidebar';

function App() {
  const { state, dispatch, saveGame, loadGame } = useGameState();
  const [interactionMode, setInteractionMode] = useState('sensor'); // 'sensor' or 'connect'
  const [sourceNode, setSourceNode] = useState(null);

  // Calculate generic counts for Sidebar
  const nodeCounts = useMemo(() => {
    const counts = { active: 0, failed: 0, unknown: 0 };
    state.nodes.forEach(n => {
      // "Unknown" means no sensor, effectively. 
      // But in our entropy logic, we count "unknown" if !hasSensor.
      if (!n.hasSensor) counts.unknown++;
      else counts[n.status]++;
    });
    return counts;
  }, [state.nodes]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const handleNodeClick = (node) => {
    setSelectedNode(node); // Always select on click
    if (state.gameOver) return;

    if (interactionMode === 'sensor') {
      if (node.status === 'failed') {
        dispatch({ type: ACTION_TYPES.REPAIR_NODE, payload: node.id });
        return;
      }
      if (!node.hasSensor) {
        dispatch({ type: ACTION_TYPES.PLACE_SENSOR, payload: node.id });
      }
    } else if (interactionMode === 'connect') {
      if (!sourceNode) {
        setSourceNode(node);
      } else {
        if (sourceNode.id !== node.id) {
          dispatch({
            type: ACTION_TYPES.ADD_LINK,
            payload: { source: sourceNode.id, target: node.id }
          });
          setSourceNode(null);
        } else {
          setSourceNode(null);
        }
      }
    }
  };

  const handleNodeHover = (node, screenX, screenY) => {
    if (node) {
      setHoveredNode({ ...node, screenX, screenY });
    } else {
      setHoveredNode(null);
    }
  };

  const handleDashboardAction = (action) => {
    if (action === 'TOGGLE_PAUSE') {
      dispatch({ type: ACTION_TYPES.PAUSE_TOGGLE });
    } else if (action === 'MODE_SENSOR') {
      setInteractionMode('sensor');
    } else if (action === 'MODE_CONNECT') {
      setInteractionMode('connect');
    } else if (action === 'SAVE') {
      saveGame();
    } else if (action === 'LOAD') {
      loadGame();
    }
  };

  if (state.victory) {
    return <div className="game-over-screen win">
      <h1>SYSTEM STABILIZED</h1>
      <p>Entropy kept within safe limits.</p>
      <button onClick={() => window.location.reload()}>Replay</button>
    </div>
  }

  if (state.gameOver) {
    return <div className="game-over-screen loss">
      <h1>CRITICAL FAILURE</h1>
      <p>System entropy exceeded maximum threshold.</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      <GameCanvas
        gameState={state}
        onTileClick={handleNodeClick}
        onTileHover={handleNodeHover}
        interactionMode={interactionMode}
      />
      <Sidebar
        entropy={state.entropy}
        budget={state.budget}
        timeElapsed={state.timeElapsed}
        onAction={handleDashboardAction}
        currentMode={interactionMode}
        isPlaying={state.isPlaying}
        nodeCounts={nodeCounts}
        eventLog={state.eventLog}
        selectedNode={selectedNode}
      />
      {/* Tooltip / Inspection Overlay */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          left: hoveredNode.screenX + 20,
          top: hoveredNode.screenY - 20,
          background: 'rgba(0, 20, 40, 0.9)',
          border: '1px solid #00ccff',
          padding: '10px',
          borderRadius: '5px',
          pointerEvents: 'none',
          zIndex: 1000,
          color: '#fff',
          fontSize: '0.8rem'
        }}>
          <div style={{ fontWeight: 'bold', color: '#00ccff' }}>{hoveredNode.name}</div>
          <div style={{ color: '#aaa' }}>Type: {hoveredNode.type}</div>
          <div style={{ color: hoveredNode.status === 'active' ? '#00ff88' : '#ff3333' }}>
            Status: {hoveredNode.status.toUpperCase()}
          </div>
          {hoveredNode.status === 'failed' && (
            <div style={{ marginTop: '5px', color: '#ffcc00', fontStyle: 'italic' }}>
              Click to Repair ($50)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
