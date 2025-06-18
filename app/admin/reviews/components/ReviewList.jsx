"use client";

import { useReviews } from "@/lib/firestore/reviews/read";
import { useProducts } from "@/lib/firestore/products/read";
import { updateReviewStatus, deleteReview } from "@/lib/firestore/reviews/write";
import { Button, CircularProgress, Select, SelectItem, Chip, Card, CardBody, Avatar, Textarea } from "@heroui/react";
import { Star, CheckCircle, Clock, XCircle, Trash2, User, Calendar } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ReviewList() {
    const [statusFilter, setStatusFilter] = useState("");
    const [ratingFilter, setRatingFilter] = useState("");
    const { data: reviews, error, isLoading } = useReviews({
        status: statusFilter || undefined,
        rating: ratingFilter || undefined
    });
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
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <Select
                    placeholder="All Status"
                    className="w-48"
                    selectedKeys={statusFilter ? [statusFilter] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setStatusFilter(selectedKey || "");
                    }}
                >
                    <SelectItem key="pending" value="pending">Pending</SelectItem>
                    <SelectItem key="approved" value="approved">Approved</SelectItem>
                    <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                </Select>

                <Select
                    placeholder="All Ratings"
                    className="w-48"
                    selectedKeys={ratingFilter ? [ratingFilter] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setRatingFilter(selectedKey || "");
                    }}
                >
                    <SelectItem key="5" value="5">5 Stars</SelectItem>
                    <SelectItem key="4" value="4">4 Stars</SelectItem>
                    <SelectItem key="3" value="3">3 Stars</SelectItem>
                    <SelectItem key="2" value="2">2 Stars</SelectItem>
                    <SelectItem key="1" value="1">1 Star</SelectItem>
                </Select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews?.map((review) => (
                    <ReviewCard 
                        key={review.id} 
                        review={review} 
                        products={products}
                    />
                ))}
            </div>

            {reviews?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No reviews found
                </div>
            )}
        </div>
    );
}

function ReviewCard({ review, products }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [adminNote, setAdminNote] = useState("");

    const product = products?.find(p => p.id === review.productId);

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            await updateReviewStatus({ 
                id: review.id, 
                status: newStatus,
                adminNote: adminNote.trim() || null
            });
            toast.success(`Review ${newStatus} successfully`);
            setAdminNote("");
        } catch (error) {
            toast.error(error?.message || "Error updating review status");
        }
        setIsUpdating(false);
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
        
        setIsDeleting(true);
        try {
            await deleteReview({ id: review.id });
            toast.success("Review deleted successfully");
        } catch (error) {
            toast.error(error?.message || "Error deleting review");
        }
        setIsDeleting(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "approved": return "success";
            case "pending": return "warning";
            case "rejected": return "danger";
            default: return "default";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "approved": return CheckCircle;
            case "pending": return Clock;
            case "rejected": return XCircle;
            default: return Clock;
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const StatusIcon = getStatusIcon(review.status);

    return (
        <Card className="shadow-sm">
            <CardBody className="p-6">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <Avatar
                                size="sm"
                                name={review.userName}
                                className="bg-gray-200"
                                fallback={<User size={16} />}
                            />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{review.userName}</span>
                                    <Chip 
                                        color={getStatusColor(review.status)} 
                                        size="sm" 
                                        className="capitalize"
                                        startContent={<StatusIcon size={12} />}
                                    >
                                        {review.status}
                                    </Chip>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {formatDate(review.timestampCreate)}
                                    </span>
                                    {review.userEmail && (
                                        <span>{review.userEmail}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={`${
                                            i < review.rating 
                                                ? "text-yellow-500 fill-current" 
                                                : "text-gray-300"
                                        }`}
                                    />
                                ))}
                                <span className="text-sm font-medium ml-1">{review.rating}</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    {product && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={product.imageURLs?.[0]} 
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div>
                                    <p className="font-medium text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-600">Product ID: {review.productId}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Review Comment */}
                    <div className="bg-white border rounded-lg p-4">
                        <p className="text-gray-800 text-sm leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Admin Note */}
                    {review.adminNote && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-800 mb-1">Admin Note:</p>
                            <p className="text-sm text-blue-700">{review.adminNote}</p>
                        </div>
                    )}

                    {/* Admin Actions */}
                    <div className="border-t pt-4">
                        <div className="space-y-3">
                            {/* Admin Note Input */}
                            <Textarea
                                placeholder="Add admin note (optional)"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                size="sm"
                                maxRows={2}
                            />
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {review.status !== "approved" && (
                                    <Button
                                        onClick={() => handleStatusUpdate("approved")}
                                        isLoading={isUpdating}
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                        startContent={<CheckCircle size={14} />}
                                    >
                                        Approve
                                    </Button>
                                )}
                                
                                {review.status !== "rejected" && (
                                    <Button
                                        onClick={() => handleStatusUpdate("rejected")}
                                        isLoading={isUpdating}
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                        startContent={<XCircle size={14} />}
                                    >
                                        Reject
                                    </Button>
                                )}
                                
                                {review.status !== "pending" && (
                                    <Button
                                        onClick={() => handleStatusUpdate("pending")}
                                        isLoading={isUpdating}
                                        size="sm"
                                        color="warning"
                                        variant="flat"
                                        startContent={<Clock size={14} />}
                                    >
                                        Mark Pending
                                    </Button>
                                )}
                                
                                <Button
                                    onClick={handleDelete}
                                    isLoading={isDeleting}
                                    size="sm"
                                    color="danger"
                                    variant="light"
                                    startContent={<Trash2 size={14} />}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}