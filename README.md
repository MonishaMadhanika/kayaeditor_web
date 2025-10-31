# Kaya Editor

Small diagramming app built with React + TypeScript, React Router, Firebase Auth/Firestore, and React Flow.

## Features

- Email/password authentication (Firebase)
- Role-based access (editor/viewer) stored in Firestore
- Dashboard listing owned and shared diagrams
- Diagram editor (React Flow): draggable nodes, connectable edges, inline node label editing, keyboard delete
- Save diagrams (nodes, edges, name) to Firestore
- Per-diagram sharing by email (view or edit)
- Light/dark theme toggle
- Toast notifications and confirm modal

## Getting Started

1. Install deps

```bash
npm install
```

2. Firebase config

Create a project and enable Email/Password in Authentication. Create a `.env` with your web app keys and ensure `src/service/firebase.ts` reads them (already wired).

Firestore collections used:

- `users/{uid}`: `{ email, role }` where role is `editor` or `viewer`
- `diagrams/{id}`: `{ name, ownerId, nodes, edges, createdAt, updatedAt, thumbnail? }`
- `diagrams/{id}/permissions/{email}`: `{ email, emailLower, access }` where access is `view` or `edit`

3. Run

```bash
npm start
```

## Roles

- Editor: create diagrams, edit nodes/edges, rename, share
- Viewer: view-only; editor UI disabled

## Keyboard Shortcuts

- Cmd/Ctrl+S: Save diagram
- Delete/Backspace: Delete selected node/edge (editor only)

## Tests

We use Jest + React Testing Library.

```bash
npm test
```

Included tests:

- `Button` component
- `ToastProvider` notify flow
- Graph utils for deletion

## Project Structure

- `src/components` UI (Button, Modal, Toast) and feature components
- `src/pages` app pages (Login, Dashboard, DiagramEditor, Profile)
- `src/service` Firebase setup and actions
- `src/types` shared TypeScript types
- `src/utils` small utilities and their tests

## Security Rules

See `firestore.rules` for server-side enforcement:

- Users can write only their user document.
- Read diagrams if you are owner or have a permission document for your lowercased email.
- Update/delete diagrams only if owner or permission access is `edit`.
- Only owners can write to `permissions`.

Deploy rules (if using Firebase CLI):

```bash
firebase deploy --only firestore:rules
```

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
