import { Categoria, Producto } from "../domain/Catalog.js";

export interface CatalogPersistenceRepository {
  saveCategory(category: Categoria): Promise<Categoria>;
  findCategoryById(id: string): Promise<Categoria | undefined>;
  listCategories(): Promise<Categoria[]>;
  saveProduct(product: Producto): Promise<Producto>;
  findProductById(id: string): Promise<Producto | undefined>;
  listProducts(): Promise<Producto[]>;
}

export class CatalogRepository {
  private readonly categories = new Map<string, Categoria>();
  private readonly products = new Map<string, Producto>();

  async saveCategory(category: Categoria): Promise<Categoria> {
    this.categories.set(category.id, category);
    return category;
  }

  async findCategoryById(id: string): Promise<Categoria | undefined> {
    return this.categories.get(id);
  }

  async listCategories(): Promise<Categoria[]> {
    return Array.from(this.categories.values());
  }

  async saveProduct(product: Producto): Promise<Producto> {
    this.products.set(product.id, product);
    return product;
  }

  async findProductById(id: string): Promise<Producto | undefined> {
    return this.products.get(id);
  }

  async listProducts(): Promise<Producto[]> {
    return Array.from(this.products.values());
  }
}
