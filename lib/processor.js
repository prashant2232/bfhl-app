/**
 * BFHL - Full Stack Challenge
 * Core processing logic
 */
 
const VALID_EDGE = /^[A-Z]->[A-Z]$/;
 
function processData(data) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const seenEdges = new Set();
  const validEdges = [];
 
  for (let raw of data) {
    const entry = typeof raw === "string" ? raw.trim() : String(raw).trim();
 
    // Validate format
    if (!VALID_EDGE.test(entry)) {
      invalid_entries.push(raw);
      continue;
    }
 
    // Self-loop check
    const [parent, child] = entry.split("->"),
      p = parent,
      c = child;
    if (p === c) {
      invalid_entries.push(raw);
      continue;
    }
 
    // Duplicate check
    if (seenEdges.has(entry)) {
      if (!duplicate_edges.includes(entry)) {
        duplicate_edges.push(entry);
      }
      continue;
    }
 
    seenEdges.add(entry);
    validEdges.push({ parent: p, child: c });
  }
 
  // Build adjacency: parent -> [children]
  const childrenOf = {}; // parent -> [child, ...]
  const parentOf = {}; // child -> first parent
 
  for (const { parent, child } of validEdges) {
    // Diamond: first-encountered parent wins
    if (parentOf[child] !== undefined) {
      // silently discard subsequent parent edges for this child
      continue;
    }
    parentOf[child] = parent;
    if (!childrenOf[parent]) childrenOf[parent] = [];
    childrenOf[parent].push(child);
    // Ensure child is known
    if (!childrenOf[child]) childrenOf[child] = [];
  }
 
  // Collect all nodes
  const allNodes = new Set([
    ...Object.keys(childrenOf),
    ...Object.keys(parentOf),
  ]);
 
  // Find roots: nodes that are never a child
  const roots = [...allNodes].filter((n) => parentOf[n] === undefined);
 
  // Group nodes into connected components (undirected for grouping)
  const visited = new Set();
  const groups = [];
 
  // BFS to find connected component
  function getComponent(startNode) {
    const comp = new Set();
    const queue = [startNode];
    while (queue.length) {
      const n = queue.shift();
      if (comp.has(n)) continue;
      comp.add(n);
      // neighbors: children and parent
      for (const c of childrenOf[n] || []) {
        if (!comp.has(c)) queue.push(c);
      }
      if (parentOf[n] && !comp.has(parentOf[n])) {
        queue.push(parentOf[n]);
      }
    }
    return comp;
  }
 
  for (const node of allNodes) {
    if (!visited.has(node)) {
      const comp = getComponent(node);
      comp.forEach((n) => visited.add(n));
      groups.push([...comp]);
    }
  }
 
  // For each group, determine root(s) and build tree
  const hierarchies = [];
 
  for (const group of groups) {
    const groupSet = new Set(group);
    const groupRoots = group.filter((n) => parentOf[n] === undefined);
 
    // Cycle detection using DFS
    function hasCycle(startNodes) {
      const color = {}; // 0=white,1=gray,2=black
      function dfs(n) {
        color[n] = 1;
        for (const c of childrenOf[n] || []) {
          if (!groupSet.has(c)) continue;
          if (color[c] === 1) return true;
          if (!color[c] && dfs(c)) return true;
        }
        color[n] = 2;
        return false;
      }
      for (const n of startNodes) {
        if (!color[n] && dfs(n)) return true;
      }
      return false;
    }
 
    if (groupRoots.length === 0) {
      // Pure cycle: use lexicographically smallest node as root
      const cycleRoot = group.slice().sort()[0];
      hierarchies.push({
        root: cycleRoot,
        tree: {},
        has_cycle: true,
      });
      continue;
    }
 
    // Check cycle from each root
    const cycleFound = hasCycle(groupRoots);
 
    if (cycleFound) {
      const cycleRoot = groupRoots.slice().sort()[0];
      hierarchies.push({
        root: cycleRoot,
        tree: {},
        has_cycle: true,
      });
      continue;
    }
 
    // Build tree for each root in this group
    for (const root of groupRoots.sort()) {
      function buildTree(node, ancestors) {
        const obj = {};
        for (const child of childrenOf[node] || []) {
          if (!ancestors.has(child)) {
            obj[child] = buildTree(child, new Set([...ancestors, child]));
          }
        }
        return obj;
      }
 
      const tree = { [root]: buildTree(root, new Set([root])) };
 
      // Depth: longest root-to-leaf path (node count)
      function maxDepth(node, depth) {
        const children = childrenOf[node] || [];
        if (children.length === 0) return depth;
        return Math.max(...children.map((c) => maxDepth(c, depth + 1)));
      }
      const depth = maxDepth(root, 1);
 
      hierarchies.push({ root, tree, depth });
    }
  }
 
  // Sort hierarchies: non-cyclic first (by root alpha), then cyclic
  hierarchies.sort((a, b) => {
    if (a.has_cycle && !b.has_cycle) return 1;
    if (!a.has_cycle && b.has_cycle) return -1;
    return a.root.localeCompare(b.root);
  });
 
  // Summary
  const nonCyclic = hierarchies.filter((h) => !h.has_cycle);
  const total_trees = nonCyclic.length;
  const total_cycles = hierarchies.filter((h) => h.has_cycle).length;
 
  let largest_tree_root = "";
  if (nonCyclic.length > 0) {
    nonCyclic.sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root.localeCompare(b.root);
    });
    largest_tree_root = nonCyclic[0].root;
  }
 
  return {
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees,
      total_cycles,
      largest_tree_root,
    },
  };
}
 
module.exports = { processData };