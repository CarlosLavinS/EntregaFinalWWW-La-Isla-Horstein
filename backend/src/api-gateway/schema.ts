export const typeDefs = `#graphql
  type Customer {
    id: ID!
    email: String!
    profile: String!
    run: String!
    fullName: String!
    address: String!
    commune: String!
    province: String!
    region: String!
    birthDate: String!
    sex: String!
    phone: String!
    emailValidated: Boolean!
  }

  type AuthResponse {
    ok: Boolean!
    userId: ID
    profile: String
  }

  type Category {
    id: ID!
    name: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    imageUrl: String!
    available: Boolean!
    categoryId: ID!
  }

  type OrderItem {
    productId: ID!
    quantity: Int!
    unitPrice: Float!
    subtotal: Float!
    product: Product
  }

  type Order {
    id: ID!
    customerId: ID!
    createdAt: String!
    status: String!
    cancellationReason: String!
    deliveryAddress: String!
    distanceKm: Float!
    total: Float!
    items: [OrderItem!]!
  }

  type Payment {
    id: ID!
    orderId: ID!
    externalPlatform: String!
    transactionToken: String!
    status: String!
  }

  type OrderDetail {
    order: Order!
    customer: Customer!
    products: [Product!]!
  }

  type SaleReport {
    totalSales: Int!
    totalAmount: Float!
    orders: [Order!]!
  }

  input CustomerInput {
    run: String!
    fullName: String!
    address: String!
    commune: String!
    province: String!
    region: String!
    birthDate: String!
    sex: String!
    email: String!
    phone: String!
    password: String!
  }

  input AuthInput {
    email: String!
    password: String!
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
    imageUrl: String!
    categoryId: ID!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input CreateOrderInput {
    customerId: ID!
    deliveryAddress: String!
    distanceKm: Float!
    items: [OrderItemInput!]!
  }

  type Query {
    customers: [Customer!]!
    products: [Product!]!
    categories: [Category!]!
    orders: [Order!]!
    orderDetail(id: ID!): OrderDetail!
    salesReport(from: String, to: String): SaleReport!
  }

  type Mutation {
    createCustomer(input: CustomerInput!): Customer!
    authenticate(input: AuthInput!): AuthResponse!
    createCategory(name: String!): Category!
    createProduct(input: ProductInput!): Product!
    updateProductAvailability(id: ID!, available: Boolean!): Product!
    createOrder(input: CreateOrderInput!): Order!
    confirmPayment(orderId: ID!, externalPlatform: String!, transactionToken: String!): Payment!
    cancelOrder(orderId: ID!, reason: String!): Order!
  }
`;
