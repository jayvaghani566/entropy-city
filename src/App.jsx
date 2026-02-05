import React, { useState, useMemo } from 'react';
import { useGameState, ACTION_TYPES } from './hooks/useGameState';
import GameBoard from './components/GameBoard';
import Dashboard from './components/Dashboard';

function App() {
  const { state, dispatch } = useGameState();
  const [interactionMode, setInteractionMode] = useState('sensor'); // 'sensor' or 'connect'

  // Calculate generic counts for Dashboard
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

  const handleNodeClick = (node) => {
    if (state.gameOver) return;

    if (interactionMode === 'sensor') {
      if (!node.hasSensor) {
        dispatch({ type: ACTION_TYPES.PLACE_SENSOR, payload: node.id });
      }
    }
    // TODO: Connect logic
  };

  const handleDashboardAction = (action) => {
    if (action === 'TOGGLE_PAUSE') {
      dispatch({ type: ACTION_TYPES.PAUSE_TOGGLE });
    } else if (action === 'MODE_SENSOR') {
      setInteractionMode('sensor');
    } else if (action === 'MODE_CONNECT') {
      setInteractionMode('connect');
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
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <GameBoard
        nodes={state.nodes}
        links={state.links}
        onNodeClick={handleNodeClick}
        interactionMode={interactionMode}
      />
      <Dashboard
        entropy={state.entropy}
        budget={state.budget}
        timeElapsed={state.timeElapsed}
        onAction={handleDashboardAction}
        currentMode={interactionMode}
        isPlaying={state.isPlaying}
        nodeCounts={nodeCounts}
      />
    </div>
  );
}

export default App;
