"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, Tabs, Tab, User, Chip, Button, Switch, Divider, Avatar } from "@heroui/react";
import { ArrowLeft, Shield, Clock, MapPin, Monitor, Smartphone, Globe, LogOut, Key, Eye } from "lucide-react";
import AdminOnly from "../../components/AdminOnly";
import { doc, getDoc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import Link from "next/link";
import toast from "react-hot-toast";

export default function UserDetailPage() {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const userRef = doc(db, "users", params.id);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUser({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });

    const activitiesRef = collection(db, "userActivities");
    const activitiesQuery = query(
      activitiesRef,
      where("userId", "==", params.id),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    
    const activitiesUnsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activityData = [];
      snapshot.forEach((doc) => {
        activityData.push({ id: doc.id, ...doc.data() });
      });
      setActivities(activityData);
    });

    return () => {
      unsubscribe();
      activitiesUnsubscribe();
    };
  }, [params.id]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "login": return <LogOut className="w-4 h-4 text-green-500" />;
      case "logout": return <LogOut className="w-4 h-4 text-red-500" />;
      case "page_visit": return <Eye className="w-4 h-4 text-blue-500" />;
      case "order_created": return <Shield className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <AdminOnly>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminOnly>
    );
  }

  if (!user) {
    return (
      <AdminOnly>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h1>
            <Button as={Link} href="/admin/users" startContent={<ArrowLeft className="w-4 h-4" />}>
              Back to Users
            </Button>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            as={Link}
            href="/admin/users"
            variant="flat"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete user profile and activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardBody className="p-6">
                <div className="text-center mb-6">
                  <Avatar
                    src={user.photoURL}
                    size="lg"
                    className="mx-auto mb-4"
                  />
                  <h2 className="text-xl font-bold">{user.displayName || "Unknown User"}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <div className="flex justify-center mt-3">
                    <Chip
                      color={user.role === "admin" ? "primary" : user.role === "shop" ? "warning" : "success"}
                      variant="flat"
                    >
                      {user.role?.toUpperCase() || "CUSTOMER"}
                    </Chip>
                  </div>
                </div>

                <Divider className="my-4" />

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <Chip
                      color={user.status === "active" ? "success" : "warning"}
                      size="sm"
                      variant="dot"
                    >
                      {user.status?.toUpperCase() || "ACTIVE"}
                    </Chip>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
                    <span className="text-sm">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Registered</span>
                    <span className="text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                </div>

                <Divider className="my-4" />

                <div className="space-y-3">
                  <Button
                    color="primary"
                    variant="flat"
                    className="w-full"
                    startContent={<Key className="w-4 h-4" />}
                  >
                    Reset Password
                  </Button>
                  <Button
                    color="warning"
                    variant="flat"
                    className="w-full"
                    startContent={<LogOut className="w-4 h-4" />}
                  >
                    Force Logout
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    className="w-full"
                    startContent={<Shield className="w-4 h-4" />}
                  >
                    Suspend Account
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultSelectedKey="activity" className="w-full">
              <Tab key="activity" title="Activity Log">
                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {activities.length > 0 ? (
                        activities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="mt-1">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(activity.timestamp).toLocaleString()}
                                </span>
                                {activity.ipAddress && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {activity.ipAddress}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No activity recorded</p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Tab>

              <Tab key="permissions" title="Permissions">
                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Admin Panel Access</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Dashboard</span>
                              <Switch isSelected={user.role === "admin"} isDisabled />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">User Management</span>
                              <Switch isSelected={user.role === "admin"} isDisabled />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Product Management</span>
                              <Switch isSelected={user.role === "admin" || user.role === "shop"} isDisabled />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Store Operations</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">View Products</span>
                              <Switch isSelected={true} isDisabled />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Place Orders</span>
                              <Switch isSelected={true} isDisabled />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Write Reviews</span>
                              <Switch isSelected={user.status === "active"} isDisabled />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}