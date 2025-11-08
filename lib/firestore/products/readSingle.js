import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useSWR from 'swr';

const fetcher = async (id) => {
  if (!db || !id || typeof id !== 'string') {
    throw new Error('Invalid product ID or database not available');
  }
  
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        name: data.name || 'Unnamed Product',
        price: data.price || 0,
        stock: data.stock || 0,
        imageURLs: data.imageURLs || [],
        description: data.description || 'No description available',
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const useProduct = (id) => {
  const { data, error, isLoading } = useSWR(
    id ? `product-${id}` : null,
    () => fetcher(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      errorRetryCount: 1,
      errorRetryInterval: 500
    }
  );

  return { data, error, isLoading };
};