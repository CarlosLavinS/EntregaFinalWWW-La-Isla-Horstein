import express from "express";
import cors from "cors";
import grpc from "@grpc/grpc-js";
import { config } from "../shared/config.js";
import { asyncHandler, errorMiddleware } from "../shared/http.js";
import { bindGrpcServer, loadFukusukePackage } from "../shared/grpc.js";
import { prisma } from "../shared/prisma.js";
import { PrismaUserRepository } from "./repositories/PrismaUserRepository.js";
import { SimulatedEmailValidator } from "./services/EmailValidator.js";
import { UserService } from "./services/UserService.js";

export function buildUserService() {
  return new UserService(new PrismaUserRepository(prisma), new SimulatedEmailValidator());
}

export async function startUserServers(service = buildUserService()) {
  const proto = loadFukusukePackage();
  const grpcServer = new grpc.Server();

  grpcServer.addService(proto.fukusuke.UserService.service, {
    createCustomer: asyncUnary((request) => service.createCustomer(request)),
    authenticate: asyncUnary((request) => service.authenticate(request.email, request.password)),
    getCustomer: asyncUnary((request) => service.getCustomer(request.id)),
    listCustomers: asyncUnary(async () => ({ users: await service.listCustomers() }))
  });

  await bindGrpcServer(grpcServer, config.userGrpcUrl);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => response.json({ service: "user-service", ok: true }));
  app.post(
    "/customers",
    asyncHandler(async (request, response) => {
      response.status(201).json(await service.createCustomer(request.body));
    })
  );
  app.post(
    "/auth/login",
    asyncHandler(async (request, response) => {
      response.json(await service.authenticate(request.body.email, request.body.password));
    })
  );
  app.get(
    "/customers",
    asyncHandler(async (_request, response) => {
      response.json(await service.listCustomers());
    })
  );
  app.get(
    "/customers/:id",
    asyncHandler(async (request, response) => {
      response.json(await service.getCustomer(String(request.params.id)));
    })
  );
  app.use(errorMiddleware);

  app.listen(config.userRestPort, () => {
    console.log(`user-service REST http://localhost:${config.userRestPort}`);
    console.log(`user-service gRPC ${config.userGrpcUrl}`);
  });
}

function asyncUnary(handler: (request: any) => Promise<any>) {
  return (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    handler(call.request)
      .then((response) => callback(null, response))
      .catch((error) => callback({ code: grpc.status.INVALID_ARGUMENT, message: error.message }));
  };
}
