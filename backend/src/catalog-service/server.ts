import express from "express";
import cors from "cors";
import grpc from "@grpc/grpc-js";
import { config } from "../shared/config.js";
import { asyncHandler, errorMiddleware } from "../shared/http.js";
import { bindGrpcServer, loadFukusukePackage } from "../shared/grpc.js";
import { prisma } from "../shared/prisma.js";
import { PrismaCatalogRepository } from "./repositories/PrismaCatalogRepository.js";
import { CatalogService } from "./services/CatalogService.js";

export async function buildCatalogService() {
  const service = new CatalogService(new PrismaCatalogRepository(prisma));
  await service.seedDemoData();
  return service;
}

export async function startCatalogServers(service?: CatalogService) {
  service ??= await buildCatalogService();
  const proto = loadFukusukePackage();
  const grpcServer = new grpc.Server();

  grpcServer.addService(proto.fukusuke.CatalogService.service, {
    createCategory: asyncUnary((request) => service.createCategory(request.name)),
    listCategories: asyncUnary(async () => ({ categories: await service.listCategories() })),
    createProduct: asyncUnary((request) => service.createProduct(request)),
    getProduct: asyncUnary((request) => service.getProduct(request.id)),
    listProducts: asyncUnary(async () => ({ products: await service.listProducts() })),
    updateAvailability: asyncUnary((request) => service.updateAvailability(request.id, request.available))
  });

  await bindGrpcServer(grpcServer, config.catalogGrpcUrl);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => response.json({ service: "catalog-service", ok: true }));
  app.get(
    "/categories",
    asyncHandler(async (_request, response) => {
      response.json(await service.listCategories());
    })
  );
  app.post(
    "/categories",
    asyncHandler(async (request, response) => {
      response.status(201).json(await service.createCategory(request.body.name));
    })
  );
  app.get(
    "/products",
    asyncHandler(async (_request, response) => {
      response.json(await service.listProducts());
    })
  );
  app.get(
    "/products/:id",
    asyncHandler(async (request, response) => {
      response.json(await service.getProduct(String(request.params.id)));
    })
  );
  app.post(
    "/products",
    asyncHandler(async (request, response) => {
      response.status(201).json(await service.createProduct(request.body));
    })
  );
  app.patch(
    "/products/:id/availability",
    asyncHandler(async (request, response) => {
      response.json(await service.updateAvailability(String(request.params.id), Boolean(request.body.available)));
    })
  );
  app.use(errorMiddleware);

  app.listen(config.catalogRestPort, () => {
    console.log(`catalog-service REST http://localhost:${config.catalogRestPort}`);
    console.log(`catalog-service gRPC ${config.catalogGrpcUrl}`);
  });
}

function asyncUnary(handler: (request: any) => Promise<any>) {
  return (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    handler(call.request)
      .then((response) => callback(null, response))
      .catch((error) => callback({ code: grpc.status.INVALID_ARGUMENT, message: error.message }));
  };
}
