import React from "react";
import { useNavigate } from "react-router-dom";
import { deleteDiagram } from "../service/action/index";
import { Pencil, Eye, Trash2, Image as ImageIcon, Shield } from "lucide-react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import { useState } from "react";
import { useToast } from "./ui/Toast";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../service/firebase";

import { Diagram } from "../types";

type EffectiveDiagram = Diagram & { _effectiveRole?: 'viewer' | 'editor'; thumbnail?: string; };

interface DiagramsListProps {
  diagrams: EffectiveDiagram[];
}

const DiagramsList: React.FC<DiagramsListProps> = ({ diagrams }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  // Temporary: per-diagram effective role if present, fallback to global role
  const getEffectiveRole = (diagram: EffectiveDiagram) => diagram._effectiveRole || role;
  const { notify } = useToast();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState<string>("");
  const [shareAccess, setShareAccess] = useState<'view' | 'edit'>("view");

  const handleDelete = async (id: string) => {
    await deleteDiagram(id);
    notify('Diagram deleted', 'success');
  };

  if (!diagrams.length) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No diagrams found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {diagrams.map((diagram: EffectiveDiagram) => {
        const effectiveRole = getEffectiveRole(diagram);
        return (
          <div
            key={diagram.id}
            className="rounded-xl border border-blue-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-lg transition bg-white dark:bg-gray-900"
          >
            {/* Thumbnail */}
            {diagram.thumbnail ? (
              <img
                src={diagram.thumbnail}
                alt={diagram.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-40 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-3">
                <ImageIcon className="text-neutral-400" />
              </div>
            )}

            {/* Diagram Info */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{diagram.name}</h3>
              <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${effectiveRole === 'editor' ? 'text-green-700 border-green-200 bg-green-50' : 'text-primary-700 border-primary-200 bg-primary-50'}`}>
                <Shield size={12} className="mr-1" /> {effectiveRole}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant={effectiveRole === 'editor' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => navigate(`/diagram/${diagram.id}`)}
                leftIcon={effectiveRole === 'editor' ? <Pencil size={16} /> : <Eye size={16} />}
              >
                {effectiveRole === 'editor' ? 'Edit' : 'View'}
              </Button>
              {effectiveRole === 'editor' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmId(diagram.id)}
                  leftIcon={<Trash2 size={16} />}
                >
                  Delete
                </Button>
              )}
              {effectiveRole === 'editor' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setShareId(diagram.id); setShareEmail(""); setShareAccess('view'); }}
                >
                  Share
                </Button>
              )}
            </div>
          </div>
        );
      })}
      <Modal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Delete diagram?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => { if (confirmId) { handleDelete(confirmId); setConfirmId(null); } }}>Delete</Button>
          </>
        }
      >
        This action cannot be undone.
      </Modal>

      <Modal
        open={!!shareId}
        onClose={() => setShareId(null)}
        title="Share diagram"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShareId(null)}>Close</Button>
            <Button
              size="sm"
              onClick={async () => {
                if (!shareId || !shareEmail) return;
                try {
                  const permRef = doc(db, 'diagrams', shareId, 'permissions', shareEmail);
                  await setDoc(permRef, { email: shareEmail, emailLower: shareEmail.toLowerCase(), access: shareAccess }, { merge: true });
                  notify('Invitation sent', 'success');
                  setShareId(null);
                } catch (e) {
                  notify('Failed to share', 'error');
                }
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 rounded-md border border-ocean-200 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Access</label>
            <select
              value={shareAccess}
              onChange={(e) => setShareAccess(e.target.value as 'view' | 'edit')}
              className="w-full px-3 py-2 rounded-md border border-ocean-200 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="view">view</option>
              <option value="edit">edit</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DiagramsList;
