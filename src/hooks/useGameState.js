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

            // DEGRADATION LOGIC:
            // Small chance for a node to fail
            // Chance increases if connected nodes are failed? (Cascade - Todo)

            const newNodes = state.nodes.map(node => {
                // Random failure chance: 0.1% per tick per node
                if (node.status === 'active' && Math.random() < 0.001) {
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

            return {
                ...state,
                nodes: newNodes,
                timeElapsed: newTime,
                entropy: currentEntropy,
                gameOver: currentEntropy > 9.0,
                victory: newTime >= 600 && currentEntropy <= 7.0 // Must hold logic
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
                entropy: calculateEntropy(nodesWithSensor)
            };

        case ACTION_TYPES.PAUSE_TOGGLE:
            return { ...state, isPlaying: !state.isPlaying };

        default:
            return state;
    }
};

export const useGameState = () => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const timerRef = useRef(null);

    // Initial Game Setup
    useEffect(() => {
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

    return { state, dispatch };
};
