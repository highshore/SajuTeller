import type { ReactNode } from 'react';
import { NotificationContext, useNotificationState } from '../product/notifications';
export function NotificationProvider({children}:{children:ReactNode}){const value=useNotificationState();return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;}
