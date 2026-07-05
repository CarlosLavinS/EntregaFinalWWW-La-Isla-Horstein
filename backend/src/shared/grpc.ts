import path from "node:path";
import { fileURLToPath } from "node:url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const protoPath = path.resolve(currentDir, "../../proto/fukusuke.proto");

export type GrpcPackage = {
  fukusuke: Record<string, any>;
};

export function loadFukusukePackage(): GrpcPackage {
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  return grpc.loadPackageDefinition(packageDefinition) as unknown as GrpcPackage;
}

export function grpcCredentials() {
  return grpc.credentials.createInsecure();
}

export function bindGrpcServer(server: grpc.Server, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    server.bindAsync(url, grpc.ServerCredentials.createInsecure(), (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export function unary<TRequest, TResponse>(
  client: Record<string, any>,
  method: string,
  request: TRequest
): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    client[method](request, (error: Error | null, response: TResponse) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}
