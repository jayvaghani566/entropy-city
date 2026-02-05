
export const generateCityGraph = (nodeCount = 50, _width, _height) => { // Width/Height ignored for grid
    const nodes = [];
    const links = [];
    const MAP_SIZE = 20;
    const grid = new Float32Array(MAP_SIZE * MAP_SIZE); // 0=empty, 1=occupied

    const randInt = (limit) => Math.floor(Math.random() * limit);
    const getIdx = (x, y) => y * MAP_SIZE + x;

    // 1. Generate Nodes on Grid
    // We want clusters. Start with Power Plants.

    let created = 0;
    let attempts = 0;

    const tryPlace = (type, preferredX, preferredY) => {
        let x = preferredX ?? randInt(MAP_SIZE);
        let y = preferredY ?? randInt(MAP_SIZE);
        if (preferredX !== undefined && preferredY !== undefined) {
            // Spread logic if occupied?
            // Simple random for now if specific spot taken
        }

        // Retry a few times to find spot
        for (let k = 0; k < 10; k++) {
            if (grid[getIdx(x, y)] === 0) {
                grid[getIdx(x, y)] = 1;
                nodes.push({
                    id: created,
                    name: `Node ${created}`,
                    type: type,
                    x: x,
                    y: y,
                    status: 'active',
                    hasSensor: false
                });
                created++;
                return true;
            }
            x = randInt(MAP_SIZE);
            y = randInt(MAP_SIZE);
        }
        return false;
    };

    // Place 3 Power Plants (Spread out)
    tryPlace('power-plant', 2, 2);
    tryPlace('power-plant', 15, 15);
    tryPlace('power-plant', 15, 2);

    // Place 8 Substations
    for (let i = 0; i < 8; i++) {
        tryPlace('substation');
    }

    // Place Buildings
    while (created < nodeCount && attempts < 1000) {
        // Cluster around substations? 
        // Fully random for MVP grid
        tryPlace('residential');
        attempts++;
    }

    // 2. Generate Links (Grid aware?)
    // For visuals we just allow direct lines, but maybe check distance
    // Minimum spanning tree + extras logic remains similar but using Grid Distance (Manhattan or Euclidian)

    // Power Plants -> Substations
    nodes.filter(n => n.type === 'substation').forEach(sub => {
        const plants = nodes.filter(n => n.type === 'power-plant');
        const nearest = plants.reduce((prev, curr) => {
            const distPrev = Math.hypot(prev.x - sub.x, prev.y - sub.y);
            const distCurr = Math.hypot(curr.x - sub.x, curr.y - sub.y);
            return distCurr < distPrev ? curr : prev;
        });
        links.push({ source: nearest.id, target: sub.id });
    });

    // Buildings -> Substations
    nodes.filter(n => n.type === 'residential').forEach(bldg => {
        const substations = nodes.filter(n => n.type === 'substation');
        if (substations.length > 0) {
            const nearest = substations.reduce((prev, curr) => {
                const distPrev = Math.hypot(prev.x - bldg.x, prev.y - bldg.y);
                const distCurr = Math.hypot(curr.x - bldg.x, curr.y - bldg.y);
                return distCurr < distPrev ? curr : prev;
            });
            links.push({ source: nearest.id, target: bldg.id });
        }
    });

    // Random extras
    for (let i = 0; i < nodeCount / 2; i++) {
        const srcId = randInt(nodes.length);
        const tgtId = randInt(nodes.length);
        if (srcId !== tgtId) {
            links.push({ source: nodes[srcId].id, target: nodes[tgtId].id });
        }
    }

    return { nodes, links };
};
