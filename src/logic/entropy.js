/**
 * Calculates the Shannon Entropy of the current system state.
 * Formula: H = -Σ p(x) log2 p(x)
 * 
 * @param {Array} nodes - List of all game nodes
 * @returns {number} Entropy value (0.0 to ~2.0 depending on log base/states)
 */
export const calculateEntropy = (nodes) => {
  if (!nodes || nodes.length === 0) return 0;

  // Define possible states for a node
  // "active", "degraded", "failed", "unknown"
  const totalNodes = nodes.length;
  const stateCounts = {
    active: 0,
    degraded: 0,
    failed: 0,
    unknown: 0
  };

  // Count occurrences of each state
  nodes.forEach(node => {
    // If a node has a sensor, we know its true state. 
    // If not, it is "unknown" from the system perspective ?? 
    // GAME DESIGN DECISION: Does the system use "unknown" as a state for calculation?
    // YES: High uncertainty (lots of unknown) should increase entropy? 
    // OR: Entropy is about the distribution of *known* states?
    // "Information Flow Management" implies we need to KNOW the state to reduce uncertainty.
    // So "Unknown" is a valid state that likely contributes to entropy or we treat it specially.
    // Let's treat "unknown" as a specific state distribution. 
    // Actually, maximum entropy occurs when all states are equally probable.
    // If everything is "unknown", that is just one state -> Entropy = 0? No.
    // Shannon entropy measures uncertainty associated with a random variable.
    // If we are 'blind', the system state is highly uncertain TO US. 
    // Let's assume for the game mechanics: 
    // We want a mix of states to be HIGH entropy (disorder).
    // We want a uniform state (all active) to be LOW entropy (order).
    
    // BUT: Shannon entropy is 0 if all nodes are the same state (e.g. all Active).
    // It is also 0 if all nodes are Failed. 
    // That might be counter-intuitive for a "Game Over" mechanic where "Chaos = Bad".
    // Usually "Chaos" means high mix of states.
    // However, the prompt says "Success = keeping entropy below critical threshold".
    // If all nodes are "Active", entropy is 0. Success.
    // If nodes start failing randomly, we have [Active, Active, Failed, Active...]. 
    // The distribution becomes mixed -> Entropy rises.
    // If 50% are Active and 50% Failed, Entropy is Max (1 bit).
    
    // What about "Unknown"?
    // If we don't have sensors, maybe we count them as "Unknown".
    // If the player places sensors, they become "Active" or "Failed".
    // If we have 50% Unknown, 50% Active -> High Entropy.
    // Strategy: Minimize "Unknown" and minimize "Failed". 
    // Ideally 100% "Active".
    
    // So, we count the states as observed by the system.
    const state = node.hasSensor ? node.status : 'unknown';
    if (stateCounts[state] !== undefined) {
      stateCounts[state]++;
    } else {
      // Fallback for any other state
      stateCounts['unknown'] = (stateCounts['unknown'] || 0) + 1;
    }
  });

  let entropy = 0;
  Object.values(stateCounts).forEach(count => {
    if (count > 0) {
      const p = count / totalNodes;
      entropy -= p * Math.log2(p);
    }
  });

  return parseFloat(entropy.toFixed(3));
};

export const MAX_POSSIBLE_ENTROPY = 2.0; // Approx max for 4 equi-probable states
