import { config } from "../shared/config.js";
import { grpcCredentials, loadFukusukePackage, unary } from "../shared/grpc.js";

const proto = loadFukusukePackage();

const userClient = new proto.fukusuke.UserService(config.userGrpcUrl, grpcCredentials());
const catalogClient = new proto.fukusuke.CatalogService(config.catalogGrpcUrl, grpcCredentials());
const orderClient = new proto.fukusuke.OrderService(config.orderGrpcUrl, grpcCredentials());

export const clients = {
  users: {
    createCustomer: (input: any) => unary(userClient, "createCustomer", input),
    authenticate: (input: any) => unary(userClient, "authenticate", input),
    getCustomer: (id: string) => unary<any, any>(userClient, "getCustomer", { id }),
    listCustomers: () => unary<any, any>(userClient, "listCustomers", {})
  },
  catalog: {
    createCategory: (name: string) => unary(catalogClient, "createCategory", { name }),
    listCategories: () => unary<any, any>(catalogClient, "listCategories", {}),
    createProduct: (input: any) => unary(catalogClient, "createProduct", input),
    getProduct: (id: string) => unary<any, any>(catalogClient, "getProduct", { id }),
    listProducts: () => unary<any, any>(catalogClient, "listProducts", {}),
    updateAvailability: (id: string, available: boolean) =>
      unary(catalogClient, "updateAvailability", { id, available })
  },
  orders: {
    createOrder: (input: any) => unary(orderClient, "createOrder", input),
    confirmPayment: (input: any) => unary(orderClient, "confirmPayment", input),
    cancelOrder: (input: any) => unary(orderClient, "cancelOrder", input),
    getOrder: (id: string) => unary<any, any>(orderClient, "getOrder", { id }),
    listOrders: () => unary<any, any>(orderClient, "listOrders", {}),
    getSalesReport: (from: string, to: string) => unary<any, any>(orderClient, "getSalesReport", { from, to })
  }
};
