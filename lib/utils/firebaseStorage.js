import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../firestore/firebase';

const storage = getStorage(app);

export const uploadToFirebase = async (file, folder = 'uploads') => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  
  return {
    url,
    path: snapshot.ref.fullPath,
    name: fileName
  };
};

export const uploadProfilePhoto = async (file, uid) => {
  return uploadToFirebase(file, `users/${uid}`);
};

export const uploadProductImage = async (file, productId) => {
  return uploadToFirebase(file, `products/${productId || 'temp'}`);
};

export const uploadCategoryImage = async (file, categoryId) => {
  return uploadToFirebase(file, `categories/${categoryId || 'temp'}`);
};

export const deleteFromFirebase = async (path) => {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
};
