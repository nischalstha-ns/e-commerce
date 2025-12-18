"use client";

import { useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import { Upload, Search, Trash2, Copy, Loader2 } from "lucide-react";
import AdminOnly from "../components/AdminOnly";
import toast from "react-hot-toast";
import { uploadMediaToCloudinary } from "@/lib/utils/cloudinary";

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(file => uploadMediaToCloudinary(file))
      );
      setMedia([...media, ...uploaded]);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const deleteMedia = (id) => {
    setMedia(media.filter(m => m.id !== id));
    toast.success("Media deleted");
  };

  return (
    <AdminOnly>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Media Library</h1>
          <div>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              id="media-upload"
              onChange={handleUpload}
            />
            <Button 
              color="primary" 
              startContent={uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              onPress={() => document.getElementById('media-upload').click()}
              isDisabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Media'}
            </Button>
          </div>
        </div>

        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startContent={<Search className="w-4 h-4" />}
          className="mb-6"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <Card key={item.id} className="p-2">
              <img src={item.url} alt={item.name} className="w-full h-32 object-cover rounded mb-2" />
              <div className="flex gap-1">
                <Button size="sm" variant="light" isIconOnly onPress={() => copyUrl(item.url)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="light" isIconOnly color="danger" onPress={() => deleteMedia(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminOnly>
  );
}
