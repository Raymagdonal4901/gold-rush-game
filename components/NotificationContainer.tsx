import React from 'react';
import { createPortal } from 'react-dom';
import { NotificationToast, ToastProps } from './NotificationToast';

interface NotificationContainerProps {
    notifications: Omit<ToastProps, 'onClose'>[];
    onClose: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
    notifications,
    onClose
}) => {
    // We use a portal to ensure the notifications are always on top and not clipped by parent containers
    const container = typeof document !== 'undefined' ? document.getElementById('notification-root') || document.body : null;

    if (!container) return null;

    return createPortal(
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            {notifications.map((notif) => (
                <NotificationToast
                    key={notif.id}
                    {...notif}
                    onClose={onClose}
                />
            ))}
        </div>,
        container
    );
};
