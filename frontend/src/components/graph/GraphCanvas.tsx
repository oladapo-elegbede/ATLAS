/**
 * GraphCanvas
 *
 * The visual center of the ATLAS investigation experience.
 * Renders the fraud network as an interactive, animated graph.
 */

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { EntityNode } from "./EntityNode";

// ============================================
// Custom node type registry
// ============================================

const nodeTypes = {
  entity: EntityNode,
};

// ============================================
// Component
// ============================================

interface GraphCanvasProps {
  nodes?: Node[];
  edges?: Edge[];
}

export function GraphCanvas({ nodes = [], edges = [] }: GraphCanvasProps) {
  const memoizedNodes = useMemo(() => nodes, [nodes]);
  const memoizedEdges = useMemo(() => edges, [edges]);

  return (
    <div
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    >
      <ReactFlow
        nodes={memoizedNodes}
        edges={memoizedEdges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#334155"
        />

        <Controls
          className="!bg-slate-900/80 !border !border-slate-800 !rounded-lg !shadow-lg"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
