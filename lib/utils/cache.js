import { mutate } from 'swr';

export const clearAllCache = () => {
  mutate(() => true, undefined, { revalidate: false });
};

export const clearProductsCache = () => {
  mutate(key => typeof key === 'string' && key.startsWith('products'), undefined, { revalidate: false });
};

export const clearCategoriesCache = () => {
  mutate(key => typeof key === 'string' && key.startsWith('categories'), undefined, { revalidate: false });
};

export const clearBrandsCache = () => {
  mutate(key => typeof key === 'string' && key.startsWith('brands'), undefined, { revalidate: false });
};