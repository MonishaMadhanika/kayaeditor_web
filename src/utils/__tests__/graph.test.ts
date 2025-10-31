import { removeNodeAndConnectedEdges, removeEdgeById } from '../../utils/graph';

describe('graph utils', () => {
  it('removes node and its connected edges', () => {
    const nodes = [
      { id: 'a', type: 'default', position: { x: 0, y: 0 }, data: { label: 'A' } },
      { id: 'b', type: 'default', position: { x: 0, y: 0 }, data: { label: 'B' } },
    ] as any;
    const edges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'a' },
    ] as any;
    const result = removeNodeAndConnectedEdges(nodes, edges, 'a');
    expect(result.nodes.find((n) => n.id === 'a')).toBeUndefined();
    expect(result.edges.length).toBe(0);
  });

  it('removes edge by id', () => {
    const edges = [ { id: 'e1' }, { id: 'e2' } ] as any;
    const next = removeEdgeById(edges, 'e1');
    expect(next.map((e) => (e as any).id)).toEqual(['e2']);
  });
});


