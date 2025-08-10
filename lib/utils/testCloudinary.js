// Test Cloudinary configuration
export const testCloudinaryConfig = () => {
    console.log('=== Cloudinary Configuration Test ===');
    console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    console.log('API Key:', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
    
    const isConfigured = !!(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    
    console.log('Configuration Status:', isConfigured ? 'OK' : 'MISSING');
    
    if (!isConfigured) {
        console.error('Missing required Cloudinary environment variables');
        return false;
    }
    
    return true;
};