/**
 * EntityNode
 *
 * Custom React Flow node component representing an ATLAS entity.
 * Renders an icon, label, and value with color coding by entity type.
 * Applies a staggered reveal animation based on hop distance from root.
 */

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Mail, Globe, Building2, User, Phone, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ============================================
// Entity type styling map
// ============================================

interface EntityStyle {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}

const ENTITY_STYLES: Record<string, EntityStyle> = {
  Email: {
    icon: Mail,
    color: "text-cyan-400",
    bgColor: "bg-cyan-950/40",
    borderColor: "border-cyan-500/40",
    glowColor: "shadow-cyan-500/20",
  },
  Domain: {
    icon: Globe,
    color: "text-purple-400",
    bgColor: "bg-purple-950/40",
    borderColor: "border-purple-500/40",
    glowColor: "shadow-purple-500/20",
  },
  Company: {
    icon: Building2,
    color: "text-slate-300",
    bgColor: "bg-slate-800/60",
    borderColor: "border-slate-500/40",
    glowColor: "shadow-slate-500/20",
  },
  Person: {
    icon: User,
    color: "text-amber-400",
    bgColor: "bg-amber-950/40",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/20",
  },
  Phone: {
    icon: Phone,
    color: "text-emerald-400",
    bgColor: "bg-emerald-950/40",
    borderColor: "border-emerald-500/40",
    glowColor: "shadow-emerald-500/20",
  },
};

const DEFAULT_STYLE: EntityStyle = {
  icon: HelpCircle,
  color: "text-slate-400",
  bgColor: "bg-slate-900/60",
  borderColor: "border-slate-700",
  glowColor: "shadow-slate-500/20",
};

// ============================================
// Node data shape
// ============================================

export interface EntityNodeData {
  label: string;
  entityLabel: string;
  displayValue: string;
  riskLevel?: "low" | "medium" | "high";
  isRoot?: boolean;
  animationDelay?: number;
  [key: string]: unknown;
}

// ============================================
// Component
// ============================================

function EntityNodeComponent({ data }: NodeProps) {
  const nodeData = data as EntityNodeData;
  const style = ENTITY_STYLES[nodeData.entityLabel] ?? DEFAULT_STYLE;
  const Icon = style.icon;

  const isHighRisk = nodeData.riskLevel === "high";
  const isRoot = nodeData.isRoot === true;
  const animationDelay = nodeData.animationDelay ?? 0;

  return (
    <div
      className="relative animate-nodeReveal"
      style={{
        animationDelay: `${animationDelay}ms`,
        // Hide initially (until the animation kicks in) to avoid flash
        opacity: 0,
        animationFillMode: "forwards",
      }}
    >
      {/* Ambient risk pulse */}
      {isHighRisk && (
        <div className="absolute -inset-1 rounded-lg bg-red-500/20 blur-md animate-pulse pointer-events-none" />
      )}

      {/* Root entity emphasis ring */}
      {isRoot && (
        <div className="absolute -inset-0.5 rounded-lg bg-cyan-500/30 blur-sm pointer-events-none" />
      )}

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-transparent !border-transparent !w-1 !h-1"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-transparent !border-transparent !w-1 !h-1"
      />

      {/* Main card */}
      <div
        className={`
          relative flex items-center gap-3 px-4 py-3 min-w-[200px] max-w-[280px]
          ${style.bgColor} ${style.borderColor}
          border rounded-lg backdrop-blur-sm
          shadow-lg ${style.glowColor}
          transition-all duration-200
        `}
      >
        <div className={`flex-shrink-0 ${style.color}`}>
          <Icon size={18} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-[9px] font-mono uppercase tracking-widest ${style.color} opacity-80`}
            >
              {nodeData.entityLabel}
            </span>
            {isHighRisk && (
              <span className="px-1 py-0 text-[8px] font-mono uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30 rounded">
                High Risk
              </span>
            )}
          </div>

          <div className="text-sm text-slate-100 font-medium truncate">
            {nodeData.displayValue}
          </div>
        </div>
      </div>
    </div>
  );
}

export const EntityNode = memo(EntityNodeComponent);
