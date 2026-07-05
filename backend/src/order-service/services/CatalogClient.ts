import { config } from "../../shared/config.js";
import { grpcCredentials, loadFukusukePackage, unary } from "../../shared/grpc.js";

export type ProductSnapshot = {
  id: string;
  name: string;
  price: number;
  available: boolean;
};

export interface CatalogClient {
  getProduct(id: string): Promise<ProductSnapshot>;
}

export class GrpcCatalogClient implements CatalogClient {
  private readonly client: Record<string, any>;

  constructor() {
    const proto = loadFukusukePackage();
    this.client = new proto.fukusuke.CatalogService(config.catalogGrpcUrl, grpcCredentials());
  }

  getProduct(id: string): Promise<ProductSnapshot> {
    return unary(this.client, "getProduct", { id });
  }
}
