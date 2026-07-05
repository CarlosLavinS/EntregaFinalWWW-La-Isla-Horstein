import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Product } from './CartContext';
import {
  createProduct as createBackendProduct,
  fetchCatalog,
  setProductAvailability,
  type ApiCategory,
} from '../services/api';

interface ProductContextType {
  products: Product[];
  categories: ApiCategory[];
  isLoading: boolean;
  error: string;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const defaultCategories: ApiCategory[] = [{ id: 'todos', name: 'Todos', icon: '🍱' }];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshProducts = async () => {
    setIsLoading(true);
    try {
      const catalog = await fetchCatalog();
      setProducts(catalog.products);
      setCategories(catalog.categories);
      setError('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo cargar el catalogo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const createdProduct = await createBackendProduct(product);
    setProducts((prevProducts) => [...prevProducts, createdProduct]);
  };

  const updateProduct = async (id: string, updatedFields: Partial<Omit<Product, 'id'>>) => {
    const currentProduct = products.find((product) => product.id === id);
    if (!currentProduct) return;

    const replacement = await createBackendProduct({
      ...currentProduct,
      ...updatedFields,
    });
    await setProductAvailability(id, false);
    setProducts((prevProducts) => prevProducts.map((product) => (product.id === id ? replacement : product)));
  };

  const deleteProduct = async (id: string) => {
    await setProductAvailability(id, false);
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        isLoading,
        error,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
