import dotenv from "dotenv";

dotenv.config();

export const config = {
  userGrpcUrl: process.env.USER_GRPC_URL ?? "localhost:50051",
  catalogGrpcUrl: process.env.CATALOG_GRPC_URL ?? "localhost:50052",
  orderGrpcUrl: process.env.ORDER_GRPC_URL ?? "localhost:50053",
  userRestPort: Number(process.env.USER_REST_PORT ?? 3001),
  catalogRestPort: Number(process.env.CATALOG_REST_PORT ?? 3002),
  orderRestPort: Number(process.env.ORDER_REST_PORT ?? 3003),
  gatewayPort: Number(process.env.GATEWAY_PORT ?? 4000)
};
