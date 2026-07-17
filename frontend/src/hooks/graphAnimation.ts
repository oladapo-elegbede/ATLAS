/**
 * Graph animation utilities.
 *
 * Computes the reveal order for nodes during the graph expansion
 * animation, using breadth-first traversal from the root entity.
 */

interface AtlasApiNode {
  id: string;
}

interface AtlasApiRelationship {
  from: string;
  to: string;
}

/**
 * Computes the "hop distance" from the root node to every other node.
 * Returns a Map of nodeId -> hop distance (0 = root, 1 = direct neighbor, etc).
 *
 * Nodes not reachable from the root get a hop distance equal to the maximum
 * distance found + 1 (so they still appear, just last).
 */
export function computeHopDistances(
  rootId: string | undefined,
  nodes: AtlasApiNode[],
  relationships: AtlasApiRelationship[]
): Map<string, number> {
  const distances = new Map<string, number>();

  if (!rootId) {
    // No root — all nodes get distance 0 (appear simultaneously)
    nodes.forEach((n) => distances.set(n.id, 0));
    return distances;
  }

  // Build adjacency list (treat edges as undirected for reveal purposes)
  const adjacency = new Map<string, Set<string>>();
  nodes.forEach((n) => adjacency.set(n.id, new Set()));

  relationships.forEach((rel) => {
    adjacency.get(rel.from)?.add(rel.to);
    adjacency.get(rel.to)?.add(rel.from);
  });

  // BFS from root
  const queue: Array<{ id: string; distance: number }> = [
    { id: rootId, distance: 0 },
  ];
  distances.set(rootId, 0);

  while (queue.length > 0) {
    const { id, distance } = queue.shift()!;
    const neighbors = adjacency.get(id) ?? new Set();

    neighbors.forEach((neighborId) => {
      if (!distances.has(neighborId)) {
        distances.set(neighborId, distance + 1);
        queue.push({ id: neighborId, distance: distance + 1 });
      }
    });
  }

  // Any unreachable nodes get max distance + 1
  const maxDistance = Math.max(...Array.from(distances.values()), 0);
  nodes.forEach((n) => {
    if (!distances.has(n.id)) {
      distances.set(n.id, maxDistance + 1);
    }
  });

  return distances;
}

/**
 * Given a hop distance, returns the animation delay in milliseconds
 * for when that node should start appearing.
 *
 * Delays are chosen so the entire reveal takes about 2.5 seconds
 * regardless of graph depth.
 */
export function computeAnimationDelay(hopDistance: number): number {
  const STAGGER_PER_HOP_MS = 400;
  const WITHIN_HOP_JITTER_MS = 80;

  // Base delay by hop, plus a tiny random offset within each hop
  // so nodes at the same hop don't appear perfectly simultaneously.
  const jitter = Math.random() * WITHIN_HOP_JITTER_MS;
  return hopDistance * STAGGER_PER_HOP_MS + jitter;
}
