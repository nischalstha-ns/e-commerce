"use client";

import { useState, useEffect, useMemo } from "react";

const mockNotifications = [
    {
        id: 1,
        type: "warning",
        category: "inventory",
        title: "Low Stock Alert",
        message: "5 products are running low on stock",
        timestamp: new Date(),
        read: false,
        actionUrl: "/admin/products"
    },
    {
        id: 2,
        type: "success",
        category: "order",
        title: "New Order",
        message: "Order #12345 has been placed",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionUrl: "/admin/orders"
    },
    {
        id: 3,
        type: "info",
        category: "review",
        title: "Review Pending",
        message: "3 reviews are waiting for approval",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false,
        actionUrl: "/admin/reviews"
    }
];

export function useNotifications() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return {
        notifications: mounted ? notifications : [],
        unreadCount: mounted ? unreadCount : 0,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll
    };
}