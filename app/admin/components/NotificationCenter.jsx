"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { Bell, X, CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "warning",
            title: "Low Stock Alert",
            message: "5 products are running low on stock",
            timestamp: new Date(),
            read: false
        },
        {
            id: 2,
            type: "success",
            title: "New Order",
            message: "Order #12345 has been placed",
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            read: false
        },
        {
            id: 3,
            type: "info",
            title: "Review Pending",
            message: "3 reviews are waiting for approval",
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            read: true
        }
    ]);

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case "success": return CheckCircle;
            case "warning": return AlertTriangle;
            case "info": return Info;
            default: return Bell;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case "success": return "success";
            case "warning": return "warning";
            case "info": return "primary";
            default: return "default";
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <Chip color="danger" size="sm">{unreadCount}</Chip>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardBody className="pt-0">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                        const Icon = getIcon(notification.type);
                        return (
                            <div 
                                key={notification.id}
                                className={`p-3 rounded-lg border ${
                                    notification.read ? "bg-gray-50" : "bg-white border-blue-200"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-1 rounded-full ${
                                        notification.type === "success" ? "bg-green-100" :
                                        notification.type === "warning" ? "bg-yellow-100" :
                                        "bg-blue-100"
                                    }`}>
                                        <Icon className={`w-4 h-4 ${
                                            notification.type === "success" ? "text-green-600" :
                                            notification.type === "warning" ? "text-yellow-600" :
                                            "text-blue-600"
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-sm">{notification.title}</p>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                isIconOnly
                                                onClick={() => removeNotification(notification.id)}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">
                                                {notification.timestamp.toLocaleTimeString()}
                                            </span>
                                            {!notification.read && (
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    color="primary"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    Mark as read
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {notifications.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No notifications</p>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}