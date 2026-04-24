import { useState } from "react";
import Head from "next/head";
 
// ── Recursive Tree Renderer 
function TreeNode({ label, children, isRoot }) {
  const [open, setOpen] = useState(true);
  const hasChildren = children && Object.keys(children).length > 0;
  return (
    <div className={`tree-node ${isRoot ? "root-node" : ""}`}>
      <div
        className={`node-label ${hasChildren ? "has-children" : "leaf"}`}
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        {hasChildren && (
          <span className="toggle">{open ? "▾" : "▸"}</span>
        )}
        <span className="node-name">{label}</span>
        {isRoot && <span className="root-badge">ROOT</span>}
        {!hasChildren && !isRoot && <span className="leaf-badge">LEAF</span>}
      </div>
      {hasChildren && open && (
        <div className="node-children">
          {Object.entries(children).map(([k, v]) => (
            <TreeNode key={k} label={k} children={v} />
          ))}
        </div>
      )}
    </div>
  );
}
 
function HierarchyCard({ h, index }) {
  const treeRoot =
    h.tree && !h.has_cycle ? Object.entries(h.tree)[0] : null;
 
  return (
    <div className={`hier-card ${h.has_cycle ? "cycle-card" : ""}`}>
      <div className="card-header">
        <div className="card-title">
          <span className="card-index">#{index + 1}</span>
          <span className="card-root">Root: {h.root}</span>
        </div>
        <div className="card-badges">
          {h.has_cycle ? (
            <span className="badge badge-cycle">⟳ Cycle</span>
          ) : (
            <span className="badge badge-tree">🌲 Tree</span>
          )}
          {h.depth && (
            <span className="badge badge-depth">Depth: {h.depth}</span>
          )}
        </div>
      </div>
      <div className="card-body">
        {h.has_cycle ? (
          <div className="cycle-msg">
            <span className="cycle-icon">⟳</span>
            <span>Cycle detected — no tree structure available</span>
          </div>
        ) : treeRoot ? (
          <div className="tree-wrap">
            <TreeNode
              label={treeRoot[0]}
              children={treeRoot[1]}
              isRoot={true}
            />
          </div>
        ) : (
          <div className="cycle-msg">Empty tree</div>
        )}
      </div>
    </div>
  );
}
 
// ── Main Page
export default function Home() {
  const DEFAULT = `A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->H, G->I, hello, 1->2, A->`;
 
  const [input, setInput] = useState(DEFAULT);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  async function handleSubmit() {
    setError("");
    setResult(null);
    setLoading(true);
 
    
    const raw = input
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
 
    try {
      const res = await fetch("/api/bfhl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: raw }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);
    } catch (e) {
      setError("API call failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <>
      <Head>
        <title>BFHL — Node Hierarchy Explorer</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </Head>
 
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <span className="logo-bracket">[</span>
              BFHL
              <span className="logo-bracket">]</span>
            </div>
            <p className="tagline">Node Hierarchy Explorer</p>
          </div>
          <div className="header-deco" aria-hidden="true">
            {["A→B", "B→C", "C→D"].map((t, i) => (
              <span key={i} className="deco-edge" style={{ "--i": i }}>
                {t}
              </span>
            ))}
          </div>
        </header>
 
        <main className="main">
          {/* Input Panel */}
          <section className="input-section">
            <label className="section-label">
              <span className="label-num">01</span> Input Edges
            </label>
            <p className="section-hint">
              Enter edges separated by commas or new lines. Format:{" "}
              <code>A-&gt;B</code>
            </p>
            <textarea
              className="edge-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="A->B, B->C, C->D..."
              rows={5}
            />
            <button
              className={`submit-btn ${loading ? "loading" : ""}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Processing…
                </>
              ) : (
                "→ Analyze Hierarchy"
              )}
            </button>
          </section>
 
          {/* Error */}
          {error && <div className="error-box">⚠ {error}</div>}
 
          {/* Results */}
          {result && (
            <div className="results">
              {/* Identity Strip */}
              <div className="identity-strip">
                <div className="identity-item">
                  <span className="id-label">User ID</span>
                  <span className="id-value">{result.user_id}</span>
                </div>
                <div className="identity-item">
                  <span className="id-label">Email</span>
                  <span className="id-value">{result.email_id}</span>
                </div>
                <div className="identity-item">
                  <span className="id-label">Roll No.</span>
                  <span className="id-value">{result.college_roll_number}</span>
                </div>
              </div>
 
              {/* Summary Stats */}
              <section className="summary-section">
                <label className="section-label">
                  <span className="label-num">02</span> Summary
                </label>
                <div className="stat-grid">
                  <div className="stat-card">
                    <span className="stat-num">
                      {result.summary.total_trees}
                    </span>
                    <span className="stat-name">Valid Trees</span>
                  </div>
                  <div className="stat-card stat-cycle">
                    <span className="stat-num">
                      {result.summary.total_cycles}
                    </span>
                    <span className="stat-name">Cyclic Groups</span>
                  </div>
                  <div className="stat-card stat-root">
                    <span className="stat-num">
                      {result.summary.largest_tree_root || "—"}
                    </span>
                    <span className="stat-name">Deepest Tree Root</span>
                  </div>
                </div>
              </section>
 
              {/* Hierarchies */}
              <section className="hierarchies-section">
                <label className="section-label">
                  <span className="label-num">03</span> Hierarchies (
                  {result.hierarchies.length})
                </label>
                <div className="hier-grid">
                  {result.hierarchies.map((h, i) => (
                    <HierarchyCard key={i} h={h} index={i} />
                  ))}
                </div>
              </section>
 
              {/* Side Info */}
              <div className="side-info-grid">
                {/* Invalid */}
                <section className="info-section">
                  <label className="section-label">
                    <span className="label-num">04</span> Invalid Entries (
                    {result.invalid_entries.length})
                  </label>
                  {result.invalid_entries.length === 0 ? (
                    <p className="none-msg">✓ None</p>
                  ) : (
                    <div className="tag-list">
                      {result.invalid_entries.map((e, i) => (
                        <span key={i} className="tag tag-invalid">
                          {e || '""'}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
 
                {/* Duplicates */}
                <section className="info-section">
                  <label className="section-label">
                    <span className="label-num">05</span> Duplicate Edges (
                    {result.duplicate_edges.length})
                  </label>
                  {result.duplicate_edges.length === 0 ? (
                    <p className="none-msg">✓ None</p>
                  ) : (
                    <div className="tag-list">
                      {result.duplicate_edges.map((e, i) => (
                        <span key={i} className="tag tag-dup">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              </div>
 
              {/* Raw JSON Toggle */}
              <details className="raw-json">
                <summary>View Raw JSON Response</summary>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </details>
            </div>
          )}
        </main>
 
        <footer className="footer">
          Built for SRM Full Stack Engineering Challenge · POST /bfhl
        </footer>
      </div>
 
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
        :root {
          --bg: #0a0a0f;
          --surface: #13131a;
          --surface2: #1c1c27;
          --border: #2a2a3d;
          --accent: #7c6af7;
          --accent2: #f76a8f;
          --green: #4af7a8;
          --yellow: #f7d06a;
          --text: #e8e8f0;
          --muted: #7878a0;
          --font-display: 'Syne', sans-serif;
          --font-mono: 'Space Mono', monospace;
          --radius: 10px;
        }
 
        html { scroll-behavior: smooth; }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-display);
          min-height: 100vh;
          line-height: 1.6;
        }
 
        /* ── Header ── */
        .header {
          position: relative;
          padding: 3rem 2rem 2.5rem;
          border-bottom: 1px solid var(--border);
          overflow: hidden;
          background: linear-gradient(135deg, #0d0d18 0%, #0a0a0f 100%);
        }
        .header-inner { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }
        .logo {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
          line-height: 1;
        }
        .logo-bracket { color: var(--accent); }
        .tagline { color: var(--muted); font-family: var(--font-mono); font-size: 0.8rem; margin-top: 0.4rem; letter-spacing: 0.1em; }
        .header-deco {
          position: absolute;
          right: 2rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          opacity: 0.15;
        }
        .deco-edge {
          font-family: var(--font-mono);
          font-size: 1.4rem;
          color: var(--accent);
          animation: fadeSlide 2s ease forwards;
          opacity: 0;
          animation-delay: calc(var(--i) * 0.3s);
        }
        @keyframes fadeSlide { to { opacity: 1; transform: translateX(0); } from { opacity: 0; transform: translateX(20px); } }
 
        /* ── Layout ── */
        .main { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
 
        /* ── Labels ── */
        .section-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.7rem;
          font-family: var(--font-mono);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 1rem;
        }
        .label-num {
          background: var(--accent);
          color: #fff;
          font-size: 0.6rem;
          padding: 0.1em 0.45em;
          border-radius: 3px;
          font-weight: 700;
        }
        .section-hint { font-size: 0.85rem; color: var(--muted); margin-bottom: 0.8rem; }
        .section-hint code { background: var(--surface2); padding: 0.1em 0.4em; border-radius: 4px; font-family: var(--font-mono); color: var(--accent); }
 
        /* ── Input ── */
        .input-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.8rem;
          margin-bottom: 1.5rem;
        }
        .edge-input {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          padding: 0.9rem 1rem;
          resize: vertical;
          transition: border-color 0.2s;
          display: block;
          margin-bottom: 1rem;
        }
        .edge-input:focus { outline: none; border-color: var(--accent); }
 
        .submit-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 0.75rem 2rem;
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.2s, transform 0.1s;
        }
        .submit-btn:hover:not(:disabled) { background: #6a58e8; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
 
        /* ── Error ── */
        .error-box {
          background: rgba(247,106,143,0.12);
          border: 1px solid var(--accent2);
          color: var(--accent2);
          padding: 1rem 1.2rem;
          border-radius: var(--radius);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }
 
        /* ── Identity Strip ── */
        .identity-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 3px solid var(--accent);
          border-radius: var(--radius);
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
        }
        .identity-item { display: flex; flex-direction: column; gap: 0.1rem; }
        .id-label { font-size: 0.65rem; font-family: var(--font-mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }
        .id-value { font-size: 0.9rem; font-weight: 600; color: var(--text); font-family: var(--font-mono); }
 
        /* ── Summary Stats ── */
        .summary-section { margin-bottom: 2rem; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.2rem 1rem;
          text-align: center;
          transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: var(--accent); }
        .stat-num {
          display: block;
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--green);
          line-height: 1;
        }
        .stat-cycle .stat-num { color: var(--accent2); }
        .stat-root .stat-num { color: var(--accent); font-size: 1.8rem; }
        .stat-name { font-size: 0.7rem; font-family: var(--font-mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.4rem; display: block; }
 
        /* ── Hierarchy Cards ── */
        .hierarchies-section { margin-bottom: 2rem; }
        .hier-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; }
        .hier-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .hier-card:hover { border-color: var(--accent); }
        .cycle-card { border-color: rgba(247,106,143,0.3); }
        .cycle-card:hover { border-color: var(--accent2); }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.9rem 1.2rem;
          border-bottom: 1px solid var(--border);
          background: var(--surface2);
        }
        .card-title { display: flex; align-items: center; gap: 0.6rem; }
        .card-index { font-size: 0.65rem; font-family: var(--font-mono); color: var(--muted); }
        .card-root { font-weight: 700; font-size: 0.95rem; }
        .card-badges { display: flex; gap: 0.4rem; }
        .badge {
          font-size: 0.65rem;
          font-family: var(--font-mono);
          padding: 0.2em 0.6em;
          border-radius: 100px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .badge-tree { background: rgba(74,247,168,0.15); color: var(--green); }
        .badge-cycle { background: rgba(247,106,143,0.15); color: var(--accent2); }
        .badge-depth { background: rgba(124,106,247,0.15); color: var(--accent); }
        .card-body { padding: 1.2rem; }
        .cycle-msg {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          color: var(--accent2);
          font-family: var(--font-mono);
          font-size: 0.8rem;
        }
        .cycle-icon { font-size: 1.4rem; }
 
        /* ── Tree ── */
        .tree-wrap { font-family: var(--font-mono); font-size: 0.82rem; }
        .tree-node { position: relative; }
        .node-children { padding-left: 1.4rem; border-left: 1px dashed var(--border); margin-left: 0.6rem; margin-top: 0.3rem; }
        .node-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.5rem;
          border-radius: 5px;
          cursor: default;
          margin-bottom: 0.2rem;
          transition: background 0.15s;
        }
        .node-label.has-children { cursor: pointer; }
        .node-label:hover { background: var(--surface2); }
        .toggle { color: var(--muted); font-size: 0.7rem; width: 0.8rem; }
        .node-name { font-weight: 700; color: var(--text); }
        .root-badge, .leaf-badge {
          font-size: 0.55rem;
          padding: 0.1em 0.4em;
          border-radius: 100px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .root-badge { background: rgba(124,106,247,0.2); color: var(--accent); }
        .leaf-badge { background: rgba(74,247,168,0.1); color: var(--green); }
 
        /* ── Side Info ── */
        .side-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        .info-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.2rem;
        }
        .none-msg { color: var(--green); font-family: var(--font-mono); font-size: 0.82rem; }
        .tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          padding: 0.25em 0.7em;
          border-radius: 4px;
          font-weight: 700;
        }
        .tag-invalid { background: rgba(247,106,143,0.12); color: var(--accent2); border: 1px solid rgba(247,106,143,0.25); }
        .tag-dup { background: rgba(247,208,106,0.12); color: var(--yellow); border: 1px solid rgba(247,208,106,0.25); }
 
        /* ── Raw JSON ── */
        .raw-json {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .raw-json summary {
          padding: 0.8rem 1.2rem;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: var(--muted);
          cursor: pointer;
          letter-spacing: 0.06em;
        }
        .raw-json summary:hover { color: var(--text); }
        .raw-json pre {
          padding: 1rem 1.2rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--green);
          overflow-x: auto;
          border-top: 1px solid var(--border);
          max-height: 400px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }
 
        /* ── Footer ── */
        .footer {
          text-align: center;
          padding: 1.5rem;
          color: var(--muted);
          font-size: 0.75rem;
          font-family: var(--font-mono);
          border-top: 1px solid var(--border);
          letter-spacing: 0.05em;
        }
 
        @media (max-width: 600px) {
          .stat-grid { grid-template-columns: 1fr; }
          .side-info-grid { grid-template-columns: 1fr; }
          .hier-grid { grid-template-columns: 1fr; }
          .logo { font-size: 2rem; }
          .header-deco { display: none; }
        }
      `}</style>
    </>
  );
}