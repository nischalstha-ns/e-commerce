// Unified image upload - supports Supabase (default) or Firebase Storage
import * as supabaseStorage from '../supabase/storage';
import * as firebaseStorage from './firebaseStorage';

const provider = process.env.NEXT_PUBLIC_IMAGE_PROVIDER || 'supabase';

export const uploadImage = async (file, folder = 'uploads') => {
  if (provider === 'firebase') {
    return firebaseStorage.uploadToFirebase(file, folder);
  }
  return supabaseStorage.uploadToSupabase(file, folder);
};

export const uploadProfilePhoto = async (file, uid) => {
  if (provider === 'firebase') {
    return firebaseStorage.uploadProfilePhoto(file, uid);
  }
  return supabaseStorage.uploadProfilePhoto(file, uid);
};

export const uploadProductImage = async (file, productId) => {
  if (provider === 'firebase') {
    return firebaseStorage.uploadProductImage(file, productId);
  }
  return supabaseStorage.uploadProductImage(file, productId);
};

export const uploadCategoryImage = async (file, categoryId) => {
  if (provider === 'firebase') {
    return firebaseStorage.uploadCategoryImage(file, categoryId);
  }
  return supabaseStorage.uploadCategoryImage(file, categoryId);
};

export const deleteImage = async (path) => {
  if (provider === 'firebase') {
    return firebaseStorage.deleteFromFirebase(path);
  }
  return supabaseStorage.deleteFromSupabase(path);
};
