import { randomUUID } from "node:crypto";
import type { Order as PrismaOrder, OrderItem as PrismaOrderItem, PrismaClient, Sale, Payment } from "@prisma/client";
import { LineaPedido, Pago, Pedido, Venta, type OrderStatus } from "../domain/Order.js";
import type { OrderPersistenceRepository } from "./OrderRepository.js";

type OrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

export class PrismaOrderRepository implements OrderPersistenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveOrder(order: Pedido): Promise<Pedido> {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.upsert({
        where: { id: order.id },
        update: {
          customerId: order.customerId,
          createdAt: new Date(order.createdAt),
          status: order.status,
          cancellationReason: order.cancellationReason,
          deliveryAddress: order.deliveryAddress,
          distanceKm: order.distanceKm
        },
        create: {
          id: order.id,
          customerId: order.customerId,
          createdAt: new Date(order.createdAt),
          status: order.status,
          cancellationReason: order.cancellationReason,
          deliveryAddress: order.deliveryAddress,
          distanceKm: order.distanceKm
        }
      });

      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      await tx.orderItem.createMany({
        data: order.items.map((item) => ({
          id: randomUUID(),
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });
    });

    return order;
  }

  async findOrderById(id: string): Promise<Pedido | undefined> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
    return order ? toOrder(order) : undefined;
  }

  async listOrders(): Promise<Pedido[]> {
    const orders = await this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "asc" }
    });
    return orders.map(toOrder);
  }

  async savePayment(payment: Pago): Promise<Pago> {
    await this.prisma.payment.upsert({
      where: { id: payment.id },
      update: {
        orderId: payment.orderId,
        externalPlatform: payment.externalPlatform,
        transactionToken: payment.transactionToken,
        status: payment.status
      },
      create: {
        id: payment.id,
        orderId: payment.orderId,
        externalPlatform: payment.externalPlatform,
        transactionToken: payment.transactionToken,
        status: payment.status
      }
    });
    return payment;
  }

  async saveSale(sale: Venta): Promise<Venta> {
    await this.prisma.sale.upsert({
      where: { id: sale.id },
      update: {
        orderId: sale.orderId,
        virtualCashierRole: sale.virtualCashierRole,
        soldAt: new Date(sale.soldAt),
        amount: sale.amount
      },
      create: {
        id: sale.id,
        orderId: sale.orderId,
        virtualCashierRole: sale.virtualCashierRole,
        soldAt: new Date(sale.soldAt),
        amount: sale.amount
      }
    });
    return sale;
  }
}

function toOrder(order: OrderWithItems): Pedido {
  return new Pedido(
    order.id,
    order.customerId,
    order.createdAt.toISOString(),
    order.status as OrderStatus,
    order.cancellationReason,
    order.deliveryAddress,
    order.distanceKm,
    order.items.map((item) => new LineaPedido(item.productId, item.quantity, item.unitPrice))
  );
}
