import { clients } from "./grpcClients.js";

export const resolvers = {
  Query: {
    customers: async () => {
      const response = await clients.users.listCustomers();
      return response.users;
    },
    products: async () => {
      const response = await clients.catalog.listProducts();
      return response.products;
    },
    categories: async () => {
      const response = await clients.catalog.listCategories();
      return response.categories;
    },
    orders: async () => {
      const response = await clients.orders.listOrders();
      return response.orders;
    },
    orderDetail: async (_parent: unknown, args: { id: string }) => {
      const order = await clients.orders.getOrder(args.id);
      const customer = await clients.users.getCustomer(order.customerId);
      const products = await Promise.all(order.items.map((item: any) => clients.catalog.getProduct(item.productId)));
      return { order, customer, products };
    },
    salesReport: async (_parent: unknown, args: { from?: string; to?: string }) => {
      return clients.orders.getSalesReport(args.from ?? "", args.to ?? "");
    }
  },
  OrderItem: {
    product: async (item: { productId: string }) => clients.catalog.getProduct(item.productId)
  },
  Mutation: {
    createCustomer: async (_parent: unknown, args: { input: any }) => clients.users.createCustomer(args.input),
    authenticate: async (_parent: unknown, args: { input: any }) => clients.users.authenticate(args.input),
    createCategory: async (_parent: unknown, args: { name: string }) => clients.catalog.createCategory(args.name),
    createProduct: async (_parent: unknown, args: { input: any }) => clients.catalog.createProduct(args.input),
    updateProductAvailability: async (_parent: unknown, args: { id: string; available: boolean }) =>
      clients.catalog.updateAvailability(args.id, args.available),
    createOrder: async (_parent: unknown, args: { input: any }) => clients.orders.createOrder(args.input),
    confirmPayment: async (
      _parent: unknown,
      args: { orderId: string; externalPlatform: string; transactionToken: string }
    ) => clients.orders.confirmPayment(args),
    cancelOrder: async (_parent: unknown, args: { orderId: string; reason: string }) =>
      clients.orders.cancelOrder(args)
  }
};
