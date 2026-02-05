# Entropy City: Information Flow Management Simulator

A city-building strategy game where players manage information flow in a power grid to minimize system entropy.

## Concept
In **Entropy City**, you are the operator of a futuristic smart grid. Your goal is to keep the system's entropy (uncertainty/disorder) low. You achieve this by:
- **Placing Sensors** ($100): Reveals the true state of nodes, reducing uncertainty.
- **Monitoring Health**: Nodes can degrade or fail.
- **Surviving**: Keep entropy below critical levels for 10 minutes to win.

**Entropy Formula**: $H = -\sum p(x) \log_2 p(x)$
Calculated based on the probablity distribution of node states (Active, Degraded, Failed, Unknown).

## Tech Stack
- **Frontend**: React (Vite)
- **Visualization**: `react-force-graph-2d` (Canvas/ThreeJS)
- **State Management**: React Hooks + Context
- **Backend**: Firebase Realtime Database (Configurable)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build for Production**
   ```bash
   npm run build
   ```

## Firebase Setup
To enable Save/Load features:
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Create a **Realtime Database**.
3. Copy your project configuration object.
4. Replace the placeholders in `src/firebase/config.js`.

## Gameplay Controls
- **Click Node** (Sensor Mode): Spend $100 to place a sensor.
- **Right Panel**: Shows system stats (Active/Failed count).
- **Top Bar**: Entropy Score (Green=Good, Red=Bad), Timer, Budget.
- **Events**: Nodes may fail randomly over time.

## License
MIT
