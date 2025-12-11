import { supabase } from './client';

export const uploadToSupabase = async (file, folder = 'uploads') => {
  if (!supabase) throw new Error('Supabase not configured');

  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file, { upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return { url: publicUrl, path: filePath };
};

export const uploadProfilePhoto = async (file, uid) => {
  return uploadToSupabase(file, `users/${uid}`);
};

export const uploadProductImage = async (file, productId) => {
  return uploadToSupabase(file, `products/${productId || 'temp'}`);
};

export const uploadCategoryImage = async (file, categoryId) => {
  return uploadToSupabase(file, `categories/${categoryId || 'temp'}`);
};

export const deleteFromSupabase = async (path) => {
  if (!supabase) return;
  await supabase.storage.from('images').remove([path]);
};
