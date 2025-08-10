"use client";

import { CircularProgress } from "@heroui/react";

export default function LoadingSpinner({ message = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <CircularProgress size="lg" />
            <p className="text-gray-600 text-sm">{message}</p>
        </div>
    );
}