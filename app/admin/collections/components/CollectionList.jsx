"use client";

import { deleteCollection } from "@/lib/firestore/collections/write";
import { useCollections } from "@/lib/firestore/collections/read";
import { useProducts } from "@/lib/firestore/products/read";
import { Button, CircularProgress, Chip, Card, CardBody } from "@heroui/react";
import { Edit2, Trash2, Star, Package, Eye } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CollectionList({ onEdit }) {
    const { data: collections, error, isLoading } = useCollections();
    const { data: products } = useProducts();

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold">Collections</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections?.map((collection) => (
                    <CollectionCard 
                        key={collection.id} 
                        collection={collection} 
                        products={products}
                        onEdit={onEdit}
                    />
                ))}
            </div>

            {collections?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No collections found
                </div>
            )}
        </div>
    );
}

function CollectionCard({ collection, products, onEdit }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this collection?")) return;
        
        setIsDeleting(true);
        try {
            await deleteCollection({ id: collection.id });
            toast.success("Collection deleted successfully");
        } catch (error) {
            toast.error(error?.message || "Error deleting collection");
        }
        setIsDeleting(false);
    };

    const collectionProducts = products?.filter(product => 
        collection.productIds?.includes(product.id)
    ) || [];

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-0">
                {/* Collection Image */}
                <div className="relative">
                    {collection.imageURL ? (
                        <img 
                            src={collection.imageURL} 
                            alt={collection.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                        />
                    ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                        <Chip 
                            color={collection.status === 'active' ? 'success' : 'default'} 
                            size="sm"
                            className="capitalize"
                        >
                            {collection.status}
                        </Chip>
                    </div>

                    {/* Featured Badge */}
                    {collection.featured && (
                        <div className="absolute top-2 right-2">
                            <Chip 
                                color="warning" 
                                size="sm"
                                startContent={<Star size={12} />}
                            >
                                Featured
                            </Chip>
                        </div>
                    )}
                </div>

                {/* Collection Info */}
                <div className="p-4 space-y-3">
                    <div>
                        <h3 className="font-semibold text-lg">{collection.name}</h3>
                        <p className="text-sm text-gray-600">{collection.slug}</p>
                    </div>

                    {collection.description && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                            {collection.description}
                        </p>
                    )}

                    {/* Product Count */}
                    <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                            {collection.productIds?.length || 0} products
                        </span>
                    </div>

                    {/* Product Preview */}
                    {collectionProducts.length > 0 && (
                        <div className="flex gap-1 overflow-hidden">
                            {collectionProducts.slice(0, 4).map((product) => (
                                <img 
                                    key={product.id}
                                    src={product.imageURLs?.[0]} 
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded border"
                                />
                            ))}
                            {collectionProducts.length > 4 && (
                                <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                                    <span className="text-xs text-gray-600">
                                        +{collectionProducts.length - 4}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-gray-500">
                        Created: {formatDate(collection.timestampCreate)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            onClick={() => onEdit(collection)}
                            size="sm"
                            variant="light"
                            startContent={<Edit2 size={14} />}
                            className="flex-1"
                        >
                            Edit
                        </Button>
                        
                        <Button
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            isDisabled={isDeleting}
                            size="sm"
                            color="danger"
                            variant="light"
                            startContent={<Trash2 size={14} />}
                            className="flex-1"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}