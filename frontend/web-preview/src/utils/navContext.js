import { createContext } from 'react';
// Lets shared UI (the bottom nav) open app screens without threading props through every screen.
export const NavContext = createContext({ go: () => {} });
