/**
 * useGraphData
 *
 * Transforms an ATLAS API search response into React Flow's
 * nodes and edges format, with automatic layout via dagre.
 *
 * Kept as a hook (rather than inline transform code) so the
 * transformation logic stays testable and reusable.
 */

import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

// ============================================
// Types (matching our API response)
// ============================================

export interface AtlasApiNode {
  id: string;
  label: string;
  properties: Record<string, unknown>;
}

export interface AtlasApiRelationship {
  from: string;
  to: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface AtlasSearchResult {
  query: string;
  found: boolean;
  root_entity: AtlasApiNode | null;
  nodes: AtlasApiNode[];
  relationships: AtlasApiRelationship[];
}

// ============================================
// Layout constants
// ============================================

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;
const LAYOUT_DIRECTION = "LR"; // left-to-right

// ============================================
// Hook
// ============================================

interface UseGraphDataResult {
  nodes: Node[];
  edges: Edge[];
}

export function useGraphData(
  searchResult: AtlasSearchResult | null
): UseGraphDataResult {
  return useMemo(() => {
    if (!searchResult || !searchResult.found) {
      return { nodes: [], edges: [] };
    }

    // Build a dagre graph to compute positions
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: LAYOUT_DIRECTION,
      nodesep: 60,
      ranksep: 100,
      marginx: 40,
      marginy: 40,
    });

    // Add nodes to dagre
    searchResult.nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });

    // Add edges to dagre
    searchResult.relationships.forEach((rel) => {
      dagreGraph.setEdge(rel.from, rel.to);
    });

    // Compute layout
    dagre.layout(dagreGraph);

    // Build React Flow nodes with computed positions
    const flowNodes: Node[] = searchResult.nodes.map((node) => {
      const dagreNode = dagreGraph.node(node.id);
      const displayValue =
        (node.properties.value as string) ??
        (node.properties.name as string) ??
        node.id;

      return {
        id: node.id,
        type: "default",
        position: {
          x: dagreNode.x - NODE_WIDTH / 2,
          y: dagreNode.y - NODE_HEIGHT / 2,
        },
        data: {
          label: displayValue,
        },
        // Store the original data for later use (custom nodes, evidence panel, etc.)
        // Attaching under `atlas` prevents collision with React Flow internals.
        // We'll use this in the next micro-step for custom styling.
      };
    });

    // Build React Flow edges
    const flowEdges: Edge[] = searchResult.relationships.map((rel, index) => ({
      id: `edge-${index}-${rel.from}-${rel.to}`,
      source: rel.from,
      target: rel.to,
      label: rel.type,
      type: "smoothstep",
      animated: false,
      style: {
        stroke: "#475569",
        strokeWidth: 1.5,
      },
      labelStyle: {
        fill: "#94a3b8",
        fontSize: 10,
        fontFamily: "monospace",
      },
      labelBgStyle: {
        fill: "#0f172a",
        fillOpacity: 0.9,
      },
      labelBgPadding: [4, 6],
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [searchResult]);
}
