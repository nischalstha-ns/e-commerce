export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) && 
           (parsed.hostname.includes('cloudinary.com') || 
            parsed.hostname.includes('pexels.com'));
  } catch {
    return false;
  }
}

export function sanitizeImageUrl(url) {
  return isValidImageUrl(url) ? url : '/placeholder.png';
}
