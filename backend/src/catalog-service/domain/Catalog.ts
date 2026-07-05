export class Categoria {
  constructor(
    public readonly id: string,
    public readonly name: string
  ) {}
}

export class Producto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly imageUrl: string,
    public readonly categoryId: string,
    public readonly available = true
  ) {}

  updateAvailability(available: boolean): Producto {
    return new Producto(
      this.id,
      this.name,
      this.description,
      this.price,
      this.imageUrl,
      this.categoryId,
      available
    );
  }
}
