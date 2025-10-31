import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  addEdge,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../service/firebase';
import { applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import { useAuth } from '../components/AuthProvider';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft, Save, PlusCircle } from 'lucide-react';
import { removeNodeAndConnectedEdges, removeEdgeById } from '../utils/graph';

interface DiagramData {
  nodes: Node[];
  edges: Edge[];
  name?: string;
}

const defaultDiagram: DiagramData = {
  nodes: [],
  edges: [],
};

const DiagramEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const { user } = useAuth();
  const userEmail = user?.email ?? '';
  const [diagram, setDiagram] = useState<DiagramData>(defaultDiagram);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [effectiveRole, setEffectiveRole] = useState<string | null>(role);
  // sharing handled from dashboard now
  const [diagramName, setDiagramName] = useState<string>('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const diagramAreaRef = useRef<HTMLDivElement>(null);
  const { notify } = useToast();
  
  useEffect(() => {
    if (!id) return;
    const fetchDiagram = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'diagrams', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setDiagram({
            nodes: data.nodes ?? [],
            edges: data.edges ?? [],
            name: data.name ?? 'Untitled diagram',
          });
          setDiagramName(data.name ?? 'Untitled diagram');
        }
      } catch (err) {
        // Handle error gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchDiagram();
  }, [id]);

  // Keyboard shortcuts: Cmd/Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (effectiveRole === 'editor') {
          handleSave();
        }
        return;
      }
      if (effectiveRole === 'editor' && (e.key === 'Delete' || e.key === 'Backspace')) {
        // delete selected node/edge
        if (selectedNodeId) {
          setDiagram((prev) => ({
            ...prev,
            ...removeNodeAndConnectedEdges(prev.nodes, prev.edges, selectedNodeId),
          }));
        } else if (selectedEdgeId) {
          setDiagram((prev) => ({ ...prev, edges: removeEdgeById(prev.edges, selectedEdgeId) }));
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [effectiveRole, diagram, selectedNodeId, selectedEdgeId]);

  // Compute per-diagram effective role based on permissions subcollection
  useEffect(() => {
    if (!id || !userEmail) {
      setEffectiveRole(role);
      return;
    }
    const checkPermission = async () => {
      try {
        const permRef = doc(db, 'diagrams', id, 'permissions', userEmail);
        const permSnap = await getDoc(permRef);
        if (permSnap.exists()) {
          const data = permSnap.data() as { access?: 'view' | 'edit' };
          if (data.access === 'edit') {
            setEffectiveRole('editor');
          } else if (data.access === 'view') {
            setEffectiveRole('viewer');
          } else {
            setEffectiveRole(role);
          }
        } else {
          setEffectiveRole(role);
        }
      } catch (e) {
        setEffectiveRole(role);
      }
    };
    checkPermission();
  }, [id, userEmail, role]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (effectiveRole === 'viewer') return;
      setDiagram(prev => ({
        ...prev,
        nodes: applyNodeChanges(changes, prev.nodes),
      }));
    },
    [effectiveRole]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (effectiveRole === 'viewer') return;
      setDiagram(prev => ({
        ...prev,
        edges: applyEdgeChanges(changes, prev.edges),
      }));
    },
    [effectiveRole]
  );

  const handleAddNode = () => {
    if (effectiveRole === 'viewer') return;
    setDiagram((prev) => ({
      ...prev,
      nodes: [
        ...prev.nodes,
        {
          id: `${Date.now()}`,
          type: 'default',
          position: { x: 250, y: 5 },
          data: { label: 'New Node' },
        },
      ],
    }));
  };

  const handleSave = async () => {
    if (!id || effectiveRole === 'viewer') return;
    setSaving(true);
    try {
      const ref = doc(db, 'diagrams', id);
      await updateDoc(ref, {
        nodes: diagram.nodes,
        edges: diagram.edges,
        name: diagramName || 'Untitled diagram',
      });
      notify('Diagram saved!', 'success');
    } catch (err) {
      notify('Error saving diagram!', 'error');
    } finally {
      setSaving(false);
    }
  };

  // invite moved to Dashboard share modal

  if (loading) return <div>Loading diagram...</div>;

  return (
    <ReactFlowProvider>
      <div className="w-screen h-[90vh] flex flex-col bg-neutral-50 dark:bg-neutral-900">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>Back</Button>
            <h2 className="font-semibold text-neutral-700 dark:text-white">Diagram Editor</h2>
            <input
              type="text"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              disabled={effectiveRole !== 'editor'}
              placeholder="Diagram name"
              className="ml-3 px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 caret-primary-400 text-sm min-w-[200px]"
            />
          </div>
          {effectiveRole === 'editor' && (
            <div className="flex items-center gap-2">
              <Button size="sm" leftIcon={<PlusCircle size={16} />} onClick={handleAddNode}>Add Node</Button>
              <Button size="sm" onClick={handleSave} leftIcon={<Save size={16} />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          )}
          {effectiveRole === 'viewer' && <div className="ml-2 px-3 py-1 rounded bg-gray-400 text-white">Read Only</div>}
        </div>
        {/* Canvas area */}
        <div className="flex-1 m-3 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow bg-white dark:bg-neutral-800 relative" ref={diagramAreaRef}>
        <ReactFlow
          nodes={diagram.nodes}
          edges={diagram.edges}
          onNodesChange={effectiveRole === 'editor' ? onNodesChange : undefined}
          onEdgesChange={effectiveRole === 'editor' ? onEdgesChange : undefined}
          onConnect={effectiveRole === 'editor' ? (params => setDiagram(prev => ({ ...prev, edges: addEdge(params, prev.edges) }))): undefined}
          defaultEdgeOptions={{ style: { stroke: '#0B5FFF', strokeWidth: 2 } }}
          connectionLineStyle={{ stroke: '#0B5FFF', strokeWidth: 2 }}
          onSelectionChange={({ nodes, edges }) => {
            setSelectedNodeId(nodes && nodes[0] ? nodes[0].id : null);
            setSelectedEdgeId(edges && edges[0] ? (edges[0] as any).id : null);
          }}
          onNodeDoubleClick={(e, node) => {
            if (effectiveRole !== 'editor') return;
            setEditingNodeId(node.id);
            setEditingLabel((node.data as any)?.label ?? '');
          }}
          fitView
        >
          <MiniMap pannable zoomable nodeColor={() => '#0B5FFF'} maskColor="rgba(11,95,255,0.08)" />
          <Controls />
          <Background color="#eef4ff" gap={18} />
        </ReactFlow>
        {editingNodeId && effectiveRole === 'editor' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow p-2 flex items-center gap-2">
            <input
              className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-white"
              value={editingLabel}
              autoFocus
              onChange={(e) => setEditingLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setDiagram((prev) => ({
                    ...prev,
                    nodes: prev.nodes.map((n) => n.id === editingNodeId ? { ...n, data: { ...(n.data as any), label: editingLabel }} : n),
                  }));
                  setEditingNodeId(null);
                } else if (e.key === 'Escape') {
                  setEditingNodeId(null);
                }
              }}
            />
            <Button size="sm" onClick={() => { setDiagram((prev) => ({ ...prev, nodes: prev.nodes.map((n) => n.id === editingNodeId ? { ...n, data: { ...(n.data as any), label: editingLabel }} : n)})); setEditingNodeId(null); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingNodeId(null)}>Cancel</Button>
          </div>
        )}
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default DiagramEditor;
