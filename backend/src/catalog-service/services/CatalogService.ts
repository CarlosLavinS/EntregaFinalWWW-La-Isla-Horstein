import { randomUUID } from "node:crypto";
import { Categoria, Producto } from "../domain/Catalog.js";
import type { CatalogPersistenceRepository } from "../repositories/CatalogRepository.js";

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
};

export class CatalogService {
  constructor(private readonly repository: CatalogPersistenceRepository) {}

  async seedDemoData() {
    if ((await this.repository.listCategories()).length > 0) {
      return;
    }
    const rolls = await this.createCategory("Rolls");
    const tablas = await this.createCategory("Tablas");
    await this.createProduct({
      name: "Avocado roll",
      description: "Roll de palta, queso crema y salmon.",
      price: 6900,
      imageUrl: "https://example.com/avocado-roll.jpg",
      categoryId: rolls.id
    });
    await this.createProduct({
      name: "Tabla Fukusuke 30 piezas",
      description: "Seleccion mixta para compartir.",
      price: 18900,
      imageUrl: "https://example.com/tabla-fukusuke.jpg",
      categoryId: tablas.id
    });
  }

  async createCategory(name: string): Promise<Categoria> {
    this.require(name, "El nombre de la categoria es obligatorio.");
    return this.repository.saveCategory(new Categoria(randomUUID(), name));
  }

  async listCategories(): Promise<Categoria[]> {
    return this.repository.listCategories();
  }

  async createProduct(input: ProductInput): Promise<Producto> {
    this.require(input.name, "El nombre del producto es obligatorio.");
    this.require(input.categoryId, "La categoria es obligatoria.");
    if (input.price <= 0) {
      throw new Error("El precio debe ser mayor a cero.");
    }
    if (!(await this.repository.findCategoryById(input.categoryId))) {
      throw new Error("Categoria no encontrada.");
    }
    return this.repository.saveProduct(
      new Producto(randomUUID(), input.name, input.description, input.price, input.imageUrl, input.categoryId, true)
    );
  }

  async getProduct(id: string): Promise<Producto> {
    const product = await this.repository.findProductById(id);
    if (!product) {
      throw new Error("Producto no encontrado.");
    }
    return product;
  }

  async listProducts(): Promise<Producto[]> {
    return this.repository.listProducts();
  }

  async updateAvailability(id: string, available: boolean): Promise<Producto> {
    const product = await this.getProduct(id);
    const updated = product.updateAvailability(available);
    return this.repository.saveProduct(updated);
  }

  private require(value: string, message: string) {
    if (!value || value.trim().length === 0) {
      throw new Error(message);
    }
  }
}
