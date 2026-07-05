import type { Category as PrismaCategory, PrismaClient, Product as PrismaProduct } from "@prisma/client";
import { Categoria, Producto } from "../domain/Catalog.js";
import type { CatalogPersistenceRepository } from "./CatalogRepository.js";

export class PrismaCatalogRepository implements CatalogPersistenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveCategory(category: Categoria): Promise<Categoria> {
    await this.prisma.category.upsert({
      where: { id: category.id },
      update: { name: category.name },
      create: { id: category.id, name: category.name }
    });
    return category;
  }

  async findCategoryById(id: string): Promise<Categoria | undefined> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    return category ? toCategory(category) : undefined;
  }

  async listCategories(): Promise<Categoria[]> {
    const categories = await this.prisma.category.findMany();
    return categories.map(toCategory);
  }

  async saveProduct(product: Producto): Promise<Producto> {
    await this.prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        available: product.available
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        available: product.available
      }
    });
    return product;
  }

  async findProductById(id: string): Promise<Producto | undefined> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return product ? toProduct(product) : undefined;
  }

  async listProducts(): Promise<Producto[]> {
    const products = await this.prisma.product.findMany();
    return products.map(toProduct);
  }
}

function toCategory(category: PrismaCategory): Categoria {
  return new Categoria(category.id, category.name);
}

function toProduct(product: PrismaProduct): Producto {
  return new Producto(
    product.id,
    product.name,
    product.description,
    product.price,
    product.imageUrl,
    product.categoryId,
    product.available
  );
}
