
export const calculateEntropy = (nodes, links) => {
  // Advanced Entropy Calculation
  // H = -Sum(p * log2(p))
  // We define "state probabilities" based on system stability.
  // 
  // Factors:
  // 1. Node Status Distribution (Active vs Failed vs Unknown)

  // 1. Status Entropy
  const counts = { active: 0, degraded: 0, failed: 0, unknown: 0 };
  let totalWeight = 0;

  nodes.forEach(n => {
    let weight = 1;
    if (n.type === 'power-plant') weight = 5;
    if (n.type === 'substation') weight = 3;

    let status = n.status;
    if (!n.hasSensor) status = 'unknown'; // Unknown states increase uncertainty high

    // If 'unknown', we treat it as a separate state that adds to entropy?
    // Actually, if we want to minimize entropy, we want the system to be in ONE state (e.g. all Active).
    // Any deviation adds entropy.

    // Safety check for status
    if (!counts.hasOwnProperty(status)) status = 'unknown';

    counts[status] += weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) return 0;

  let h_status = 0;
  Object.keys(counts).forEach(key => {
    const p = counts[key] / totalWeight;
    if (p > 0) {
      h_status -= p * Math.log2(p);
    }
  });

  // Normalize H (Max entropy for 4 states is 2.0). 
  // We want a score from 0 to 10.
  // Map 0-2 -> 0-10 roughly.
  return Math.min(10, h_status * 5);
};
