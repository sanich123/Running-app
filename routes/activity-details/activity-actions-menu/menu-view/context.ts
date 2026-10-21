import { createContext } from 'react';

export const ActivityActionsMenuDismissContext = createContext<() => void>(() => undefined);
