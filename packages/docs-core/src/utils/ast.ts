/**
 * @oxog/docs-core - AST Utilities
 * Simple AST transformation utilities
 */

/**
 * Transform all nodes in an AST
 * @param ast - The AST to transform
 * @param transformer - Function to transform each node
 * @returns The transformed AST
 */
export function transformAST<T>(
  ast: T,
  transformer: (node: T) => T | undefined,
): T {
  const result = transformer(ast);
  if (result === undefined) {
    return ast as T;
  }

  // If the node has children, transform them too
  if (result && typeof result === "object" && "children" in result) {
    const nodeWithChildren = result as { children?: T[] };
    if (nodeWithChildren.children) {
      nodeWithChildren.children = nodeWithChildren.children.map((child) =>
        transformAST(child, transformer),
      );
    }
  }

  return result;
}

/**
 * Find nodes in an AST matching a predicate
 * @param ast - The AST to search
 * @param predicate - Function to test each node
 * @returns Array of matching nodes
 */
export function findNodes<T>(ast: T, predicate: (node: T) => boolean): T[] {
  const results: T[] = [];

  function traverse(node: T) {
    if (predicate(node)) {
      results.push(node);
    }

    // Traverse children
    if (node && typeof node === "object") {
      const nodeObj = node as Record<string, unknown>;
      for (const key of Object.keys(nodeObj)) {
        const child = nodeObj[key];
        if (Array.isArray(child)) {
          child.forEach((item) => {
            if (item && typeof item === "object") {
              traverse(item as T);
            }
          });
        } else if (child && typeof child === "object") {
          traverse(child as T);
        }
      }
    }
  }

  traverse(ast);
  return results;
}

/**
 * Walk through an AST and call a callback on each node
 * @param ast - The AST to walk
 * @param callback - Function to call on each node
 */
export function walkAST<T>(
  ast: T,
  callback: (node: T, parent: T | null, key: string | null) => void,
): void {
  function traverse(node: T, parent: T | null, key: string | null) {
    callback(node, parent, key);

    if (node && typeof node === "object") {
      const nodeObj = node as Record<string, unknown>;
      for (const k of Object.keys(nodeObj)) {
        const child = nodeObj[k];
        if (Array.isArray(child)) {
          child.forEach((item, index) => {
            if (item && typeof item === "object") {
              traverse(item as T, node, `${k}[${index}]`);
            }
          });
        } else if (child && typeof child === "object") {
          traverse(child as T, node, k);
        }
      }
    }
  }

  traverse(ast, null, null);
}
