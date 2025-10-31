import { Edge, Node } from 'reactflow';

export function removeNodeAndConnectedEdges(nodes: Node[], edges: Edge[], nodeId: string) {
  const nextNodes = nodes.filter((n) => n.id !== nodeId);
  const nextEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
  return { nodes: nextNodes, edges: nextEdges };
}

export function removeEdgeById(edges: Edge[], edgeId: string) {
  return edges.filter((e) => (e as any).id !== edgeId);
}


