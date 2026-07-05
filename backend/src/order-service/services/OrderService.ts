import { randomUUID } from "node:crypto";
import { LineaPedido, Pago, Pedido, Venta } from "../domain/Order.js";
import type { OrderPersistenceRepository } from "../repositories/OrderRepository.js";
import type { CatalogClient } from "./CatalogClient.js";

export type CreateOrderRequest = {
  customerId: string;
  deliveryAddress: string;
  distanceKm: number;
  items: Array<{ productId: string; quantity: number }>;
};

export type OrderSnapshot = {
  id: string;
  customerId: string;
  createdAt: string;
  status: string;
  cancellationReason: string;
  deliveryAddress: string;
  distanceKm: number;
  total: number;
  items: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>;
};

export class OrderService {
  constructor(
    private readonly repository: OrderPersistenceRepository,
    private readonly catalogClient: CatalogClient
  ) {}

  async createOrder(input: CreateOrderRequest): Promise<OrderSnapshot> {
    this.require(input.customerId, "El cliente es obligatorio.");
    this.require(input.deliveryAddress, "La direccion de entrega es obligatoria.");
    if (input.distanceKm > 3) {
      throw new Error("El despacho solo esta disponible dentro de un radio de 3 km.");
    }
    if (!input.items || input.items.length === 0) {
      throw new Error("El pedido debe tener al menos un producto.");
    }

    const lines: LineaPedido[] = [];
    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error("La cantidad debe ser mayor a cero.");
      }
      const product = await this.catalogClient.getProduct(item.productId);
      if (!product.available) {
        throw new Error(`El producto ${product.name} no esta disponible.`);
      }
      lines.push(new LineaPedido(product.id, item.quantity, product.price));
    }

    const order = new Pedido(
      randomUUID(),
      input.customerId,
      new Date().toISOString(),
      "CREADO",
      "",
      input.deliveryAddress,
      input.distanceKm,
      lines
    );

    return toOrderSnapshot(await this.repository.saveOrder(order));
  }

  async confirmPayment(orderId: string, externalPlatform: string, transactionToken: string): Promise<Pago> {
    this.require(externalPlatform, "La plataforma de pago es obligatoria.");
    this.require(transactionToken, "El token de transaccion es obligatorio.");
    const order = await this.getOrderEntity(orderId);
    const paidOrder = await this.repository.saveOrder(order.confirmPayment());
    const payment = await this.repository.savePayment(
      new Pago(randomUUID(), paidOrder.id, externalPlatform, transactionToken, "APROBADO")
    );
    await this.repository.saveSale(
      new Venta(randomUUID(), paidOrder.id, "CAJERO_VIRTUAL", new Date().toISOString(), paidOrder.total)
    );
    return payment;
  }

  async cancelOrder(orderId: string, reason: string): Promise<OrderSnapshot> {
    const order = await this.getOrderEntity(orderId);
    return toOrderSnapshot(await this.repository.saveOrder(order.cancel(reason)));
  }

  async getOrder(id: string): Promise<OrderSnapshot> {
    return toOrderSnapshot(await this.getOrderEntity(id));
  }

  async listOrders(): Promise<OrderSnapshot[]> {
    return (await this.repository.listOrders()).map(toOrderSnapshot);
  }

  async getSalesReport(from: string, to: string) {
    const fromDate = from ? new Date(from) : new Date("1970-01-01");
    const toDate = to ? new Date(to) : new Date("2999-12-31");
    const paidOrders = (await this.repository.listOrders())
      .filter((order) => order.status === "PAGADO")
      .filter((order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= fromDate && createdAt <= toDate;
      });

    return {
      totalSales: paidOrders.length,
      totalAmount: paidOrders.reduce((sum, order) => sum + order.total, 0),
      orders: paidOrders.map(toOrderSnapshot)
    };
  }

  private async getOrderEntity(id: string): Promise<Pedido> {
    const order = await this.repository.findOrderById(id);
    if (!order) {
      throw new Error("Pedido no encontrado.");
    }
    return order;
  }

  private require(value: string, message: string) {
    if (!value || value.trim().length === 0) {
      throw new Error(message);
    }
  }
}

export function toOrderSnapshot(order: Pedido): OrderSnapshot {
  return {
    id: order.id,
    customerId: order.customerId,
    createdAt: order.createdAt,
    status: order.status,
    cancellationReason: order.cancellationReason,
    deliveryAddress: order.deliveryAddress,
    distanceKm: order.distanceKm,
    total: order.total,
    items: order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.calculateSubtotal()
    }))
  };
}
