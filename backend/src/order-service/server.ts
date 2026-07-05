import express from "express";
import cors from "cors";
import grpc from "@grpc/grpc-js";
import { config } from "../shared/config.js";
import { asyncHandler, errorMiddleware } from "../shared/http.js";
import { bindGrpcServer, loadFukusukePackage } from "../shared/grpc.js";
import { prisma } from "../shared/prisma.js";
import { PrismaOrderRepository } from "./repositories/PrismaOrderRepository.js";
import { GrpcCatalogClient } from "./services/CatalogClient.js";
import { OrderService } from "./services/OrderService.js";

export function buildOrderService() {
  return new OrderService(new PrismaOrderRepository(prisma), new GrpcCatalogClient());
}

export async function startOrderServers(service = buildOrderService()) {
  const proto = loadFukusukePackage();
  const grpcServer = new grpc.Server();

  grpcServer.addService(proto.fukusuke.OrderService.service, {
    createOrder: asyncUnary((request) => service.createOrder(request)),
    confirmPayment: asyncUnary((request) =>
      service.confirmPayment(request.orderId, request.externalPlatform, request.transactionToken)
    ),
    cancelOrder: asyncUnary((request) => service.cancelOrder(request.orderId, request.reason)),
    getOrder: asyncUnary((request) => service.getOrder(request.id)),
    listOrders: asyncUnary(async () => ({ orders: await service.listOrders() })),
    getSalesReport: asyncUnary((request) => service.getSalesReport(request.from, request.to))
  });

  await bindGrpcServer(grpcServer, config.orderGrpcUrl);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => response.json({ service: "order-service", ok: true }));
  app.get(
    "/orders",
    asyncHandler(async (_request, response) => {
      response.json(await service.listOrders());
    })
  );
  app.get(
    "/orders/:id",
    asyncHandler(async (request, response) => {
      response.json(await service.getOrder(String(request.params.id)));
    })
  );
  app.post(
    "/orders",
    asyncHandler(async (request, response) => {
      response.status(201).json(await service.createOrder(request.body));
    })
  );
  app.post(
    "/orders/:id/cancel",
    asyncHandler(async (request, response) => {
      response.json(await service.cancelOrder(String(request.params.id), request.body.reason));
    })
  );
  app.post(
    "/orders/:id/payments",
    asyncHandler(async (request, response) => {
      response.json(
        await service.confirmPayment(String(request.params.id), request.body.externalPlatform, request.body.transactionToken)
      );
    })
  );
  app.get(
    "/reports/sales",
    asyncHandler(async (request, response) => {
      response.json(await service.getSalesReport(String(request.query.from ?? ""), String(request.query.to ?? "")));
    })
  );
  app.use(errorMiddleware);

  app.listen(config.orderRestPort, () => {
    console.log(`order-service REST http://localhost:${config.orderRestPort}`);
    console.log(`order-service gRPC ${config.orderGrpcUrl}`);
  });
}

function asyncUnary(handler: (request: any) => Promise<any>) {
  return (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    handler(call.request)
      .then((response) => callback(null, response))
      .catch((error) => callback({ code: grpc.status.INVALID_ARGUMENT, message: error.message }));
  };
}
