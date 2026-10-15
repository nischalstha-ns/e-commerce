// Test Cloudinary configuration
export const testCloudinaryConfig = () => {
    // NOTE: never log the API key — it would leak into the browser console.
    const isConfigured = !!(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    if (!isConfigured && process.env.NODE_ENV === 'development') {
        console.error('Missing required Cloudinary environment variables');
        return false;
    }

    return true;
};