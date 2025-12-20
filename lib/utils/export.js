export const exportActivityLogs = async (activities) => {
  const csvContent = [
    ["Timestamp", "User", "Action", "Module", "Description", "IP Address", "Device"].join(","),
    ...activities.map(activity => [
      new Date(activity.timestamp.seconds * 1000).toISOString(),
      activity.userName || "Unknown",
      activity.actionType || "unknown",
      activity.module || "system",
      `"${activity.description || ""}"`,
      activity.ipAddress || "unknown",
      activity.device || "unknown"
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};