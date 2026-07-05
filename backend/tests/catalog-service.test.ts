import { describe, expect, it } from "vitest";
import { CatalogRepository } from "../src/catalog-service/repositories/CatalogRepository.js";
import { CatalogService } from "../src/catalog-service/services/CatalogService.js";

describe("CatalogService", () => {
  it("crea productos asociados a categorias y actualiza disponibilidad", async () => {
    const service = new CatalogService(new CatalogRepository());
    const category = await service.createCategory("Rolls");
    const product = await service.createProduct({
      name: "California roll",
      description: "Roll clasico",
      price: 5900,
      imageUrl: "https://example.com/california.jpg",
      categoryId: category.id
    });

    const updated = await service.updateAvailability(product.id, false);

    expect(updated.available).toBe(false);
    expect(updated.categoryId).toBe(category.id);
  });
});
