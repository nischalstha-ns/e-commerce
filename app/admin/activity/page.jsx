"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Input, Select, SelectItem, Button, Chip, User } from "@heroui/react";
import { Search, Download, Clock, Eye, Shield, Edit, Activity } from "lucide-react";
import AdminOnly from "../components/AdminOnly";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";

const activityTypes = {
  login: { icon: Eye, color: "success", label: "Login" },
  logout: { icon: Eye, color: "default", label: "Logout" },
  page_visit: { icon: Eye, color: "primary", label: "Page Visit" },
  user_create: { icon: Shield, color: "success", label: "User Created" },
  user_update: { icon: Edit, color: "warning", label: "User Updated" },
  role_change: { icon: Shield, color: "warning", label: "Role Changed" },
  status_change: { icon: Shield, color: "warning", label: "Status Changed" }
};

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [adminActions, setAdminActions] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("user");

  useEffect(() => {
    const usersRef = collection(db, "users");
    const usersUnsubscribe = onSnapshot(usersRef, (snapshot) => {
      const userData = {};
      snapshot.forEach((doc) => {
        userData[doc.id] = doc.data();
      });
      setUsers(userData);
    });

    const activitiesRef = collection(db, "userActivities");
    const activitiesQuery = query(activitiesRef, orderBy("timestamp", "desc"), limit(100));
    
    const activitiesUnsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activityData = [];
      snapshot.forEach((doc) => {
        activityData.push({ id: doc.id, ...doc.data() });
      });
      setActivities(activityData);
      setLoading(false);
    });

    const adminRef = collection(db, "adminActions");
    const adminQuery = query(adminRef, orderBy("timestamp", "desc"), limit(100));
    
    const adminUnsubscribe = onSnapshot(adminQuery, (snapshot) => {
      const adminData = [];
      snapshot.forEach((doc) => {
        adminData.push({ id: doc.id, ...doc.data() });
      });
      setAdminActions(adminData);
    });

    return () => {
      usersUnsubscribe();
      activitiesUnsubscribe();
      adminUnsubscribe();
    };
  }, []);

  const getFilteredActivities = () => {
    const data = activeTab === "user" ? activities : adminActions;
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter(activity => {
        const user = users[activity.userId || activity.adminId];
        return (
          user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(activity => 
        activity.type === typeFilter || activity.action === typeFilter
      );
    }

    return filtered;
  };

  const renderActivityItem = (activity) => {
    const user = users[activity.userId || activity.adminId];
    const timestamp = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
    const activityType = activityTypes[activity.type || activity.action] || activityTypes.page_visit;
    const IconComponent = activityType.icon;

    return (
      <Card key={activity.id} className="mb-3">
        <CardBody className="p-4">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {user && (
                    <User
                      name={user.displayName || "Unknown User"}
                      description={user.email}
                      avatarProps={{ src: user.photoURL, size: "sm" }}
                    />
                  )}
                  <Chip
                    color={activityType.color}
                    size="sm"
                    variant="flat"
                  >
                    {activityType.label}
                  </Chip>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timestamp.toLocaleString()}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {activity.description || `${activityType.label} action performed`}
              </p>
              
              {activity.details && (
                <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <pre>{JSON.stringify(activity.details, null, 2)}</pre>
                </div>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {activity.ipAddress && (
                  <span>IP: {activity.ipAddress}</span>
                )}
                {activity.userAgent && (
                  <span>Device: {activity.userAgent.split(" ")[0]}</span>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Monitor</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time user activity tracking</p>
          </div>
          <Button
            startContent={<Download className="w-4 h-4" />}
            variant="bordered"
          >
            Export Logs
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            className="sm:max-w-xs"
          />
          
          <Select
            placeholder="Filter by type"
            selectedKeys={typeFilter !== "all" ? [typeFilter] : []}
            onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] || "all")}
            className="sm:max-w-xs"
          >
            <SelectItem key="all">All Types</SelectItem>
            {Object.entries(activityTypes).map(([key, type]) => (
              <SelectItem key={key}>{type.label}</SelectItem>
            ))}
          </Select>

          <Select
            placeholder="Activity type"
            selectedKeys={[activeTab]}
            onSelectionChange={(keys) => setActiveTab(Array.from(keys)[0])}
            className="sm:max-w-xs"
          >
            <SelectItem key="user">User Activities</SelectItem>
            <SelectItem key="admin">Admin Actions</SelectItem>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
              <div className="text-sm text-gray-600">User Activities</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{adminActions.length}</div>
              <div className="text-sm text-gray-600">Admin Actions</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(users).length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {activities.filter(a => {
                  const date = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                  return date.toDateString() === new Date().toDateString();
                }).length}
              </div>
              <div className="text-sm text-gray-600">Today's Activities</div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading activities...</p>
            </div>
          ) : getFilteredActivities().length > 0 ? (
            getFilteredActivities().map(renderActivityItem)
          ) : (
            <Card>
              <CardBody className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No activities found</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </AdminOnly>
  );
}