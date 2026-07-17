/**
 * ATLAS - Civilian Threat Intelligence Platform
 * Root application component.
 *
 * Manages two view states:
 *   - "landing":   the search entry point
 *   - "workspace": the investigation workspace after a successful search
 */

import { useState, type KeyboardEvent } from "react";

import { GraphCanvas } from "./components/graph/GraphCanvas";
import { useGraphData } from "./hooks/useGraphData";

// ============================================
// Types
// ============================================

type EntityLabel = "Email" | "Domain" | "Company" | "Person" | "Phone" | string;

interface AtlasNode {
  id: string;
  label: EntityLabel;
  properties: Record<string, unknown>;
}

interface AtlasRelationship {
  from: string;
  to: string;
  type: string;
  properties: Record<string, unknown>;
}

interface SearchResult {
  query: string;
  found: boolean;
  root_entity: AtlasNode | null;
  nodes: AtlasNode[];
  relationships: AtlasRelationship[];
}

type ViewState = "landing" | "workspace";

// ============================================
// Root Component
// ============================================

function App() {
  const [view, setView] = useState<ViewState>("landing");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isSearching) {
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/search?q=${encodeURIComponent(trimmedQuery)}`
      );

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const data: SearchResult = await response.json();

      if (data.found) {
        setSearchResult(data);
        setView("workspace");
      } else {
        console.warn("[ATLAS] Entity not found:", data.query);
      }
    } catch (error) {
      console.error("[ATLAS] Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleReturnToLanding = () => {
    setView("landing");
    setSearchResult(null);
    setQuery("");
  };

  return (
    <>
      {view === "landing" && (
        <LandingView
          query={query}
          setQuery={setQuery}
          isSearching={isSearching}
          onKeyDown={handleKeyDown}
        />
      )}
      {view === "workspace" && searchResult && (
        <WorkspaceView
          searchResult={searchResult}
          onReturn={handleReturnToLanding}
        />
      )}
    </>
  );
}

export default App;

// ============================================
// Landing View
// ============================================

interface LandingViewProps {
  query: string;
  setQuery: (value: string) => void;
  isSearching: boolean;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

function LandingView({ query, setQuery, isSearching, onKeyDown }: LandingViewProps) {
  return (
    <div className="relative flex items-center justify-center w-full min-h-screen bg-slate-950 overflow-hidden animate-fadeIn">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.08)_0%,_transparent_60%)] pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold tracking-[0.35em] text-cyan-400 mb-3">
            ATLAS
          </h1>
          <p className="text-sm text-slate-500 uppercase tracking-[0.3em]">
            Civilian Threat Intelligence
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-0 group-focus-within:opacity-40 blur transition duration-500" />

          <div className="relative flex items-center bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg group-focus-within:border-cyan-500/60 transition-colors duration-300">
            <div className="pl-5 pr-3 text-slate-500">
              {isSearching ? (
                <svg className="w-5 h-5 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={isSearching}
              placeholder="Search email, domain, phone, or company..."
              className="flex-1 bg-transparent py-5 pr-5 text-slate-100 placeholder-slate-500 focus:outline-none text-base disabled:opacity-60"
              autoFocus
            />

            <div className="hidden sm:flex items-center gap-1.5 px-4 mr-2 py-1.5 bg-slate-800/60 border border-slate-700 rounded text-xs text-slate-400 font-mono">
              <span>{"\u21B5"}</span>
              <span>Enter</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600 uppercase tracking-widest">
            Try: <span className="text-slate-400">james.chen@meridian-global.co</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">
          System operational
        </p>
      </div>
    </div>
  );
}

// ============================================
// Workspace View
// ============================================

interface WorkspaceViewProps {
  searchResult: SearchResult;
  onReturn: () => void;
}

function WorkspaceView({ searchResult, onReturn }: WorkspaceViewProps) {
  const { nodes: graphNodes, edges: graphEdges } = useGraphData(searchResult);
  const rootLabel = searchResult.root_entity?.label ?? "Entity";
  const rootValue =
    (searchResult.root_entity?.properties?.value as string) ??
    (searchResult.root_entity?.properties?.name as string) ??
    searchResult.query;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-950 text-slate-100 animate-fadeIn">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-6">
          <button
            onClick={onReturn}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-lg font-bold tracking-[0.25em] text-cyan-400">
              ATLAS
            </span>
          </button>

          <div className="w-px h-6 bg-slate-800" />

          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded">
              {rootLabel}
            </span>
            <span className="text-sm text-slate-300 font-mono">
              {rootValue}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            Investigating
          </span>
        </div>
      </header>

      {/* Graph Canvas — React Flow */}
      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.06)_0%,_transparent_70%)] pointer-events-none z-10" />

        <GraphCanvas nodes={graphNodes} edges={graphEdges} />
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-3 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-sm text-xs font-mono z-20">
        <div className="flex items-center gap-6 text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 uppercase tracking-widest">Entities</span>
            <span className="text-cyan-400 font-semibold">{searchResult.nodes.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 uppercase tracking-widest">Relationships</span>
            <span className="text-cyan-400 font-semibold">{searchResult.relationships.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 uppercase tracking-widest">Depth</span>
            <span className="text-cyan-400 font-semibold">3 hops</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="uppercase tracking-widest">Neo4j</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="uppercase tracking-widest">Connected</span>
        </div>
      </footer>
    </div>
  );
}

