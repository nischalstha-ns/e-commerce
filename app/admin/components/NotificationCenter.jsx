"use client";

import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { Bell, X, CheckCircle, AlertTriangle, Info, Package, ShoppingCart, MessageSquare } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";

export default function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();

    const getIcon = (category, type) => {
        if (category === "inventory") return Package;
        if (category === "order") return ShoppingCart;
        if (category === "review") return MessageSquare;
        
        switch (type) {
            case "success": return CheckCircle;
            case "warning": return AlertTriangle;
            case "info": return Info;
            default: return Bell;
        }
    };

    const handleNotificationClick = (notification) => {
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
        markAsRead(notification.id);
    };

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
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button size="sm" variant="flat" onClick={markAllAsRead}>
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button size="sm" variant="flat" color="danger" onClick={clearAll}>
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardBody className="pt-0">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                        const Icon = getIcon(notification.category, notification.type);
                        return (
                            <div 
                                key={notification.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                                    notification.read ? "bg-gray-50" : "bg-white border-blue-200"
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                                suppressHydrationWarning
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
                                            <span className="text-xs text-gray-500" suppressHydrationWarning>
                                                {notification.timestamp.toLocaleTimeString()}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                                {notification.actionUrl && (
                                                    <span className="text-xs text-blue-600">Click to view</span>
                                                )}
                                            </div>
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