
export const generateCityGraph = (nodeCount = 50, width = 800, height = 600) => {
    const nodes = [];
    const links = [];

    // Helper to get random coord
    const rand = (limit) => Math.floor(Math.random() * limit);

    // 1. Generate Nodes
    for (let i = 0; i < nodeCount; i++) {
        // Distribute types: 3 Power Plants, 7 Substations, Rest Buildings
        let type = 'building';
        if (i < 3) type = 'power-plant';
        else if (i < 10) type = 'substation';

        nodes.push({
            id: i,
            name: `Node ${i}`,
            type: type,
            x: rand(width),
            y: rand(height),
            status: 'active', // 'active', 'degraded', 'failed'
            hasSensor: false, // Player must place these
            // Visualization data (force graph will overwrite x/y usually unless fixed, 
            // but initial positions help)
        });
    }

    // 2. Generate Links (Minimum Spanning Tree-ish + Random connections)
    // For now, simple distance-based connecting logic to ensure some structure
    // Connect Power Plants to Substations
    nodes.filter(n => n.type === 'substation').forEach(sub => {
        // Find nearest power plant
        const plants = nodes.filter(n => n.type === 'power-plant');
        const nearest = plants.reduce((prev, curr) => {
            const distPrev = Math.hypot(prev.x - sub.x, prev.y - sub.y);
            const distCurr = Math.hypot(curr.x - sub.x, curr.y - sub.y);
            return distCurr < distPrev ? curr : prev;
        });
        links.push({ source: nearest.id, target: sub.id });
    });

    // Connect Buildings to nearest Substation
    nodes.filter(n => n.type === 'building').forEach(bldg => {
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

    // Add some random extra connections for redundancy
    for (let i = 0; i < nodeCount / 2; i++) {
        const src = rand(nodeCount);
        const tgt = rand(nodeCount);
        if (src !== tgt) {
            links.push({ source: src, target: tgt });
        }
    }

    return { nodes, links };
};
