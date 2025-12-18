"use client";

import { useState, useEffect } from "react";
import { Button, Switch, Card, Input, Textarea, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip } from "@heroui/react";
import { Save, Eye, Monitor, Tablet, Smartphone, GripVertical, Settings, History, Globe, Calendar, Users, Plus, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AdminOnly from "@/app/admin/components/AdminOnly";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export default function PageEditor() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("desktop");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showLogicEditor, setShowLogicEditor] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pageData, setPageData] = useState({
    status: "draft",
    seo: { title: "", description: "", keywords: "" },
    schedule: null,
    permissions: []
  });
  const [versions, setVersions] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(Date.now());

  useEffect(() => {
    loadPageData();
    const unsubscribe = setupRealtimeSync();
    trackActiveUser();
    return () => unsubscribe && unsubscribe();
  }, [params.id]);

  const loadPageData = async () => {
    try {
      const docRef = doc(db, "pages", params.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSections(data.sections || getDefaultSections());
        setPageData(data);
      } else {
        // Create default page
        const defaultData = {
          id: params.id,
          name: params.id.charAt(0).toUpperCase() + params.id.slice(1),
          sections: getDefaultSections(),
          status: "draft",
          seo: { title: "", description: "", keywords: "" },
          createdAt: new Date().toISOString(),
          createdBy: user?.uid
        };
        await setDoc(docRef, defaultData);
        setSections(defaultData.sections);
        setPageData(defaultData);
      }
      
      // Load versions
      loadVersionHistory();
    } catch (error) {
      console.error("Error loading page:", error);
      toast.error("Failed to load page");
    }
  };

  const getDefaultSections = () => {
    if (params.id === "home") {
      return [
        { id: "hero", name: "Hero Section", enabled: true, order: 0, config: {} },
        { id: "categories", name: "Categories", enabled: true, order: 1, config: {} },
        { id: "featured", name: "Featured Products", enabled: true, order: 2, config: {} },
        { id: "features", name: "Features", enabled: true, order: 3, config: {} }
      ];
    }
    return [];
  };

  const setupRealtimeSync = () => {
    const docRef = doc(db, "pages", params.id);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const currentUser = user?.uid;
        const otherUsers = (data.activeUsers || []).filter(u => u.id !== currentUser);
        
        if (otherUsers.length > 0) {
          setActiveUsers(otherUsers);
          setSections(data.sections || []);
          setPreviewKey(Date.now());
        }
      }
    });
  };

  const trackActiveUser = async () => {
    if (!user) return;
    const docRef = doc(db, "pages", params.id);
    const activeUser = { id: user.uid, name: user.displayName || user.email, timestamp: Date.now() };
    
    await setDoc(docRef, {
      activeUsers: [activeUser]
    }, { merge: true });

    // Remove user on unmount
    return () => {
      setDoc(docRef, {
        activeUsers: []
      }, { merge: true });
    };
  };

  const loadVersionHistory = async () => {
    try {
      const versionsRef = collection(db, "pages", params.id, "versions");
      const q = query(versionsRef, orderBy("timestamp", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const versionList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVersions(versionList);
    } catch (error) {
      console.error("Error loading versions:", error);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(sections);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    const updated = reordered.map((s, i) => ({ ...s, order: i }));
    setSections(updated);
    saveChanges({ sections: updated });
  };

  const saveChanges = async (updates) => {
    setSaving(true);
    try {
      const docRef = doc(db, "pages", params.id);
      await setDoc(docRef, {
        ...updates,
        lastModified: new Date().toISOString(),
        modifiedBy: user?.uid
      }, { merge: true });
      
      // Save version
      const versionRef = doc(collection(db, "pages", params.id, "versions"));
      await setDoc(versionRef, {
        ...updates,
        timestamp: new Date().toISOString(),
        modifiedBy: user?.uid
      });
      
      setPreviewKey(Date.now());
      toast.success("Changes saved");
      loadVersionHistory();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const publishPage = async () => {
    await saveChanges({ 
      status: "published",
      publishedAt: new Date().toISOString()
    });
    setPageData({ ...pageData, status: "published" });
    setShowPublish(false);
    toast.success("Page published!");
  };

  const schedulePage = async (date) => {
    await saveChanges({ 
      status: "scheduled",
      schedule: date
    });
    setPageData({ ...pageData, status: "scheduled", schedule: date });
    setShowPublish(false);
    toast.success("Page scheduled!");
  };

  const rollbackVersion = async (versionId) => {
    const versionRef = doc(db, "pages", params.id, "versions", versionId);
    const versionSnap = await getDoc(versionRef);
    if (versionSnap.exists()) {
      const versionData = versionSnap.data();
      await saveChanges(versionData);
      setSections(versionData.sections || []);
      toast.success("Rolled back to previous version");
      setShowHistory(false);
    }
  };

  const toggleSection = (id) => {
    const updated = sections.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSections(updated);
    saveChanges({ sections: updated });
  };

  const updateSectionConfig = (id, config) => {
    const updated = sections.map(s => 
      s.id === id ? { ...s, config: { ...s.config, ...config } } : s
    );
    setSections(updated);
    saveChanges({ sections: updated });
  };

  return (
    <AdminOnly>
      <div className="flex h-screen">
        {/* Left Panel */}
        <div className="w-80 border-r p-4 overflow-y-auto bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Page: {params.id}</h2>
            {activeUsers.length > 0 && (
              <Chip size="sm" color="warning" variant="flat">
                {activeUsers.length} editing
              </Chip>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <Button size="sm" variant="flat" isIconOnly onPress={() => setShowSEO(true)}>
              <Globe className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="flat" isIconOnly onPress={() => setShowHistory(true)}>
              <History className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="flat" isIconOnly onPress={() => setShowPublish(true)}>
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided) => (
                        <Card ref={provided.innerRef} {...provided.draggableProps} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                              </div>
                              <span className="text-sm font-medium">{section.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch size="sm" isSelected={section.enabled} onValueChange={() => toggleSection(section.id)} />
                              <Button size="sm" variant="light" isIconOnly onPress={() => {
                                setSelectedSection(section);
                                setShowLogicEditor(true);
                              }}>
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Button 
            color="primary" 
            className="w-full mt-4" 
            startContent={<Save className="w-4 h-4" />} 
            onPress={() => saveChanges({ sections })}
            isLoading={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800">
          <div className="border-b p-3 bg-white dark:bg-gray-900 flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="sm" variant={viewMode === "desktop" ? "solid" : "light"} isIconOnly onPress={() => setViewMode("desktop")}>
                <Monitor className="w-4 h-4" />
              </Button>
              <Button size="sm" variant={viewMode === "tablet" ? "solid" : "light"} isIconOnly onPress={() => setViewMode("tablet")}>
                <Tablet className="w-4 h-4" />
              </Button>
              <Button size="sm" variant={viewMode === "mobile" ? "solid" : "light"} isIconOnly onPress={() => setViewMode("mobile")}>
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            <Button size="sm" variant="flat" startContent={<Eye className="w-4 h-4" />} onPress={() => window.open(`/${params.id === 'home' ? '' : params.id}`, "_blank")}>
              Preview Live
            </Button>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <div className={`mx-auto bg-white dark:bg-gray-900 shadow-lg transition-all ${
              viewMode === "desktop" ? "w-full" : viewMode === "tablet" ? "w-[768px]" : "w-[375px]"
            }`}>
              <iframe 
                key={previewKey}
                src={`/${params.id === 'home' ? '' : params.id}`} 
                className="w-full h-full min-h-[800px] border-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Logic Editor Modal */}
      <Modal isOpen={showLogicEditor} onClose={() => setShowLogicEditor(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Section Settings: {selectedSection?.name}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select 
                label="Visibility Condition"
                selectedKeys={[selectedSection?.config?.visibility || "always"]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0];
                  updateSectionConfig(selectedSection.id, { visibility: value });
                }}
              >
                <SelectItem key="always">Always Show</SelectItem>
                <SelectItem key="logged-in">Logged In Users Only</SelectItem>
                <SelectItem key="guest">Guest Users Only</SelectItem>
                <SelectItem key="mobile">Mobile Only</SelectItem>
                <SelectItem key="desktop">Desktop Only</SelectItem>
              </Select>

              <Input 
                label="Custom CSS Class" 
                value={selectedSection?.config?.cssClass || ""}
                onChange={(e) => updateSectionConfig(selectedSection.id, { cssClass: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowLogicEditor(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* SEO Modal */}
      <Modal isOpen={showSEO} onClose={() => setShowSEO(false)}>
        <ModalContent>
          <ModalHeader>SEO Settings</ModalHeader>
          <ModalBody>
            <Input 
              label="Meta Title" 
              value={pageData.seo?.title || ""}
              onChange={(e) => setPageData({ ...pageData, seo: { ...pageData.seo, title: e.target.value }})}
            />
            <Textarea 
              label="Meta Description"
              value={pageData.seo?.description || ""}
              onChange={(e) => setPageData({ ...pageData, seo: { ...pageData.seo, description: e.target.value }})}
            />
            <Input 
              label="Keywords"
              value={pageData.seo?.keywords || ""}
              onChange={(e) => setPageData({ ...pageData, seo: { ...pageData.seo, keywords: e.target.value }})}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowSEO(false)}>Cancel</Button>
            <Button color="primary" onPress={() => {
              saveChanges({ seo: pageData.seo });
              setShowSEO(false);
            }}>Save SEO</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Publish Modal */}
      <Modal isOpen={showPublish} onClose={() => setShowPublish(false)}>
        <ModalContent>
          <ModalHeader>Publish Options</ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <Button className="w-full" color="success" onPress={publishPage}>
                Publish Now
              </Button>
              <Input 
                type="datetime-local"
                label="Schedule for Later"
                onChange={(e) => schedulePage(e.target.value)}
              />
              <Button className="w-full" variant="flat" onPress={() => {
                saveChanges({ status: "draft" });
                setShowPublish(false);
              }}>
                Save as Draft
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Version History Modal */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Version History</ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              {versions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No version history yet</p>
              ) : (
                versions.map((version) => (
                  <Card key={version.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{new Date(version.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Modified by {version.modifiedBy}</p>
                      </div>
                      <Button size="sm" onPress={() => rollbackVersion(version.id)}>
                        Restore
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </AdminOnly>
  );
}
