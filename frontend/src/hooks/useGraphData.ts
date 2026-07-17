/**
 * useGraphData
 *
 * Transforms an ATLAS API search response into React Flow's
 * nodes and edges format, with automatic layout via dagre.
 */

import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

// ============================================
// Types
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

const NODE_WIDTH = 240;
const NODE_HEIGHT = 70;
const LAYOUT_DIRECTION = "LR";

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

    const rootId = searchResult.root_entity?.id;

    // Build a dagre graph to compute positions
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: LAYOUT_DIRECTION,
      nodesep: 40,
      ranksep: 120,
      marginx: 40,
      marginy: 40,
    });

    searchResult.nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });

    searchResult.relationships.forEach((rel) => {
      dagreGraph.setEdge(rel.from, rel.to);
    });

    dagre.layout(dagreGraph);

    // Build React Flow nodes using our custom "entity" node type
    const flowNodes: Node[] = searchResult.nodes.map((node) => {
      const dagreNode = dagreGraph.node(node.id);
      const displayValue =
        (node.properties.value as string) ??
        (node.properties.name as string) ??
        node.id;
      const riskLevel =
        (node.properties.risk_level as "low" | "medium" | "high" | undefined) ??
        "low";

      return {
        id: node.id,
        type: "entity",
        position: {
          x: dagreNode.x - NODE_WIDTH / 2,
          y: dagreNode.y - NODE_HEIGHT / 2,
        },
        data: {
          label: displayValue,
          entityLabel: node.label,
          displayValue,
          riskLevel,
          isRoot: node.id === rootId,
        },
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
