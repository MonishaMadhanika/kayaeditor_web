import { db } from "../firebase"; 
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  collectionGroup,
  getDoc,
  getDocs
} from "firebase/firestore";
import { Diagram } from "../../types";

const diagramsCol = collection(db, "diagrams");

export const createDiagram = async (
  payload: Pick<Diagram, 'name' | 'ownerId' | 'stageJson' | 'thumbnail'>
) => {
  const docRef = await addDoc(diagramsCol, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateDiagram = async (id: string, payload: Partial<Diagram>) => {
  const ref = doc(db, "diagrams", id);
  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDiagram = async (id: string) => {
  const ref = doc(db, "diagrams", id);
  await deleteDoc(ref);
};

export const subscribeUserDiagrams = (userId: string, cb: (docs: Diagram[]) => void) => {
  const q = query(
    diagramsCol,
    where("ownerId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as Diagram[];
    cb(docs);
  });
};

// Subscribe to diagrams the user can access (owner or invited by email)
export const subscribeAccessibleDiagrams = (
  userId: string,
  userEmail: string,
  cb: (docs: Diagram[]) => void
) => {
  const ownersUnsub = subscribeUserDiagrams(userId, (ownerDocs) => {
    // Mark owners as editors for effective role
    const ownersWithRole = ownerDocs.map((d) => ({ ...d, _effectiveRole: 'editor' } as any));
    mergeAndEmit(ownersWithRole, sharedDocs);
  });

  let sharedDocs: any[] = [];
  let ownerDocsCache: any[] = [];
  let accessById = new Map<string, 'view' | 'edit'>();

  const mergeAndEmit = (owners: any[], shared: any[]) => {
    ownerDocsCache = owners;
    // Deduplicate by id, owner docs take precedence
    const map = new Map<string, any>();
    [...shared, ...owners].forEach((d) => map.set(d.id, d));
    const merged = Array.from(map.values()).sort((a, b) => {
      const au = a.updatedAt?.toMillis?.() ?? 0;
      const bu = b.updatedAt?.toMillis?.() ?? 0;
      return bu - au;
    });
    cb(merged);
  };

  // Track per-diagram unsubscribers for shared diagrams
  const sharedDiagramUnsubs = new Map<string, () => void>();

  const permsQueryEmail = query(collectionGroup(db, 'permissions'), where('email', '==', userEmail));
  const permsQueryLower = query(collectionGroup(db, 'permissions'), where('emailLower', '==', (userEmail || '').toLowerCase()));

  const handlePermSnaps = (permSnaps: any) => {
    // Determine current set of shared diagram ids
    const ids = new Set<string>();
    accessById = new Map();
    permSnaps.forEach((p: any) => {
      const parentDiagramId = p.ref.parent.parent?.id;
      if (parentDiagramId) {
        ids.add(parentDiagramId);
        const data = p.data() as { access?: 'view' | 'edit' };
        if (data?.access === 'edit' || data?.access === 'view') {
          accessById.set(parentDiagramId, data.access);
        }
      }
    });

    // Unsubscribe removed diagrams
    for (const [diagramId, unsub] of Array.from(sharedDiagramUnsubs.entries())) {
      if (!ids.has(diagramId)) {
        unsub();
        sharedDiagramUnsubs.delete(diagramId);
      }
    }

    // Subscribe to new shared diagrams
    ids.forEach((diagramId) => {
      if (sharedDiagramUnsubs.has(diagramId)) return;
      const dRef = doc(db, 'diagrams', diagramId);
      const unsub = onSnapshot(dRef, (snap) => {
        if (snap.exists()) {
          const access = accessById.get(diagramId) || 'view';
          const data = { id: snap.id, ...snap.data(), _effectiveRole: access === 'edit' ? 'editor' : 'viewer' } as any;
          // Update sharedDocs array and emit
          const idx = sharedDocs.findIndex((d) => d.id === data.id);
          if (idx >= 0) sharedDocs[idx] = data; else sharedDocs.push(data);
          mergeAndEmit(ownerDocsCache, sharedDocs);
        }
      });
      sharedDiagramUnsubs.set(diagramId, unsub);
    });
  };

  const permsUnsub1 = onSnapshot(permsQueryEmail, handlePermSnaps);
  const permsUnsub2 = onSnapshot(permsQueryLower, handlePermSnaps);

  // Bootstrap: fetch current permissions once so UI doesn't flash empty on first load
  (async () => {
    try {
      const [snapA, snapB] = await Promise.all([
        getDocs(permsQueryEmail),
        getDocs(permsQueryLower),
      ]);
      const permDocs = new Map<string, 'view' | 'edit'>();
      [snapA, snapB].forEach((snap) =>
        snap.forEach((p) => {
          const id = p.ref.parent.parent?.id;
          const access = (p.data() as any)?.access as 'view' | 'edit';
          if (id && (access === 'view' || access === 'edit')) permDocs.set(id, access);
        })
      );
      const ids = Array.from(permDocs.keys());
      const docs = await Promise.all(ids.map((diagramId) => getDoc(doc(db, 'diagrams', diagramId))));
      sharedDocs = docs
        .filter((d) => d.exists())
        .map((d) => ({ id: d.id, ...d.data(), _effectiveRole: permDocs.get(d.id) === 'edit' ? 'editor' : 'viewer' } as any));
      mergeAndEmit(ownerDocsCache, sharedDocs);
    } catch (e) {
      // ignore bootstrap errors; live listeners will still update
    }
  })();

  return () => {
    ownersUnsub();
    permsUnsub1();
    permsUnsub2();
    sharedDiagramUnsubs.forEach((u) => u());
    sharedDiagramUnsubs.clear();
  };
};
