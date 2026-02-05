import { useReducer, useEffect, useCallback, useRef } from 'react';
import { calculateEntropy } from '../logic/entropy';
import { generateCityGraph } from '../utils/graphGenerator';

// Initial Configuration
const INITIAL_BUDGET = 1000;
const NODE_COUNT = 40; // Reduced slightly for clarity

export const ACTION_TYPES = {
    INIT_GAME: 'INIT_GAME',
    TICK: 'TICK',
    PLACE_SENSOR: 'PLACE_SENSOR',
    ADD_CONNECTION: 'ADD_CONNECTION',
    PAUSE_TOGGLE: 'PAUSE_TOGGLE',
    SET_SPEED: 'SET_SPEED',
    GAME_OVER: 'GAME_OVER'
};

const initialState = {
    nodes: [], // Array of { id, x, y, type, status, hasSensor }
    links: [], // Array of { source, target }
    entropy: 0,
    budget: INITIAL_BUDGET,
    timeElapsed: 0, // seconds
    isPlaying: false,
    gameSpeed: 1,
    gameOver: false,
    victory: false,
    eventLog: [{ time: 0, message: 'Simulation initialized.', type: 'info' }],
    history: []
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPES.INIT_GAME:
            return {
                ...state,
                nodes: action.payload.nodes,
                links: action.payload.links,
                entropy: calculateEntropy(action.payload.nodes)
            };

        case ACTION_TYPES.TICK:
            if (!state.isPlaying || state.gameOver) return state;

            const newTime = state.timeElapsed + 1;
            let newLog = [...state.eventLog]; // Clone log

            // DEGRADATION LOGIC:
            // Small chance for a node to fail
            // Chance increases if connected nodes are failed? (Cascade - Todo)

            const newNodes = state.nodes.map(node => {
                // Random failure chance: 0.1% per tick per node
                if (node.status === 'active' && Math.random() < 0.001) {
                    newLog.unshift({
                        time: newTime,
                        message: `Failure detected at ${node.name || node.id}`,
                        type: 'critical'
                    });
                    return { ...node, status: 'failed' };
                }
                // Random recovery attempt? Or manual fix only?
                // Prompt says "Events: Blackout, Sensor Failure".
                // Real-time entropy depends on state.
                // Maybe degrade to "degraded" first.
                return node;
            });

            // Recalculate Entropy
            const currentEntropy = calculateEntropy(newNodes);

            // Check Win/Loss
            // Victory: 10 mins = 600 seconds
            // Loss: Entropy > 9.0 for 30s. We need to track "highEntropyDuration".
            // Simplified: Instant fail if > 9.0 for now, or just track it.

            // Limit log size
            if (newLog.length > 20) newLog = newLog.slice(0, 20);

            return {
                ...state,
                nodes: newNodes,
                timeElapsed: newTime,
                entropy: currentEntropy,
                gameOver: currentEntropy > 9.0,
                victory: newTime >= 600 && currentEntropy <= 7.0, // Must hold logic
                eventLog: newLog
            };

        case ACTION_TYPES.PLACE_SENSOR:
            const nodeId = action.payload;
            if (state.budget < 100) return state;

            const nodesWithSensor = state.nodes.map(node =>
                node.id === nodeId ? { ...node, hasSensor: true } : node
            );

            return {
                ...state,
                nodes: nodesWithSensor,
                budget: state.budget - 100,
                entropy: calculateEntropy(nodesWithSensor, state.links)
            };

        case ACTION_TYPES.PAUSE_TOGGLE:
            return { ...state, isPlaying: !state.isPlaying };

        case ACTION_TYPES.ADD_LINK: {
            // Check cost
            if (state.budget < 50) return state; // Cost 50

            // Check if link exists
            const { source, target } = action.payload;
            const exists = state.links.some(l =>
                (l.source === source && l.target === target) ||
                (l.source === target && l.target === source)
            );
            if (exists) return state;

            // Add Link (using IDs)
            // Note: GameCanvas renders links using object refs if D3, but we use raw IDs or objects.
            // Our generator makes object refs for D3 but our simple renderer handles simple objects?
            // GameCanvas expects {source: {id...}, target: {id...}} OR {source: id, target: id}
            // Let's stick to IDs for state simplicity if possible, or object structure.
            // The generator effectively returns whatever D3-force might have mutated if we ran it, 
            // but we aren't running D3-force anymore in V2!
            // So Generator just returns { id: ... } objects.

            return {
                ...state,
                budget: state.budget - 50,
                links: [...state.links, { source: source, target: target }]
            };
        }

        case 'LOAD_GAME':
            return {
                ...state,
                ...action.payload,
                nodes: action.payload.nodes || [],
                links: action.payload.links || [],
                // Ensure helper fields are reset if needed
                isPlaying: false
            };

        default:
            return state;
    }
};

import { ref, set, get, child } from 'firebase/database';
import { db } from '../firebase/config';

// ... existing reducer ...

export const useGameState = () => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const timerRef = useRef(null);

    // Initial Game Setup
    useEffect(() => {
        // Only gen graph if no load happening? 
        // For MVP, we auto-gen. Load will overwrite.
        const { nodes, links } = generateCityGraph(NODE_COUNT);
        dispatch({ type: ACTION_TYPES.INIT_GAME, payload: { nodes, links } });
    }, []);

    // Game Loop
    useEffect(() => {
        if (state.isPlaying && !state.gameOver && !state.victory) {
            timerRef.current = setInterval(() => {
                dispatch({ type: ACTION_TYPES.TICK });
            }, 1000 / state.gameSpeed);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [state.isPlaying, state.gameSpeed, state.gameOver, state.victory]);

    // Persistence Functions
    const saveGame = async () => {
        try {
            await set(ref(db, 'savegame'), state);
            alert('Game Saved Successfully!'); // Simple feedback
        } catch (e) {
            console.error(e);
            alert('Save Failed: ' + e.message);
        }
    };

    const loadGame = async () => {
        try {
            const snapshot = await get(child(ref(db), 'savegame'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                // We need a LOAD_GAME action
                dispatch({ type: 'LOAD_GAME', payload: data });
                alert('Game Loaded!');
            } else {
                alert('No save game found.');
            }
        } catch (e) {
            console.error(e);
            alert('Load Failed: ' + e.message);
        }
    };

    return { state, dispatch, saveGame, loadGame };
};
