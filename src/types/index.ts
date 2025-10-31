import type { Timestamp } from 'firebase/firestore';

export interface AppUser {
  uid: string;
  email: string;
  role: "editor" | "viewer";
}
export interface SidebarProps {
  darkMode: boolean;
  onLogout: () => void;
}

export type StageJson = unknown; // replace with a concrete shape if needed

export interface Diagram {
  id: string;
  name: string;
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  stageJson?: StageJson;
  thumbnail?: string;
}

export type PermissionAccess = 'view' | 'edit';

export type EffectiveDiagram = Diagram & { _effectiveRole?: 'viewer' | 'editor' };

// export type DiagramDoc = {
//   name: string;
//   ownerId: string;
//   createdAt: FirebaseFirestore.Timestamp; // or serverTimestamp() in web SDK
//   updatedAt: FirebaseFirestore.Timestamp;
//   stageJson: any;        // output of stage.toJSON() from Konva
//   thumbnail?: string;    // dataURL (small JPEG/PNG)
// }

