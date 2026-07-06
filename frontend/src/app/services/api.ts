import type { Product } from '../context/CartContext';
import type { UserRole } from '../context/AuthContext';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export type ApiCategory = {
  id: string;
  name: string;
  icon: string;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
};

export type RegisterCustomerInput = {
  run: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type CheckoutOrderInput = {
  customerId: string;
  deliveryAddress: string;
  distanceKm: number;
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: 'cash' | 'card';
};

export type BackendOrder = {
  id: string;
  customerId: string;
  createdAt: string;
  status: string;
  deliveryAddress: string;
  distanceKm: number;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product?: {
      id: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      categoryId: string;
    };
  }>;
};

export type BackendCustomer = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
};

type BackendProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  categoryId: string;
};

export async function graphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo conectar con el backend (${response.status}).`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(' '));
  }

  if (!payload.data) {
    throw new Error('El backend no devolvio datos.');
  }

  return payload.data;
}

export async function fetchCatalog() {
  const data = await graphQL<{
    categories: Array<{ id: string; name: string }>;
    products: BackendProduct[];
  }>(`
    query Catalog {
      categories { id name }
      products {
        id
        name
        description
        price
        imageUrl
        available
        categoryId
      }
    }
  `);

  const products = data.products.filter((product) => product.available).map(toProduct);
  const categoryIdsWithProducts = new Set(products.map((product) => product.category));
  const categories = [
    { id: 'todos', name: 'Todos', icon: categoryIcon('Todos') },
    ...data.categories.filter((category) => categoryIdsWithProducts.has(category.id)).map((category) => ({
      ...category,
      icon: categoryIcon(category.name),
    })),
  ];

  return { categories, products };
}

export async function createProduct(input: Omit<Product, 'id'>) {
  const data = await graphQL<{ createProduct: BackendProduct }>(
    `
      mutation CreateProduct($input: ProductInput!) {
        createProduct(input: $input) {
          id
          name
          description
          price
          imageUrl
          available
          categoryId
        }
      }
    `,
    {
      input: {
        name: input.name,
        description: input.description,
        price: input.price,
        imageUrl: input.image,
        categoryId: input.category,
      },
    }
  );

  return toProduct(data.createProduct);
}

export async function setProductAvailability(id: string, available: boolean) {
  await graphQL(
    `
      mutation UpdateAvailability($id: ID!, $available: Boolean!) {
        updateProductAvailability(id: $id, available: $available) {
          id
        }
      }
    `,
    { id, available }
  );
}

export async function loginCustomer(email: string, password: string): Promise<ApiUser | null> {
  const data = await graphQL<{ authenticate: { ok: boolean; userId: string; profile: string } }>(
    `
      mutation Login($input: AuthInput!) {
        authenticate(input: $input) {
          ok
          userId
          profile
        }
      }
    `,
    { input: { email, password } }
  );

  if (!data.authenticate.ok) {
    return null;
  }

  const customers = await fetchCustomers();
  const customer = customers.find((item) => item.id === data.authenticate.userId);

  return {
    id: data.authenticate.userId,
    name: customer?.fullName ?? email,
    email,
    role: data.authenticate.profile === 'ADMIN' ? 'admin' : 'cliente',
    phone: customer?.phone,
  };
}

export async function registerCustomer(input: RegisterCustomerInput): Promise<ApiUser> {
  const data = await graphQL<{ createCustomer: { id: string; fullName: string; email: string; phone: string } }>(
    `
      mutation Register($input: CustomerInput!) {
        createCustomer(input: $input) {
          id
          fullName
          email
          phone
        }
      }
    `,
    {
      input: {
        run: input.run,
        fullName: input.fullName,
        address: 'Pendiente',
        commune: 'Santiago Centro',
        province: 'Santiago',
        region: 'Metropolitana',
        birthDate: '1990-01-01',
        sex: 'No informado',
        email: input.email,
        phone: input.phone,
        password: input.password,
      },
    }
  );

  return {
    id: data.createCustomer.id,
    name: data.createCustomer.fullName,
    email: data.createCustomer.email,
    role: 'cliente',
    phone: data.createCustomer.phone,
  };
}

export async function fetchCustomers() {
  const data = await graphQL<{ customers: BackendCustomer[] }>(`
    query Customers {
      customers {
        id
        email
        fullName
        phone
      }
    }
  `);

  return data.customers;
}

export async function createCheckoutOrder(input: CheckoutOrderInput) {
  const data = await graphQL<{ createOrder: BackendOrder }>(
    `
      mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
          id
          customerId
          createdAt
          status
          deliveryAddress
          distanceKm
          total
          items {
            productId
            quantity
            unitPrice
            subtotal
          }
        }
      }
    `,
    {
      input: {
        customerId: input.customerId,
        deliveryAddress: input.deliveryAddress,
        distanceKm: input.distanceKm,
        items: input.items,
      },
    }
  );

  if (input.paymentMethod === 'card') {
    await graphQL(
      `
        mutation ConfirmPayment($orderId: ID!, $platform: String!, $token: String!) {
          confirmPayment(orderId: $orderId, externalPlatform: $platform, transactionToken: $token) {
            id
            status
          }
        }
      `,
      {
        orderId: data.createOrder.id,
        platform: 'WEB_CHECKOUT',
        token: `web-${data.createOrder.id}-${Date.now()}`,
      }
    );

    return { ...data.createOrder, status: 'PAGADO' };
  }

  return data.createOrder;
}

export async function fetchOrders() {
  const data = await graphQL<{ orders: BackendOrder[] }>(`
    query Orders {
      orders {
        id
        customerId
        createdAt
        status
        deliveryAddress
        distanceKm
        total
        items {
          productId
          quantity
          unitPrice
          subtotal
          product {
            id
            name
            description
            price
            imageUrl
            categoryId
          }
        }
      }
    }
  `);

  return data.orders;
}

function toProduct(product: BackendProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.imageUrl,
    category: product.categoryId,
  };
}

function categoryIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes('roll')) return '🍣';
  if (normalized.includes('nigiri')) return '🍤';
  if (normalized.includes('sashimi')) return '🐟';
  if (normalized.includes('combo') || normalized.includes('tabla')) return '🎁';
  if (normalized.includes('temaki')) return '🌯';
  if (normalized.includes('entrada')) return '🥟';
  if (normalized.includes('veget')) return '🥬';

  return '🍱';
}
